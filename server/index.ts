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
    res.json({ id: user.id, email: user.email, name: user.name });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// Paper endpoints
app.get("/api/papers", async (req, res) => {
  try {
    const { search, isPublished } = req.query;
    const papers = await storage.getPapers({
      search: search as string,
      isPublished: isPublished === "true",
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

    // Handle publishing logic: set isPublished and publishedAt when status changes to "published"
    const updates = { ...req.body };
    if (updates.status === 'published' && !existingPaper.isPublished) {
      updates.isPublished = true;
      updates.publishedAt = new Date();
    } else if (updates.status === 'draft') {
      updates.isPublished = false;
    }

    const paper = await storage.updatePaper(paperId, updates);
    res.json(paper);
  } catch (error) {
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
    const comments = await storage.getComments(parseInt(req.params.id));
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comments" });
  }
});

app.post("/api/papers/:id/comments", authenticateToken, async (req: any, res) => {
  try {
    const { content, parentId } = req.body;
    const comment = await storage.createComment({
      paperId: parseInt(req.params.id),
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
    const reviews = await storage.getReviews(parseInt(req.params.id));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reviews" });
  }
});

app.post("/api/papers/:id/reviews", authenticateToken, async (req: any, res) => {
  try {
    const { content, rating, recommendation } = req.body;
    const review = await storage.createReview({
      paperId: parseInt(req.params.id),
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

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});