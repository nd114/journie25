import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://0.0.0.0:3000",
      "http://localhost:5000",
      "http://0.0.0.0:5000",
      process.env.REPL_SLUG
        ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
        : "",
    ],
    credentials: true,
  }),
);
app.use(express.json());

// In-memory cache implementation with TTL
interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  set<T>(key: string, value: T, ttlMs: number): void {
    const expiry = Date.now() + ttlMs;
    this.cache.set(key, { data: value, expiry });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  invalidate(key: string): void {
    this.cache.delete(key);
  }

  invalidatePattern(pattern: string): void {
    const keys = Array.from(this.cache.keys());
    for (const key of keys) {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// Cache TTL constants (in milliseconds)
const CACHE_TTL = {
  TRENDING_PAPERS: 5 * 60 * 1000, // 5 minutes
  PAPER_DETAILS: 2 * 60 * 1000,   // 2 minutes
  USER_PROFILE: 5 * 60 * 1000,    // 5 minutes
};

// Cache invalidation helpers
const invalidatePaperCache = (paperId: number) => {
  cache.invalidate(`paper:${paperId}`);
  cache.invalidate('trending:papers');
  cache.invalidatePattern('papers:list');
};

const invalidateUserCache = (userId: number) => {
  cache.invalidate(`user:${userId}`);
};

// Middleware to verify JWT token
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.user = user;
    next();
  });
};

// Auth endpoints
app.post("/api/auth/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Server-side password validation
    if (!password || password.length < 8) {
      return res
        .status(400)
        .json({ error: "Password must be at least 8 characters long" });
    }

    const existingUser = await storage.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await hash(password, 10);
    const user = await storage.createUser({
      email,
      password: hashedPassword,
      name,
    });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Registration failed" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.json({
      user: { id: user.id, email: user.email, name: user.name },
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    // Try to get from cache first
    const cacheKey = `user:${req.user.id}`;
    const cachedUser = cache.get(cacheKey);
    if (cachedUser) {
      return res.json(cachedUser);
    }
    
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      orcid: user.orcid,
      affiliation: user.affiliation,
      bio: user.bio,
    };
    
    // Cache user profile
    cache.set(cacheKey, userData, CACHE_TTL.USER_PROFILE);
    
    // Add cache control headers
    res.set('Cache-Control', 'private, max-age=300'); // 5 minutes
    
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

app.put("/api/auth/profile", authenticateToken, async (req: any, res) => {
  try {
    const { name, orcid, affiliation, bio } = req.body;
    const user = await storage.updateUser(req.user.id, {
      name,
      orcid,
      affiliation,
      bio,
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Invalidate user cache after update
    invalidateUserCache(req.user.id);
    
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      orcid: user.orcid,
      affiliation: user.affiliation,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.post(
  "/api/auth/change-password",
  authenticateToken,
  async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      // Server-side password validation
      if (!newPassword || newPassword.length < 8) {
        return res
          .status(400)
          .json({ error: "Password must be at least 8 characters long" });
      }

      const user = await storage.getUser(req.user.id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const isValidPassword = await compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Current password is incorrect" });
      }

      const hashedPassword = await hash(newPassword, 10);
      await storage.updateUser(req.user.id, { password: hashedPassword });

      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to change password" });
    }
  },
);

// Paper endpoints
app.get("/api/papers", async (req, res) => {
  try {
    const { search, field, page = 1, limit = 20 } = req.query;
    // Public endpoint - only return published papers by default
    const result = await storage.getPapers({
      search: search as string,
      isPublished: true,
      field: field as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });
    
    // Add pagination metadata for frontend optimization
    res.set('X-Total-Count', result.total.toString());
    res.set('X-Page', result.page.toString());
    res.set('X-Total-Pages', result.totalPages.toString());
    res.set('Cache-Control', 'public, max-age=120');
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// Advanced search endpoint
app.get("/api/papers/search/advanced", async (req, res) => {
  try {
    const {
      query,
      author,
      field,
      startDate,
      endDate,
      sortBy = 'relevance',
      order = 'desc',
      page = 1,
      limit = 20
    } = req.query;

    const papers = await storage.advancedSearchPapers({
      query: query as string,
      author: author as string,
      field: field as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      order: order as 'asc' | 'desc',
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json(papers);
  } catch (error) {
    console.error("Error in advanced search:", error);
    res.status(500).json({ error: "Failed to perform advanced search" });
  }
});

// Get trending papers (must be before :id route)
app.get("/api/papers/trending", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `trending:papers:${limit}`;
    
    // Try to get from cache first
    const cachedPapers = cache.get(cacheKey);
    if (cachedPapers) {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.json(cachedPapers);
    }
    
    const papers = await storage.getTrendingPapers(parseInt(limit as string));
    
    // Cache trending papers
    cache.set(cacheKey, papers, CACHE_TTL.TRENDING_PAPERS);
    
    // Add CDN-ready headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.json(papers);
  } catch (error) {
    console.error("Error fetching trending papers:", error);
    res.status(500).json({ error: "Failed to fetch trending papers" });
  }
});

app.get("/api/papers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const paperId = parseInt(id);
    
    // Try to get from cache first
    const cacheKey = `paper:${paperId}`;
    const cachedPaper = cache.get(cacheKey);
    if (cachedPaper) {
      return res.json(cachedPaper);
    }
    
    const paper = await storage.getPaper(paperId);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Only return published papers to public, or drafts to their creator
    if (!paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Cache published papers
    cache.set(cacheKey, paper, CACHE_TTL.PAPER_DETAILS);
    
    // Add CDN-ready headers
    res.set('Cache-Control', 'public, max-age=120'); // 2 minutes
    res.set('ETag', `W/"${paper.id}-${paper.updatedAt?.getTime() || paper.createdAt.getTime()}"`);
    
    res.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

app.post("/api/papers", authenticateToken, async (req: any, res) => {
  try {
    const { title, abstract, content, authors, researchField, keywords } =
      req.body;

    const paper = await storage.createPaper({
      title,
      abstract,
      content: content || "",
      authors: authors || [],
      authorIds: [req.user.id],
      researchField: researchField || "",
      fieldIds: [],
      keywords: keywords || [],
      createdBy: req.user.id,
      status: "draft",
    });

    res.json(paper);
  } catch (error) {
    console.error("Error creating paper:", error);
    res.status(500).json({ error: "Failed to create paper" });
  }
});

app.put("/api/papers/:id", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const existingPaper = await storage.getPaper(paperId);

    if (!existingPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Check authorization: user must be the creator
    if (existingPaper.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to update this paper" });
    }

    // Handle publishing logic: ignore isPublished/publishedAt from client, derive from status
    const updates = { ...req.body };
    // Strip client-provided isPublished/publishedAt to prevent bypass
    delete updates.isPublished;
    delete updates.publishedAt;

    const isNewlyPublished =
      updates.status === "published" && !existingPaper.isPublished;

    if (isNewlyPublished) {
      updates.isPublished = true;
      updates.publishedAt = new Date();

      // Increment version number (defensive against undefined)
      const newVersion = (existingPaper.version || 0) + 1;
      updates.version = newVersion;

      // Save version snapshot when publishing
      await storage.createPaperVersion({
        paperId: paperId,
        version: newVersion,
        title: updates.title || existingPaper.title,
        abstract: updates.abstract || existingPaper.abstract,
        content: updates.content || existingPaper.content,
        pdfUrl: updates.pdfUrl || existingPaper.pdfUrl,
        createdBy: req.user.id,
      });
    } else if (updates.status === "draft") {
      updates.isPublished = false;
    }

    const paper = await storage.updatePaper(paperId, updates);
    
    // Invalidate cache after update
    invalidatePaperCache(paperId);
    
    res.json(paper);
  } catch (error) {
    console.error("Error updating paper:", error);
    res.status(500).json({ error: "Failed to update paper" });
  }
});

app.delete("/api/papers/:id", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const existingPaper = await storage.getPaper(paperId);

    if (!existingPaper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Check authorization: user must be the creator
    if (existingPaper.createdBy !== req.user.id) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this paper" });
    }

    await storage.deletePaper(paperId);
    
    // Invalidate cache after delete
    invalidatePaperCache(paperId);
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete paper" });
  }
});

// Comment endpoints
app.get("/api/papers/:id/comments", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    // Check if paper is published before showing comments
    const paper = await storage.getPaper(paperId);
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const comments = await storage.getComments(paperId);
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post(
  "/api/papers/:id/comments",
  authenticateToken,
  async (req: any, res) => {
    try {
      const paperId = parseInt(req.params.id);
      // Check if paper is published before allowing comments
      const paper = await storage.getPaper(paperId);
      if (!paper || !paper.isPublished) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const { content, parentId } = req.body;
      const comment = await storage.createComment({
        paperId,
        userId: req.user.id,
        content,
        parentId: parentId || null,
      });
      
      // Create notification for paper author if not commenting on own paper
      if (paper.createdBy !== req.user.id) {
        const commenterUser = await storage.getUser(req.user.id);
        if (commenterUser) {
          await createAndBroadcastNotification({
            userId: paper.createdBy,
            type: 'new_comment',
            title: 'New Comment',
            message: `${commenterUser.name} commented on your paper "${paper.title}"`,
            entityType: 'paper',
            entityId: paperId,
          });
        }
      }
      
      res.json(comment);
    } catch (error) {
      res.status(500).json({ error: "Failed to create comment" });
    }
  },
);

// Review endpoints
app.get("/api/papers/:id/reviews", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    // Check if paper is published before showing reviews
    const paper = await storage.getPaper(paperId);
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const reviews = await storage.getReviews(paperId);
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post(
  "/api/papers/:id/reviews",
  authenticateToken,
  async (req: any, res) => {
    try {
      const paperId = parseInt(req.params.id);
      // Check if paper is published before allowing reviews
      const paper = await storage.getPaper(paperId);
      if (!paper || !paper.isPublished) {
        return res.status(404).json({ error: "Paper not found" });
      }

      const { content, rating, recommendation } = req.body;
      const review = await storage.createReview({
        paperId,
        userId: req.user.id,
        content,
        rating,
        recommendation,
        isPublic: true,
      });
      res.json(review);
    } catch (error) {
      res.status(500).json({ error: "Failed to create review" });
    }
  },
);

// Version history endpoint
app.get("/api/papers/:id/versions", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    // Check if paper is published before showing version history
    const paper = await storage.getPaper(paperId);
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const versions = await storage.getPaperVersions(paperId);
    res.json(versions);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch versions" });
  }
});

// Citation generation endpoint
app.get("/api/papers/:id/cite", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const format = (req.query.format as string) || 'apa';
    
    const paper = await storage.getPaper(paperId);
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const { generateAPA, generateMLA, generateChicago, generateBibTeX, generateEndNote } = await import("./citations");
    
    const citationData = {
      title: paper.title,
      authors: Array.isArray(paper.authors) ? paper.authors : [],
      year: paper.publishedAt ? new Date(paper.publishedAt).getFullYear() : undefined,
      doi: paper.doi || undefined,
      publishedAt: paper.publishedAt || undefined,
    };

    let citation;
    switch (format.toLowerCase()) {
      case 'mla':
        citation = generateMLA(citationData);
        break;
      case 'chicago':
        citation = generateChicago(citationData);
        break;
      case 'bibtex':
        citation = generateBibTeX(citationData);
        break;
      case 'endnote':
        citation = generateEndNote(citationData);
        break;
      default:
        citation = generateAPA(citationData);
    }

    res.json({ format, citation });
  } catch (error) {
    console.error("Error generating citation:", error);
    res.status(500).json({ error: "Failed to generate citation" });
  }
});

// Compare paper versions
app.get("/api/papers/:id/versions/compare", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const v1 = parseInt(req.query.v1 as string);
    const v2 = parseInt(req.query.v2 as string);

    const versions = await storage.getPaperVersions(paperId);
    const version1 = versions.find(v => v.version === v1);
    const version2 = versions.find(v => v.version === v2);

    if (!version1 || !version2) {
      return res.status(404).json({ error: "Version not found" });
    }

    res.json({
      version1,
      version2,
      differences: {
        title: version1.title !== version2.title,
        abstract: version1.abstract !== version2.abstract,
        content: version1.content !== version2.content,
      }
    });
  } catch (error) {
    console.error("Error comparing versions:", error);
    res.status(500).json({ error: "Failed to compare versions" });
  }
});

// Restore paper to specific version
app.post("/api/papers/:id/versions/:versionId/restore", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const versionId = parseInt(req.params.versionId);

    const paper = await storage.getPaper(paperId);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    const versions = await storage.getPaperVersions(paperId);
    const versionToRestore = versions.find(v => v.id === versionId);

    if (!versionToRestore) {
      return res.status(404).json({ error: "Version not found" });
    }

    // Create a new version with current state before restoring
    await storage.createPaperVersion({
      paperId,
      version: paper.version + 1,
      title: paper.title,
      abstract: paper.abstract,
      content: paper.content || '',
      pdfUrl: paper.pdfUrl || '',
      createdBy: req.user.id,
    });

    // Restore to the selected version
    const updated = await storage.updatePaper(paperId, {
      title: versionToRestore.title,
      abstract: versionToRestore.abstract,
      content: versionToRestore.content,
      version: paper.version + 2,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error restoring version:", error);
    res.status(500).json({ error: "Failed to restore version" });
  }
});

// Phase 2: Analytics and Research Stories endpoints

// Track paper views
app.post("/api/papers/:id/view", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const { sessionId, readTime } = req.body;

    // Get user ID if authenticated
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (err) {
        // Anonymous view
      }
    }

    // Record view
    await storage.recordPaperView({
      paperId,
      userId,
      sessionId,
      readTime,
    });

    // Update view count
    await storage.incrementPaperViews(paperId);

    res.json({ success: true });
  } catch (error) {
    console.error("Error recording view:", error);
    res.status(500).json({ error: "Failed to record view" });
  }
});

// Get paper insights
app.get("/api/papers/:id/insights", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const insights = await storage.getPaperInsights(paperId);
    res.json(insights);
  } catch (error) {
    console.error("Error fetching insights:", error);
    res.status(500).json({ error: "Failed to fetch insights" });
  }
});

// Get recommendations for user
app.get("/api/recommendations", authenticateToken, async (req: any, res) => {
  try {
    const { limit = 5 } = req.query;
    const recommendations = await storage.getUserRecommendations(
      req.user.id,
      parseInt(limit as string),
    );
    res.json(recommendations);
  } catch (error) {
    console.error("Error fetching recommendations:", error);
    res.status(500).json({ error: "Failed to fetch recommendations" });
  }
});

// Get cross-field connections
app.get("/api/papers/:id/connections", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const connections = await storage.getCrossFieldConnections(paperId);
    res.json(connections);
  } catch (error) {
    console.error("Error fetching connections:", error);
    res.status(500).json({ error: "Failed to fetch connections" });
  }
});

// Record user interaction
app.post("/api/interactions", authenticateToken, async (req: any, res) => {
  try {
    const { paperId, interactionType, metadata } = req.body;
    await storage.recordUserInteraction({
      userId: req.user.id,
      paperId,
      interactionType,
      metadata: metadata || {},
    });
    res.json({ success: true });
  } catch (error) {
    console.error("Error recording interaction:", error);
    res.status(500).json({ error: "Failed to record interaction" });
  }
});

// Get trending topics
app.get("/api/trending-topics", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const cacheKey = `trending:topics:${limit}`;
    
    // Try to get from cache first
    const cachedTopics = cache.get(cacheKey);
    if (cachedTopics) {
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
      return res.json(cachedTopics);
    }
    
    const topics = await storage.getTrendingTopics(parseInt(limit as string));
    
    // Cache trending topics
    cache.set(cacheKey, topics, CACHE_TTL.TRENDING_PAPERS);
    
    // Add CDN-ready headers
    res.set('Cache-Control', 'public, max-age=300'); // 5 minutes
    
    res.json(topics);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    res.status(500).json({ error: "Failed to fetch trending topics" });
  }
});

// Communities endpoints
// Communities API endpoints
app.get("/api/communities", async (req, res) => {
  try {
    const category = req.query.category as string;

    // Get user ID if authenticated
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];
    let userId = null;

    if (token) {
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
      } catch (err) {
        // Not authenticated, continue as anonymous
      }
    }

    const communitiesData = await storage.getCommunities(userId, category);
    res.json(communitiesData);
  } catch (error) {
    console.error("Error fetching communities:", error);
    res.status(500).json({ error: "Failed to fetch communities" });
  }
});

app.post("/api/communities", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res
        .status(400)
        .json({ error: "Name, description, and category are required" });
    }

    const community = await storage.createCommunity({
      name,
      description,
      category,
    });

    // Automatically join the creator to the community
    await storage.joinCommunity(userId, community.id);

    res.status(201).json({ ...community, isJoined: true });
  } catch (error) {
    console.error("Error creating community:", error);
    res.status(500).json({ error: "Failed to create community" });
  }
});

app.post("/api/communities/:id/join", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const communityId = parseInt(req.params.id);

    await storage.joinCommunity(userId, communityId);
    res.json({ message: "Successfully joined community" });
  } catch (error) {
    console.error("Error joining community:", error);
    res.status(500).json({ error: "Failed to join community" });
  }
});

app.post("/api/communities/:id/leave", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const communityId = parseInt(req.params.id);

    await storage.leaveCommunity(userId, communityId);
    res.json({ message: "Successfully left community" });
  } catch (error) {
    console.error("Error leaving community:", error);
    res.status(500).json({ error: "Failed to leave community" });
  }
});

// Trending Research API
app.get("/api/trending", async (req, res) => {
  try {
    const trendingData = await storage.getTrendingTopics();
    res.json(trendingData);
  } catch (error) {
    console.error("Error fetching trending data:", error);
    res.status(500).json({ error: "Failed to fetch trending data" });
  }
});

// Learning Paths API
app.get("/api/learning-paths", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paths = await storage.getLearningPaths(userId);
    res.json(paths);
  } catch (error) {
    console.error("Error fetching learning paths:", error);
    res.status(500).json({ error: "Failed to fetch learning paths" });
  }
});

app.post(
  "/api/learning-paths/:id/complete-step",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const pathId = parseInt(req.params.id);
      const { stepId } = req.body;

      await storage.completeLearningStep(userId, pathId, stepId);
      res.json({ message: "Step completed successfully" });
    } catch (error) {
      console.error("Error completing step:", error);
      res.status(500).json({ error: "Failed to complete step" });
    }
  },
);

// Research Tools API
app.get("/api/research-tools", async (req, res) => {
  try {
    const tools = await storage.getResearchTools();
    res.json(tools);
  } catch (error) {
    console.error("Error fetching research tools:", error);
    res.status(500).json({ error: "Failed to fetch research tools" });
  }
});

// Bookmarks API
app.get("/api/bookmarks", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bookmarks = await storage.getUserBookmarks(userId);
    res.json(bookmarks);
  } catch (error) {
    console.error("Error fetching bookmarks:", error);
    res.status(500).json({ error: "Failed to fetch bookmarks" });
  }
});

app.post("/api/bookmarks/:paperId", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paperId = parseInt(req.params.paperId);

    await storage.addBookmark(userId, paperId);
    res.json({ message: "Bookmark added successfully" });
  } catch (error) {
    console.error("Error adding bookmark:", error);
    res.status(500).json({ error: "Failed to add bookmark" });
  }
});

app.delete("/api/bookmarks/:paperId", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paperId = parseInt(req.params.paperId);

    await storage.removeBookmark(userId, paperId);
    res.json({ message: "Bookmark removed successfully" });
  } catch (error) {
    console.error("Error removing bookmark:", error);
    res.status(500).json({ error: "Failed to remove bookmark" });
  }
});

// User dashboard data
app.get("/api/user/dashboard", authenticateToken, async (req: any, res) => {
  try {
    const data = await storage.getUserDashboardData(req.user.id);
    res.json(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    res.status(500).json({ error: "Failed to fetch dashboard data" });
  }
});

// Phase 3: Gamification and Creator Tools endpoints

// Get user progress and quests
app.get("/api/user/progress", authenticateToken, async (req: any, res) => {
  try {
    const progress = await storage.getUserProgress(req.user.id);
    res.json(progress);
  } catch (error) {
    console.error("Error fetching user progress:", error);
    res.status(500).json({ error: "Failed to fetch user progress" });
  }
});

// Update quest progress
app.post(
  "/api/user/quest-progress",
  authenticateToken,
  async (req: any, res) => {
    try {
      const { questId, action } = req.body;
      const progress = await storage.updateQuestProgress(
        req.user.id,
        questId,
        action,
      );
      res.json(progress);
    } catch (error) {
      console.error("Error updating quest progress:", error);
      res.status(500).json({ error: "Failed to update quest progress" });
    }
  },
);

// Get user achievements
app.get("/api/user/achievements", authenticateToken, async (req: any, res) => {
  try {
    const achievements = await storage.getUserAchievements(req.user.id);
    res.json(achievements);
  } catch (error) {
    console.error("Error fetching achievements:", error);
    res.status(500).json({ error: "Failed to fetch achievements" });
  }
});

// Save visual abstract
app.post(
  "/api/papers/:id/visual-abstract",
  authenticateToken,
  async (req: any, res) => {
    try {
      const paperId = parseInt(req.params.id);
      const { elements, canvasStyle } = req.body;

      const visualAbstract = await storage.saveVisualAbstract({
        paperId,
        userId: req.user.id,
        elements,
        canvasStyle,
      });

      res.json(visualAbstract);
    } catch (error) {
      console.error("Error saving visual abstract:", error);
      res.status(500).json({ error: "Failed to save visual abstract" });
    }
  },
);

// Get visual abstract
app.get("/api/papers/:id/visual-abstract", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const visualAbstract = await storage.getVisualAbstract(paperId);
    res.json(visualAbstract);
  } catch (error) {
    console.error("Error fetching visual abstract:", error);
    res.status(500).json({ error: "Failed to fetch visual abstract" });
  }
});

// Generate multi-level content
app.post(
  "/api/papers/:id/generate-levels",
  authenticateToken,
  async (req: any, res) => {
    try {
      const paperId = parseInt(req.params.id);
      const levels = await storage.generateMultiLevelContent(paperId);
      res.json(levels);
    } catch (error) {
      console.error("Error generating multi-level content:", error);
      res.status(500).json({ error: "Failed to generate multi-level content" });
    }
  },
);

// Follow/Unfollow User endpoints
app.post("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const followingId = parseInt(req.params.id);

    if (userId === followingId) {
      return res.status(400).json({ error: "Cannot follow yourself" });
    }

    // Check if user exists
    const targetUser = await storage.getUser(followingId);
    if (!targetUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await storage.followUser(userId, followingId);
    
    // Create notification for the followed user
    const followerUser = await storage.getUser(userId);
    if (followerUser) {
      await createAndBroadcastNotification({
        userId: followingId,
        type: 'new_follower',
        title: 'New Follower',
        message: `${followerUser.name} started following you`,
        entityType: 'user',
        entityId: userId,
      });
    }
    
    res.json({ message: "Successfully followed user" });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ error: "Failed to follow user" });
  }
});

app.delete("/api/users/:id/follow", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const followingId = parseInt(req.params.id);

    await storage.unfollowUser(userId, followingId);
    res.json({ message: "Successfully unfollowed user" });
  } catch (error) {
    console.error("Error unfollowing user:", error);
    res.status(500).json({ error: "Failed to unfollow user" });
  }
});

app.get("/api/users/:id/followers", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followers = await storage.getUserFollowers(userId);
    res.json(followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ error: "Failed to fetch followers" });
  }
});

app.get("/api/users/:id/following", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const following = await storage.getUserFollowing(userId);
    res.json(following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ error: "Failed to fetch following" });
  }
});

app.get(
  "/api/users/:targetId/following-status",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const targetId = parseInt(req.params.targetId);
      const isFollowing = await storage.isFollowing(userId, targetId);
      res.json({ following: isFollowing });
    } catch (error) {
      console.error("Error checking follow status:", error);
      res.status(500).json({ error: "Failed to check follow status" });
    }
  },
);

// Activity Feed endpoint
app.get("/api/feed", authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await storage.getUserActivityFeed(userId, limit);
    res.json(activities);
  } catch (error) {
    console.error("Error fetching activity feed:", error);
    res.status(500).json({ error: "Failed to fetch activity feed" });
  }
});

// Check if paper is bookmarked
app.get(
  "/api/bookmarks/:paperId/check",
  authenticateToken,
  async (req, res) => {
    try {
      const userId = (req as any).user.id;
      const paperId = parseInt(req.params.paperId);
      const isBookmarked = await storage.isBookmarked(userId, paperId);
      res.json({ isBookmarked });
    } catch (error) {
      console.error("Error checking bookmark status:", error);
      res.status(500).json({ error: "Failed to check bookmark status" });
    }
  },
);

// Author claim endpoints
app.get("/api/user/potential-claims", authenticateToken, async (req: any, res) => {
  try {
    const { getPotentialClaims } = await import("./author-claim");
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const claims = await getPotentialClaims(req.user.id, user.name);
    res.json(claims);
  } catch (error) {
    console.error("Error fetching potential claims:", error);
    res.status(500).json({ error: "Failed to fetch potential claims" });
  }
});

app.post("/api/user/claim-authorship", authenticateToken, async (req: any, res) => {
  try {
    const { claimAuthorshipByName } = await import("./author-claim");
    const { authorName, orcid } = req.body;

    if (!authorName) {
      return res.status(400).json({ error: "Author name is required" });
    }

    const result = await claimAuthorshipByName(req.user.id, authorName, orcid);
    res.json(result);
  } catch (error) {
    console.error("Error claiming authorship:", error);
    res.status(500).json({ error: "Failed to claim authorship" });
  }
});

// Peer review endpoints
app.post("/api/papers/:id/request-review", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const paper = await storage.getPaper(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to request review for this paper" });
    }

    await storage.updateReviewStatus(paperId, "in_review");
    res.json({ success: true, message: "Review requested successfully" });
  } catch (error) {
    console.error("Error requesting review:", error);
    res.status(500).json({ error: "Failed to request review" });
  }
});

app.post("/api/papers/:id/assign-reviewer", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const { reviewerId, deadline, isBlind } = req.body;

    if (!reviewerId) {
      return res.status(400).json({ error: "Reviewer ID is required" });
    }

    const paper = await storage.getPaper(paperId);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to assign reviewers for this paper" });
    }

    const assignment = await storage.createReviewAssignment({
      paperId,
      reviewerId,
      deadline: deadline ? new Date(deadline) : undefined,
      isBlind: isBlind || false,
      assignedBy: req.user.id,
    });

    // Create notification for reviewer
    await createAndBroadcastNotification({
      userId: reviewerId,
      type: 'review_assignment',
      title: 'New Peer Review Assignment',
      message: `You have been assigned to review "${paper.title}"`,
      entityType: 'paper',
      entityId: paperId,
    });

    res.json(assignment);
  } catch (error) {
    console.error("Error assigning reviewer:", error);
    res.status(500).json({ error: "Failed to assign reviewer" });
  }
});

app.get("/api/reviews/assignments", authenticateToken, async (req: any, res) => {
  try {
    const assignments = await storage.getReviewAssignments(req.user.id);
    res.json(assignments);
  } catch (error) {
    console.error("Error fetching review assignments:", error);
    res.status(500).json({ error: "Failed to fetch review assignments" });
  }
});

app.post("/api/reviews/:assignmentId/submit", authenticateToken, async (req: any, res) => {
  try {
    const assignmentId = parseInt(req.params.assignmentId);
    const { rating, recommendation, comments } = req.body;

    if (!rating || !recommendation || !comments) {
      return res.status(400).json({ error: "Rating, recommendation, and comments are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: "Rating must be between 1 and 5" });
    }

    const validRecommendations = ["accept", "revise", "reject"];
    if (!validRecommendations.includes(recommendation)) {
      return res.status(400).json({ error: "Invalid recommendation. Must be accept, revise, or reject" });
    }

    const submission = await storage.submitPeerReview(assignmentId, {
      rating,
      recommendation,
      comments,
    });

    // Get assignment details to notify paper author
    const assignments = await storage.getReviewAssignments(req.user.id);
    const assignment = assignments.find((a: any) => a.id === assignmentId);
    
    if (assignment) {
      const paper = await storage.getPaper(assignment.paperId);
      if (paper) {
        // Create notification for paper author
        await createAndBroadcastNotification({
          userId: paper.createdBy,
          type: 'review_completed',
          title: 'Peer Review Completed',
          message: `A peer review has been completed for your paper "${paper.title}"`,
          entityType: 'paper',
          entityId: assignment.paperId,
        });
      }
    }

    res.json(submission);
  } catch (error) {
    console.error("Error submitting review:", error);
    res.status(500).json({ error: "Failed to submit review" });
  }
});

app.get("/api/papers/:id/peer-reviews", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const paper = await storage.getPaper(paperId);

    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view peer reviews for this paper" });
    }

    const peerReviews = await storage.getPeerReviews(paperId);
    res.json(peerReviews);
  } catch (error) {
    console.error("Error fetching peer reviews:", error);
    res.status(500).json({ error: "Failed to fetch peer reviews" });
  }
});

app.put("/api/papers/:id/review-status", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ error: "Status is required" });
    }

    const validStatuses = ["not_requested", "pending", "in_review", "reviewed", "accepted", "rejected"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const paper = await storage.getPaper(paperId);
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    if (paper.createdBy !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to update review status for this paper" });
    }

    await storage.updateReviewStatus(paperId, status);
    res.json({ success: true, message: "Review status updated successfully" });
  } catch (error) {
    console.error("Error updating review status:", error);
    res.status(500).json({ error: "Failed to update review status" });
  }
});

// Analytics endpoints
app.get("/api/analytics/paper/:id", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const paper = await storage.getPaper(paperId);
    
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const analytics = await storage.getPaperAnalytics(paperId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching paper analytics:", error);
    res.status(500).json({ error: "Failed to fetch paper analytics" });
  }
});

app.get("/api/analytics/user/:id", async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const analytics = await storage.getUserAnalytics(userId);
    
    const hIndex = await storage.calculateHIndex(userId);
    const impactScore = await storage.calculateImpactScore(userId);
    
    await storage.updateUserAnalytics(userId, {
      hIndex,
      impactScore: impactScore.toString(),
    });

    const updatedAnalytics = await storage.getUserAnalytics(userId);
    res.json(updatedAnalytics);
  } catch (error) {
    console.error("Error fetching user analytics:", error);
    res.status(500).json({ error: "Failed to fetch user analytics" });
  }
});

app.get("/api/analytics/dashboard", async (req, res) => {
  try {
    const dashboardData = await storage.getDashboardAnalytics();
    res.json(dashboardData);
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    res.status(500).json({ error: "Failed to fetch dashboard analytics" });
  }
});

app.post("/api/analytics/track", async (req, res) => {
  try {
    const { eventType, entityId, entityType, userId, metadata } = req.body;

    if (!eventType || !entityId || !entityType) {
      return res.status(400).json({ error: "eventType, entityId, and entityType are required" });
    }

    const event = await storage.trackAnalyticsEvent(
      eventType,
      parseInt(entityId),
      entityType,
      userId ? parseInt(userId) : null,
      metadata || {}
    );

    res.json(event);
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    res.status(500).json({ error: "Failed to track analytics event" });
  }
});

app.get("/api/analytics/trends", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trendsData = await storage.getTrendingAnalytics(limit);
    res.json(trendsData);
  } catch (error) {
    console.error("Error fetching trends analytics:", error);
    res.status(500).json({ error: "Failed to fetch trends analytics" });
  }
});

app.get("/api/analytics/trending", async (req, res) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const trendsData = await storage.getTrendingAnalytics(limit);
    res.json(trendsData);
  } catch (error) {
    console.error("Error fetching trending analytics:", error);
    res.status(500).json({ error: "Failed to fetch trending analytics" });
  }
});

app.get("/api/analytics/papers/:id", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const paper = await storage.getPaper(paperId);
    
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const analytics = await storage.getPaperAnalytics(paperId);
    const engagementScore = await storage.calculateEngagementScore(paperId);
    
    await storage.updatePaperAnalytics(paperId, {
      engagementScore: engagementScore.toString(),
    });

    const updatedAnalytics = await storage.getPaperAnalytics(paperId);
    res.json(updatedAnalytics);
  } catch (error) {
    console.error("Error fetching paper analytics:", error);
    res.status(500).json({ error: "Failed to fetch paper analytics" });
  }
});

app.get("/api/analytics/papers/:id/timeline", async (req, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const period = (req.query.period as 'daily' | 'weekly' | 'monthly') || 'daily';
    
    const paper = await storage.getPaper(paperId);
    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    const timeline = await storage.getPaperAnalyticsTimeline(paperId, period);
    res.json(timeline);
  } catch (error) {
    console.error("Error fetching paper analytics timeline:", error);
    res.status(500).json({ error: "Failed to fetch paper analytics timeline" });
  }
});

app.post("/api/analytics/event", async (req, res) => {
  try {
    const { eventType, entityId, entityType, userId, metadata } = req.body;

    if (!eventType || !entityId || !entityType) {
      return res.status(400).json({ error: "eventType, entityId, and entityType are required" });
    }

    const event = await storage.trackAnalyticsEvent(
      eventType,
      parseInt(entityId),
      entityType,
      userId ? parseInt(userId) : null,
      metadata || {}
    );

    res.json(event);
  } catch (error) {
    console.error("Error tracking analytics event:", error);
    res.status(500).json({ error: "Failed to track analytics event" });
  }
});

app.get("/api/analytics/top-papers", async (req, res) => {
  try {
    const metric = (req.query.metric as 'views' | 'citations' | 'downloads' | 'engagement') || 'views';
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    
    const topPapers = await storage.getTopPapers(metric, limit);
    res.json(topPapers);
  } catch (error) {
    console.error("Error fetching top papers:", error);
    res.status(500).json({ error: "Failed to fetch top papers" });
  }
});

// Notification Endpoints

// Get user's notifications
app.get("/api/notifications", authenticateToken, async (req: any, res) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const unreadOnly = req.query.unreadOnly === 'true';

    const result = await storage.getUserNotifications(req.user.id, {
      page,
      limit,
      unreadOnly,
    });

    res.json(result);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Failed to fetch notifications" });
  }
});

// Mark notification as read
app.put("/api/notifications/:id/read", authenticateToken, async (req: any, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    const notification = await storage.markNotificationAsRead(notificationId);

    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    // Verify ownership
    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    res.json(notification);
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({ error: "Failed to mark notification as read" });
  }
});

// Mark all notifications as read
app.put("/api/notifications/read-all", authenticateToken, async (req: any, res) => {
  try {
    await storage.markAllNotificationsAsRead(req.user.id);
    res.json({ success: true });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({ error: "Failed to mark all notifications as read" });
  }
});

// Delete notification
app.delete("/api/notifications/:id", authenticateToken, async (req: any, res) => {
  try {
    const notificationId = parseInt(req.params.id);
    
    // First, get the notification to verify ownership
    const notifications = await storage.getUserNotifications(req.user.id, { page: 1, limit: 1000 });
    const notification = notifications.notifications.find(n => n.id === notificationId);
    
    if (!notification) {
      return res.status(404).json({ error: "Notification not found" });
    }

    if (notification.userId !== req.user.id) {
      return res.status(403).json({ error: "Access denied" });
    }

    await storage.deleteNotification(notificationId);
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({ error: "Failed to delete notification" });
  }
});

// Get notification preferences
app.get("/api/notifications/preferences", authenticateToken, async (req: any, res) => {
  try {
    const preferences = await storage.getNotificationPreferences(req.user.id);
    res.json(preferences);
  } catch (error) {
    console.error("Error fetching notification preferences:", error);
    res.status(500).json({ error: "Failed to fetch notification preferences" });
  }
});

// Update notification preferences
app.put("/api/notifications/preferences", authenticateToken, async (req: any, res) => {
  try {
    const {
      emailOnComment,
      emailOnFollow,
      emailOnCitation,
      pushNotifications,
      emailOnReviewAssignment,
      emailOnReviewCompleted,
      emailOnPaperStatus,
    } = req.body;

    // Get existing preferences or create defaults
    let preferences = await storage.getNotificationPreferences(req.user.id);
    
    if (!preferences) {
      preferences = await storage.createDefaultNotificationPreferences(req.user.id);
    }

    const updated = await storage.updateNotificationPreferences(req.user.id, {
      emailOnComment,
      emailOnFollow,
      emailOnCitation,
      pushNotifications,
      emailOnReviewAssignment,
      emailOnReviewCompleted,
      emailOnPaperStatus,
    });

    res.json(updated);
  } catch (error) {
    console.error("Error updating notification preferences:", error);
    res.status(500).json({ error: "Failed to update notification preferences" });
  }
});

// Collaborative Editing Endpoints

// Get active collaborators for a paper
app.get("/api/papers/:id/collaborators", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    
    // Check if user has access to this paper
    const canEdit = await canUserEditPaper(req.user.id, paperId);
    if (!canEdit) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get active collaborators from WebSocket sessions
    const collaborators = getActiveCollaborators(paperId);
    
    res.json({ collaborators });
  } catch (error) {
    console.error("Error fetching collaborators:", error);
    res.status(500).json({ error: "Failed to fetch collaborators" });
  }
});

// Lock a section for editing
app.post("/api/papers/:id/lock-section", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const { sectionId } = req.body;
    
    if (!sectionId) {
      return res.status(400).json({ error: "sectionId is required" });
    }
    
    // Check if user has access to this paper
    const canEdit = await canUserEditPaper(req.user.id, paperId);
    if (!canEdit) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get user details
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Lock the section
    const lock = await storage.lockSection({
      paperId,
      sectionId,
      userId: req.user.id,
      userName: user.name,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // Lock expires in 5 minutes
    });
    
    // Broadcast lock to all collaborators in the room
    broadcastToRoom(paperId, {
      type: "section-locked",
      sectionId,
      userId: req.user.id,
      userName: user.name,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
    });
    
    res.json(lock);
  } catch (error) {
    console.error("Error locking section:", error);
    res.status(500).json({ error: "Failed to lock section" });
  }
});

// Release a section lock
app.delete("/api/papers/:id/lock-section", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const { sectionId } = req.body;
    
    if (!sectionId) {
      return res.status(400).json({ error: "sectionId is required" });
    }
    
    // Check if user has access to this paper
    const canEdit = await canUserEditPaper(req.user.id, paperId);
    if (!canEdit) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Release the lock
    await storage.unlockSection(paperId, sectionId, req.user.id);
    
    // Broadcast unlock to all collaborators in the room
    broadcastToRoom(paperId, {
      type: "section-unlocked",
      sectionId,
      userId: req.user.id,
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error unlocking section:", error);
    res.status(500).json({ error: "Failed to unlock section" });
  }
});

// Get section locks for a paper
app.get("/api/papers/:id/locks", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    
    // Check if user has access to this paper
    const canEdit = await canUserEditPaper(req.user.id, paperId);
    if (!canEdit) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get active locks
    const locks = await storage.getActiveLocks(paperId);
    
    res.json({ locks });
  } catch (error) {
    console.error("Error fetching locks:", error);
    res.status(500).json({ error: "Failed to fetch locks" });
  }
});

// Get latest draft for a paper
app.get("/api/papers/:id/draft", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    
    // Check if user has access to this paper
    const canEdit = await canUserEditPaper(req.user.id, paperId);
    if (!canEdit) {
      return res.status(403).json({ error: "Access denied" });
    }
    
    // Get latest draft
    const draft = await storage.getLatestDraft(paperId, req.user.id);
    
    res.json({ draft });
  } catch (error) {
    console.error("Error fetching draft:", error);
    res.status(500).json({ error: "Failed to fetch draft" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, "..", "dist")));

// Handle SPA routing - serve index.html for all non-API routes
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, "..", "dist", "index.html"));
  } else {
    next();
  }
});

// Create HTTP server
const server = createServer(app);

// WebSocket Server Setup for Collaborative Editing
const wss = new WebSocketServer({ server });

// Store active editing sessions: paperId -> Set of WebSocket clients
const editingSessions = new Map<number, Set<any>>();

// Store client metadata: WebSocket -> { userId, userName, paperId, cursorPosition }
const clientMetadata = new Map<WebSocket, any>();

// Store user-to-socket mapping for notifications: userId -> Set of WebSocket clients
const userSockets = new Map<number, Set<WebSocket>>();

// Helper function to verify JWT token
function verifyJWT(token: string): Promise<any> {
  return new Promise((resolve, reject) => {
    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) reject(err);
      else resolve(decoded);
    });
  });
}

// Helper function to check if user can edit paper
async function canUserEditPaper(userId: number, paperId: number): Promise<boolean> {
  try {
    const paper = await storage.getPaper(paperId);
    if (!paper) return false;
    
    // Check if user is the creator
    if (paper.createdBy === userId) return true;
    
    // Check if user is in authorIds
    if (Array.isArray(paper.authorIds) && paper.authorIds.includes(userId)) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking paper edit permissions:", error);
    return false;
  }
}

// Broadcast message to all clients in a room except sender
function broadcastToRoom(paperId: number, message: any, excludeClient?: WebSocket) {
  const clients = editingSessions.get(paperId);
  if (!clients) return;
  
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client !== excludeClient && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

// Broadcast notification to specific user
function broadcastNotificationToUser(userId: number, notification: any) {
  const sockets = userSockets.get(userId);
  if (!sockets) return;
  
  const messageStr = JSON.stringify({
    type: 'notification',
    payload: notification,
  });
  
  sockets.forEach((socket) => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(messageStr);
    }
  });
}

// Helper function to create and broadcast notification
async function createAndBroadcastNotification(data: {
  userId: number;
  type: string;
  title: string;
  message: string;
  entityType?: string;
  entityId?: number;
}) {
  try {
    const notification = await storage.createNotification(data);
    broadcastNotificationToUser(data.userId, notification);
    return notification;
  } catch (error) {
    console.error('Error creating and broadcasting notification:', error);
    return null;
  }
}

// Get active collaborators in a room
function getActiveCollaborators(paperId: number) {
  const clients = editingSessions.get(paperId);
  if (!clients) return [];
  
  const collaborators: any[] = [];
  clients.forEach((client) => {
    const metadata = clientMetadata.get(client);
    if (metadata) {
      collaborators.push({
        userId: metadata.userId,
        userName: metadata.userName,
        cursorPosition: metadata.cursorPosition || null,
      });
    }
  });
  
  return collaborators;
}

// WebSocket connection handler
wss.on("connection", async (ws: WebSocket, req) => {
  console.log("New WebSocket connection attempt");
  
  let authenticated = false;
  let currentPaperId: number | null = null;
  let currentUserId: number | null = null;
  
  // Handle messages from client
  ws.on("message", async (data) => {
    try {
      const message = JSON.parse(data.toString());
      const { type, token, paperId, content, cursorPosition, sectionId, version } = message;
      
      // Handle join message - authenticate and join room
      if (type === "join") {
        if (!token || !paperId) {
          ws.send(JSON.stringify({ type: "error", message: "Token and paperId required" }));
          return;
        }
        
        try {
          // Verify JWT token
          const decoded = await verifyJWT(token);
          const userId = decoded.id;
          
          // Check if user can edit this paper
          const canEdit = await canUserEditPaper(userId, paperId);
          if (!canEdit) {
            ws.send(JSON.stringify({ 
              type: "error", 
              message: "You don't have permission to edit this paper" 
            }));
            ws.close();
            return;
          }
          
          // Get user details
          const user = await storage.getUser(userId);
          if (!user) {
            ws.send(JSON.stringify({ type: "error", message: "User not found" }));
            ws.close();
            return;
          }
          
          // Authentication successful
          authenticated = true;
          currentPaperId = paperId;
          currentUserId = userId;
          
          // Store client metadata
          clientMetadata.set(ws, {
            userId: userId,
            userName: user.name,
            paperId: paperId,
            cursorPosition: null,
          });
          
          // Add client to editing session
          if (!editingSessions.has(paperId)) {
            editingSessions.set(paperId, new Set());
          }
          editingSessions.get(paperId)!.add(ws);
          
          // Register user socket for notifications
          if (!userSockets.has(userId)) {
            userSockets.set(userId, new Set());
          }
          userSockets.get(userId)!.add(ws);
          
          // Send success response
          ws.send(JSON.stringify({ 
            type: "joined", 
            message: "Successfully joined editing session",
            userId: userId,
            userName: user.name,
          }));
          
          // Broadcast updated collaborators list to all in room
          const collaborators = getActiveCollaborators(paperId);
          broadcastToRoom(paperId, {
            type: "collaborators-update",
            collaborators: collaborators,
          });
          
          console.log(`User ${user.name} (${userId}) joined paper ${paperId}`);
          
        } catch (error) {
          console.error("Authentication error:", error);
          ws.send(JSON.stringify({ type: "error", message: "Authentication failed" }));
          ws.close();
          return;
        }
      }
      
      // All other message types require authentication
      if (!authenticated) {
        ws.send(JSON.stringify({ type: "error", message: "Not authenticated" }));
        return;
      }
      
      // Handle content change
      if (type === "content-change") {
        if (!content) {
          ws.send(JSON.stringify({ type: "error", message: "Content required" }));
          return;
        }
        
        // Broadcast content change to other collaborators
        broadcastToRoom(currentPaperId!, {
          type: "content-change",
          content: content,
          userId: currentUserId,
          userName: clientMetadata.get(ws)?.userName,
          timestamp: new Date().toISOString(),
        }, ws);
        
        // Send acknowledgment to sender
        ws.send(JSON.stringify({ 
          type: "content-change-ack", 
          message: "Content change broadcasted" 
        }));
      }
      
      // Handle cursor position update
      if (type === "cursor-position") {
        // Update cursor position in metadata
        const metadata = clientMetadata.get(ws);
        if (metadata) {
          metadata.cursorPosition = cursorPosition;
          clientMetadata.set(ws, metadata);
        }
        
        // Broadcast cursor position to other collaborators
        broadcastToRoom(currentPaperId!, {
          type: "cursor-position",
          userId: currentUserId,
          userName: clientMetadata.get(ws)?.userName,
          cursorPosition: cursorPosition,
        }, ws);
      }
      
      // Handle draft save
      if (type === "save-draft") {
        if (!content) {
          ws.send(JSON.stringify({ type: "error", message: "Content required for draft save" }));
          return;
        }
        
        try {
          // Save draft to database
          await storage.savePaperDraft({
            paperId: currentPaperId!,
            userId: currentUserId!,
            content: content,
            version: version || 1,
          });
          
          // Send success response
          ws.send(JSON.stringify({ 
            type: "save-draft-ack", 
            message: "Draft saved successfully",
            timestamp: new Date().toISOString(),
          }));
          
          console.log(`Draft saved for paper ${currentPaperId} by user ${currentUserId}`);
        } catch (error) {
          console.error("Error saving draft:", error);
          ws.send(JSON.stringify({ 
            type: "error", 
            message: "Failed to save draft" 
          }));
        }
      }
      
      // Handle leave
      if (type === "leave") {
        handleClientLeave(ws);
      }
      
    } catch (error) {
      console.error("Error processing WebSocket message:", error);
      ws.send(JSON.stringify({ type: "error", message: "Failed to process message" }));
    }
  });
  
  // Handle client disconnect
  ws.on("close", () => {
    handleClientLeave(ws);
  });
  
  // Handle errors
  ws.on("error", (error) => {
    console.error("WebSocket error:", error);
    handleClientLeave(ws);
  });
  
  // Helper function to handle client leaving
  function handleClientLeave(client: WebSocket) {
    const metadata = clientMetadata.get(client);
    if (metadata) {
      const { paperId, userName, userId } = metadata;
      
      // Remove from editing session
      const clients = editingSessions.get(paperId);
      if (clients) {
        clients.delete(client);
        if (clients.size === 0) {
          editingSessions.delete(paperId);
        } else {
          // Broadcast updated collaborators list
          const collaborators = getActiveCollaborators(paperId);
          broadcastToRoom(paperId, {
            type: "collaborators-update",
            collaborators: collaborators,
          });
        }
      }
      
      // Remove from user sockets for notifications
      const userSocketSet = userSockets.get(userId);
      if (userSocketSet) {
        userSocketSet.delete(client);
        if (userSocketSet.size === 0) {
          userSockets.delete(userId);
        }
      }
      
      // Clean up metadata
      clientMetadata.delete(client);
      
      console.log(`User ${userName} left paper ${paperId}`);
    }
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
  console.log(`Frontend proxy should connect to port ${PORT}`);
  console.log(`WebSocket server is ready for collaborative editing`);
});