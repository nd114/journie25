import "dotenv/config";
import express from "express";
import cors from "cors";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

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
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
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

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token 
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

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "7d" });

    res.json({ 
      user: { id: user.id, email: user.email, name: user.name },
      token 
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

app.get("/api/auth/me", authenticateToken, async (req: any, res) => {
  try {
    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      orcid: user.orcid,
      affiliation: user.affiliation,
      bio: user.bio
    });
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
      bio
    });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json({ 
      id: user.id, 
      email: user.email, 
      name: user.name,
      orcid: user.orcid,
      affiliation: user.affiliation,
      bio: user.bio
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to update profile" });
  }
});

app.post("/api/auth/change-password", authenticateToken, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Server-side password validation
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
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
});

// Paper endpoints
app.get("/api/papers", async (req, res) => {
  try {
    const { search, field } = req.query;
    // Public endpoint - only return published papers by default
    const papers = await storage.getPapers({
      search: search as string,
      isPublished: true,
      field: field as string,
    });
    res.json(papers);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.get("/api/papers/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const paper = await storage.getPaper(parseInt(id));
    if (!paper) {
      return res.status(404).json({ error: "Paper not found" });
    }

    // Only return published papers to public, or drafts to their creator
    if (!paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(paper);
  } catch (error) {
    console.error('Error fetching paper:', error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

app.post("/api/papers", authenticateToken, async (req: any, res) => {
  try {
    const { title, abstract, content, authors, researchField, keywords } = req.body;

    const paper = await storage.createPaper({
      title,
      abstract,
      content: content || '',
      authors: authors || [],
      authorIds: [req.user.id],
      researchField: researchField || '',
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
      return res.status(403).json({ error: "Not authorized to update this paper" });
    }

    // Handle publishing logic: ignore isPublished/publishedAt from client, derive from status
    const updates = { ...req.body };
    // Strip client-provided isPublished/publishedAt to prevent bypass
    delete updates.isPublished;
    delete updates.publishedAt;

    const isNewlyPublished = updates.status === 'published' && !existingPaper.isPublished;

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
    } else if (updates.status === 'draft') {
      updates.isPublished = false;
    }

    const paper = await storage.updatePaper(paperId, updates);
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
      return res.status(403).json({ error: "Not authorized to delete this paper" });
    }

    await storage.deletePaper(paperId);
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

app.post("/api/papers/:id/comments", authenticateToken, async (req: any, res) => {
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
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: "Failed to create comment" });
  }
});

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

app.post("/api/papers/:id/reviews", authenticateToken, async (req: any, res) => {
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
});

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

// Get trending papers
app.get("/api/papers/trending", async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const papers = await storage.getTrendingPapers(parseInt(limit as string));
    res.json(papers);
  } catch (error) {
    console.error("Error fetching trending papers:", error);
    res.status(500).json({ error: "Failed to fetch trending papers" });
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
      parseInt(limit as string)
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
    const topics = await storage.getTrendingTopics(parseInt(limit as string));
    res.json(topics);
  } catch (error) {
    console.error("Error fetching trending topics:", error);
    res.status(500).json({ error: "Failed to fetch trending topics" });
  }
});

// Communities endpoints
// Communities API endpoints
app.get('/api/communities', authenticateToken, async (req, res) => {
  try {
    const category = req.query.category as string;
    const userId = (req as any).user.id;
    const communitiesData = await storage.getCommunities(userId, category);
    res.json(communitiesData);
  } catch (error) {
    console.error('Error fetching communities:', error);
    res.status(500).json({ error: 'Failed to fetch communities' });
  }
});

app.post('/api/communities', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, category } = req.body;

    if (!name || !description || !category) {
      return res.status(400).json({ error: 'Name, description, and category are required' });
    }

    const community = await storage.createCommunity({
      name,
      description,
      category
    });

    // Automatically join the creator to the community
    await storage.joinCommunity(userId, community.id);

    res.status(201).json({ ...community, isJoined: true });
  } catch (error) {
    console.error('Error creating community:', error);
    res.status(500).json({ error: 'Failed to create community' });
  }
});

app.post('/api/communities/:id/join', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const communityId = parseInt(req.params.id);

    await storage.joinCommunity(userId, communityId);
    res.json({ message: 'Successfully joined community' });
  } catch (error) {
    console.error('Error joining community:', error);
    res.status(500).json({ error: 'Failed to join community' });
  }
});

app.post('/api/communities/:id/leave', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const communityId = parseInt(req.params.id);

    await storage.leaveCommunity(userId, communityId);
    res.json({ message: 'Successfully left community' });
  } catch (error) {
    console.error('Error leaving community:', error);
    res.status(500).json({ error: 'Failed to leave community' });
  }
});

// Trending Research API
app.get('/api/trending', async (req, res) => {
  try {
    const trendingData = await storage.getTrendingTopics();
    res.json(trendingData);
  } catch (error) {
    console.error('Error fetching trending data:', error);
    res.status(500).json({ error: 'Failed to fetch trending data' });
  }
});

// Learning Paths API
app.get('/api/learning-paths', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paths = await storage.getLearningPaths(userId);
    res.json(paths);
  } catch (error) {
    console.error('Error fetching learning paths:', error);
    res.status(500).json({ error: 'Failed to fetch learning paths' });
  }
});

app.post('/api/learning-paths/:id/complete-step', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const pathId = parseInt(req.params.id);
    const { stepId } = req.body;

    await storage.completeLearningStep(userId, pathId, stepId);
    res.json({ message: 'Step completed successfully' });
  } catch (error) {
    console.error('Error completing step:', error);
    res.status(500).json({ error: 'Failed to complete step' });
  }
});

// Research Tools API
app.get('/api/research-tools', async (req, res) => {
  try {
    const tools = await storage.getResearchTools();
    res.json(tools);
  } catch (error) {
    console.error('Error fetching research tools:', error);
    res.status(500).json({ error: 'Failed to fetch research tools' });
  }
});

// Bookmarks API
app.get('/api/bookmarks', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const bookmarks = await storage.getUserBookmarks(userId);
    res.json(bookmarks);
  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    res.status(500).json({ error: 'Failed to fetch bookmarks' });
  }
});

app.post('/api/bookmarks/:paperId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paperId = parseInt(req.params.paperId);

    await storage.addBookmark(userId, paperId);
    res.json({ message: 'Bookmark added successfully' });
  } catch (error) {
    console.error('Error adding bookmark:', error);
    res.status(500).json({ error: 'Failed to add bookmark' });
  }
});

app.delete('/api/bookmarks/:paperId', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paperId = parseInt(req.params.paperId);

    await storage.removeBookmark(userId, paperId);
    res.json({ message: 'Bookmark removed successfully' });
  } catch (error) {
    console.error('Error removing bookmark:', error);
    res.status(500).json({ error: 'Failed to remove bookmark' });
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
app.post("/api/user/quest-progress", authenticateToken, async (req: any, res) => {
  try {
    const { questId, action } = req.body;
    const progress = await storage.updateQuestProgress(req.user.id, questId, action);
    res.json(progress);
  } catch (error) {
    console.error("Error updating quest progress:", error);
    res.status(500).json({ error: "Failed to update quest progress" });
  }
});

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
app.post("/api/papers/:id/visual-abstract", authenticateToken, async (req: any, res) => {
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
});

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
app.post("/api/papers/:id/generate-levels", authenticateToken, async (req: any, res) => {
  try {
    const paperId = parseInt(req.params.id);
    const levels = await storage.generateMultiLevelContent(paperId);
    res.json(levels);
  } catch (error) {
    console.error("Error generating multi-level content:", error);
    res.status(500).json({ error: "Failed to generate multi-level content" });
  }
});

// Follow/Unfollow User endpoints
app.post('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const followingId = parseInt(req.params.id);

    if (userId === followingId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    await storage.followUser(userId, followingId);
    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

app.delete('/api/users/:id/follow', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const followingId = parseInt(req.params.id);

    await storage.unfollowUser(userId, followingId);
    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

app.get('/api/users/:id/followers', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const followers = await storage.getUserFollowers(userId);
    res.json(followers);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

app.get('/api/users/:id/following', async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const following = await storage.getUserFollowing(userId);
    res.json(following);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

app.get('/api/users/:id/is-following/:targetId', authenticateToken, async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const targetId = parseInt(req.params.targetId);
    const isFollowing = await storage.isFollowing(userId, targetId);
    res.json({ isFollowing });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});

// Activity Feed endpoint
app.get('/api/feed', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const limit = parseInt(req.query.limit as string) || 20;
    const activities = await storage.getUserActivityFeed(userId, limit);
    res.json(activities);
  } catch (error) {
    console.error('Error fetching activity feed:', error);
    res.status(500).json({ error: 'Failed to fetch activity feed' });
  }
});

// Check if paper is bookmarked
app.get('/api/bookmarks/:paperId/check', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const paperId = parseInt(req.params.paperId);
    const isBookmarked = await storage.isBookmarked(userId, paperId);
    res.json({ isBookmarked });
  } catch (error) {
    console.error('Error checking bookmark status:', error);
    res.status(500).json({ error: 'Failed to check bookmark status' });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});