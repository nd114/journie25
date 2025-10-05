import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { hash, compare } from "bcrypt";
import jwt from "jsonwebtoken";
import Stripe from "stripe";
import { db } from "./db";
import { subscriptions, institutionMembers } from "../shared/schema";
import { eq } from "drizzle-orm";
import { rateLimit } from "./rate-limiter";
import { startBackgroundJobs } from "./background-jobs";
import { 
  sanitizeMiddleware, 
  httpsEnforcement, 
  securityHeaders,
  recordFailedLogin,
  clearFailedLogin,
  isAccountLocked,
  getFailedAttempts
} from "./security";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || "3000", 10);

const JWT_SECRET =
  process.env.JWT_SECRET || "dev-secret-key-change-in-production";

const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, { apiVersion: "2025-09-30.clover" })
  : null;

const SUBSCRIPTION_TIERS = {
  FREE: {
    name: "free",
    maxPapers: 5,
    features: ["basic_access", "standard_analytics"]
  },
  PRO: {
    name: "pro",
    priceId: process.env.STRIPE_PRO_PRICE_ID || "",
    price: 9.99,
    maxPapers: -1,
    features: ["unlimited_papers", "advanced_analytics", "priority_support", "api_access"]
  },
  INSTITUTIONAL: {
    name: "institutional",
    priceId: process.env.STRIPE_INSTITUTIONAL_PRICE_ID || "",
    price: 49.99,
    maxPapers: -1,
    features: ["unlimited_papers", "advanced_analytics", "priority_support", "api_access", "team_features", "custom_branding", "dedicated_support"]
  }
};

// Enable gzip compression for all responses
app.use(compression());

// Security headers
app.use(securityHeaders);

// HTTPS enforcement in production
app.use(httpsEnforcement);

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

// Input sanitization
app.use(sanitizeMiddleware);

// Rate limiting: 100 requests per 15 minutes (general API)
app.use('/api/', rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

// Stricter rate limiting for auth endpoints: 10 requests per 15 minutes
app.use('/api/auth/', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));

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

const requirePremium = (requiredTier: 'pro' | 'institutional' = 'pro') => {
  return async (req: any, res: any, next: any) => {
    try {
      const subscription = await storage.getSubscription(req.user.id);

      if (!subscription || subscription.plan === 'free') {
        return res.status(403).json({ 
          error: "Premium subscription required",
          requiredTier,
          currentPlan: subscription?.plan || 'free'
        });
      }

      if (requiredTier === 'institutional' && subscription.plan !== 'institutional') {
        return res.status(403).json({ 
          error: "Institutional subscription required",
          requiredTier,
          currentPlan: subscription.plan
        });
      }

      if (subscription.status !== 'active' && subscription.status !== 'trialing') {
        return res.status(403).json({ 
          error: "Active subscription required",
          status: subscription.status
        });
      }

      req.subscription = subscription;
      next();
    } catch (error) {
      console.error('Error checking subscription:', error);
      res.status(500).json({ error: "Failed to verify subscription" });
    }
  };
};

// Rate limiting storage (in-memory)
const rateLimitStore = new Map<number, { count: number; resetAt: number }>();

// API Key authentication middleware with rate limiting
const authenticateApiKey = async (req: any, res: any, next: any) => {
  const startTime = Date.now();

  try {
    const apiKey = req.headers["x-api-key"];

    if (!apiKey) {
      return res.status(401).json({ error: "API key required" });
    }

    // Hash the API key to compare with stored hash
    const crypto = await import('crypto');
    const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

    // Verify API key
    const apiKeyRecord = await storage.getApiKeyByHash(keyHash);

    if (!apiKeyRecord) {
      return res.status(401).json({ error: "Invalid API key" });
    }

    // Check if key is expired
    if (apiKeyRecord.expiresAt && new Date(apiKeyRecord.expiresAt) < new Date()) {
      return res.status(401).json({ error: "API key expired" });
    }

    // Rate limiting (100 requests per hour)
    const now = Date.now();
    const rateLimit = rateLimitStore.get(apiKeyRecord.id) || { count: 0, resetAt: now + 3600000 };

    if (now > rateLimit.resetAt) {
      rateLimit.count = 0;
      rateLimit.resetAt = now + 3600000;
    }

    if (rateLimit.count >= 100) {
      return res.status(429).json({ 
        error: "Rate limit exceeded",
        limit: 100,
        resetAt: new Date(rateLimit.resetAt).toISOString()
      });
    }

    rateLimit.count += 1;
    rateLimitStore.set(apiKeyRecord.id, rateLimit);

    // Update last used timestamp
    await storage.updateApiKeyLastUsed(apiKeyRecord.id);

    // Attach API key info to request
    req.apiKey = apiKeyRecord;

    // Track usage in response
    res.on('finish', async () => {
      const responseTime = Date.now() - startTime;
      try {
        await storage.recordApiUsage({
          apiKeyId: apiKeyRecord.id,
          endpoint: req.path,
          method: req.method,
          statusCode: res.statusCode,
          responseTime,
        });
      } catch (error) {
        console.error('Error recording API usage:', error);
      }
    });

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ error: "Authentication failed" });
  }
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
      expiresIn: "24h", // 24 hour expiration for better security
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

    // Check account lockout
    const lockStatus = isAccountLocked(email);
    if (lockStatus.locked) {
      return res.status(429).json({ 
        error: "Too many failed login attempts. Account temporarily locked.",
        remainingTime: lockStatus.remainingTime,
        message: `Please try again in ${lockStatus.remainingTime} seconds`
      });
    }

    const user = await storage.getUserByEmail(email);
    if (!user) {
      recordFailedLogin(email);
      const attempts = getFailedAttempts(email);
      return res.status(401).json({ 
        error: "Invalid credentials",
        remainingAttempts: Math.max(0, 5 - attempts)
      });
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      recordFailedLogin(email);
      const attempts = getFailedAttempts(email);
      return res.status(401).json({ 
        error: "Invalid credentials",
        remainingAttempts: Math.max(0, 5 - attempts)
      });
    }

    // Clear failed attempts on successful login
    clearFailedLogin(email);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "24h", // 24 hour expiration for better security
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

app.post("/api/subscriptions/create-checkout", authenticateToken, async (req: any, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable." });
    }

    const { plan } = req.body;

    if (!plan || !['pro', 'institutional'].includes(plan)) {
      return res.status(400).json({ error: "Invalid plan. Choose 'pro' or 'institutional'." });
    }

    const user = await storage.getUser(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let subscription = await storage.getSubscription(req.user.id);
    let customerId = subscription?.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: { userId: req.user.id.toString() },
      });
      customerId = customer.id;

      if (subscription) {
        await storage.updateSubscription(req.user.id, { stripeCustomerId: customerId });
      } else {
        subscription = await storage.createSubscription({
          userId: req.user.id,
          stripeCustomerId: customerId,
          plan: 'free',
          status: 'active',
        });
      }
    }

    const tierConfig = plan === 'pro' ? SUBSCRIPTION_TIERS.PRO : SUBSCRIPTION_TIERS.INSTITUTIONAL;

    if (!tierConfig.priceId) {
      return res.status(500).json({ 
        error: `Price ID not configured for ${plan} plan. Please set STRIPE_${plan.toUpperCase()}_PRICE_ID environment variable.` 
      });
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: tierConfig.priceId,
          quantity: 1,
        },
      ],
      success_url: `${req.headers.origin || 'http://localhost:5000'}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.origin || 'http://localhost:5000'}/subscription/cancel`,
      metadata: {
        userId: req.user.id.toString(),
        plan,
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error: any) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: error.message || "Failed to create checkout session" });
  }
});

app.post("/api/subscriptions/create-portal", authenticateToken, async (req: any, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const subscription = await storage.getSubscription(req.user.id);

    if (!subscription?.stripeCustomerId) {
      return res.status(400).json({ error: "No subscription found" });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripeCustomerId,
      return_url: `${req.headers.origin || 'http://localhost:5000'}/subscription`,
    });

    res.json({ url: session.url });
  } catch (error: any) {
    console.error("Error creating portal session:", error);
    res.status(500).json({ error: error.message || "Failed to create portal session" });
  }
});

app.get("/api/subscriptions/status", authenticateToken, async (req: any, res) => {
  try {
    let subscription = await storage.getSubscription(req.user.id);

    if (!subscription) {
      subscription = await storage.createSubscription({
        userId: req.user.id,
        plan: 'free',
        status: 'active',
      });
    }

    const userPapers = await storage.getPapers({ 
      isPublished: true,
    });
    const userPaperCount = userPapers.papers.filter((p: any) => p.createdBy === req.user.id).length;

    const tier = SUBSCRIPTION_TIERS[subscription.plan.toUpperCase() as keyof typeof SUBSCRIPTION_TIERS] || SUBSCRIPTION_TIERS.FREE;

    res.json({
      subscription: {
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        stripeCustomerId: subscription.stripeCustomerId,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
      },
      usage: {
        paperCount: userPaperCount,
        maxPapers: tier.maxPapers,
      },
      features: tier.features,
    });
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    res.status(500).json({ error: "Failed to fetch subscription status" });
  }
});

app.post("/api/webhooks/stripe", express.raw({ type: 'application/json' }), async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    const sig = req.headers['stripe-signature'];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    let event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || '0');
        const plan = session.metadata?.plan || 'free';

        if (userId && session.subscription) {
          await storage.updateSubscription(userId, {
            stripeSubscriptionId: session.subscription as string,
            plan,
            status: 'active',
          });
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (userSub.length > 0) {
          const periodEnd = subscription.current_period_end 
            ? new Date(subscription.current_period_end * 1000)
            : undefined;
          await storage.updateSubscription(userSub[0].userId, {
            status: subscription.status,
            currentPeriodEnd: periodEnd,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;

        const userSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (userSub.length > 0) {
          await storage.updateSubscription(userSub[0].userId, {
            plan: 'free',
            status: 'canceled',
            stripeSubscriptionId: null as any,
          });
        }
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (userSub.length > 0) {
          const paymentId = (typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id) || invoice.id;
          await storage.recordPayment({
            userId: userSub[0].userId,
            stripePaymentId: paymentId,
            amount: (invoice.amount_paid / 100).toString(),
            currency: invoice.currency,
            status: 'succeeded',
            description: invoice.description || `Payment for ${userSub[0].plan} subscription`,
          });
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;

        const userSub = await db
          .select()
          .from(subscriptions)
          .where(eq(subscriptions.stripeCustomerId, customerId))
          .limit(1);

        if (userSub.length > 0) {
          const paymentId = (typeof invoice.payment_intent === 'string' ? invoice.payment_intent : invoice.payment_intent?.id) || invoice.id;
          await storage.recordPayment({
            userId: userSub[0].userId,
            stripePaymentId: paymentId,
            amount: (invoice.amount_due / 100).toString(),
            currency: invoice.currency,
            status: 'failed',
            description: invoice.description || `Failed payment for ${userSub[0].plan} subscription`,
          });

          await storage.updateSubscription(userSub[0].userId, {
            status: 'past_due',
          });
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message || 'Webhook handler failed' });
  }
});

// Institution endpoints
app.post("/api/institutions", authenticateToken, requirePremium('institutional'), async (req: any, res) => {
  try {
    const { name, domain, type, logoUrl, settings } = req.body;

    if (!name || !type) {
      return res.status(400).json({ error: "Name and type are required" });
    }

    const subscription = await storage.getSubscription(req.user.id);

    const institution = await storage.createInstitution({
      name,
      domain,
      type,
      logoUrl,
      settings: settings || {},
      subscriptionId: subscription?.id,
    });

    await db.insert(institutionMembers).values({
      institutionId: institution.id,
      userId: req.user.id,
      role: 'admin',
    });

    res.json(institution);
  } catch (error) {
    console.error("Error creating institution:", error);
    res.status(500).json({ error: "Failed to create institution" });
  }
});

app.get("/api/institutions/:id", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);

    const isMember = await storage.isInstitutionMember(req.user.id, institutionId);
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this institution" });
    }

    const institution = await storage.getInstitution(institutionId);
    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.json(institution);
  } catch (error) {
    console.error("Error fetching institution:", error);
    res.status(500).json({ error: "Failed to fetch institution" });
  }
});

app.put("/api/institutions/:id", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);
    const { name, domain, type, logoUrl, settings } = req.body;

    const isAdmin = await storage.isInstitutionAdmin(req.user.id, institutionId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const institution = await storage.updateInstitution(institutionId, {
      name,
      domain,
      type,
      logoUrl,
      settings,
    });

    if (!institution) {
      return res.status(404).json({ error: "Institution not found" });
    }

    res.json(institution);
  } catch (error) {
    console.error("Error updating institution:", error);
    res.status(500).json({ error: "Failed to update institution" });
  }
});

app.post("/api/institutions/:id/invite", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);
    const { email, role = 'member' } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    const isAdmin = await storage.isInstitutionAdmin(req.user.id, institutionId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const invite = await storage.createInvite({
      institutionId,
      email,
      role,
    });

    res.json({
      id: invite.id,
      email: invite.email,
      role: invite.role,
      token: invite.token,
      expiresAt: invite.expiresAt,
    });
  } catch (error) {
    console.error("Error creating invite:", error);
    res.status(500).json({ error: "Failed to create invite" });
  }
});

app.post("/api/institutions/accept-invite/:token", authenticateToken, async (req: any, res) => {
  try {
    const { token } = req.params;

    const member = await storage.acceptInvite(token, req.user.id);

    if (!member) {
      return res.status(400).json({ error: "Failed to accept invite" });
    }

    res.json(member);
  } catch (error: any) {
    console.error("Error accepting invite:", error);
    res.status(500).json({ error: error.message || "Failed to accept invite" });
  }
});

app.get("/api/institutions/:id/members", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);

    const isMember = await storage.isInstitutionMember(req.user.id, institutionId);
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this institution" });
    }

    const members = await storage.getInstitutionMembers(institutionId);
    res.json(members);
  } catch (error) {
    console.error("Error fetching members:", error);
    res.status(500).json({ error: "Failed to fetch members" });
  }
});

app.delete("/api/institutions/:id/members/:userId", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);
    const userIdToRemove = parseInt(req.params.userId);

    const isAdmin = await storage.isInstitutionAdmin(req.user.id, institutionId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    if (req.user.id === userIdToRemove) {
      return res.status(400).json({ error: "Cannot remove yourself" });
    }

    await storage.removeMember(institutionId, userIdToRemove);
    res.json({ success: true });
  } catch (error) {
    console.error("Error removing member:", error);
    res.status(500).json({ error: "Failed to remove member" });
  }
});

app.get("/api/institutions/:id/papers", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);

    const isMember = await storage.isInstitutionMember(req.user.id, institutionId);
    if (!isMember) {
      return res.status(403).json({ error: "Not a member of this institution" });
    }

    const papers = await storage.getInstitutionPapers(institutionId);
    res.json(papers);
  } catch (error) {
    console.error("Error fetching institution papers:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

app.get("/api/institutions/:id/analytics", authenticateToken, async (req: any, res) => {
  try {
    const institutionId = parseInt(req.params.id);

    const isAdmin = await storage.isInstitutionAdmin(req.user.id, institutionId);
    if (!isAdmin) {
      return res.status(403).json({ error: "Admin access required" });
    }

    const analytics = await storage.getInstitutionAnalytics(institutionId);
    res.json(analytics);
  } catch (error) {
    console.error("Error fetching institution analytics:", error);
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
});

app.get("/api/users/institutions", authenticateToken, async (req: any, res) => {
  try {
    const institutions = await storage.getUserInstitutions(req.user.id);
    res.json(institutions);
  } catch (error) {
    console.error("Error fetching user institutions:", error);
    res.status(500).json({ error: "Failed to fetch institutions" });
  }
});

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
    const { title, abstract, content, authors, researchField, keywords, status } =
      req.body;

    const isPublishing = status === 'published';
    
    const paperData: any = {
      title,
      abstract,
      content: content || "",
      authors: authors || [],
      authorIds: [req.user.id],
      researchField: researchField || "",
      fieldIds: [],
      keywords: keywords || [],
      createdBy: req.user.id,
      status: status || "draft",
    };

    // If publishing on creation, set publication fields
    if (isPublishing) {
      paperData.isPublished = true;
      paperData.publishedAt = new Date();
      paperData.version = 1;
    }

    const paper = await storage.createPaper(paperData);

    // Send notification if published
    if (isPublishing) {
      const user = await storage.getUser(req.user.id);
      if (user) {
        await createAndBroadcastNotification({
          userId: req.user.id,
          type: 'paper_published',
          title: 'Paper Published',
          message: `Your paper "${title}" has been published successfully`,
          entityType: 'paper',
          entityId: paper.id,
        });
      }
    }

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

    // Create notification for paper published
    if (isNewlyPublished) {
      const user = await storage.getUser(req.user.id);
      if (user) {
        await createAndBroadcastNotification({
          userId: req.user.id,
          type: 'paper_published',
          title: 'Paper Published',
          message: `Your paper "${updates.title || existingPaper.title}" has been published successfully`,
          entityType: 'paper',
          entityId: paperId,
        });

        // Notify followers about the new publication
        const followers = await storage.getUserFollowers(req.user.id);
        for (const follower of followers) {
          await createAndBroadcastNotification({
            userId: follower.id,
            type: 'paper_published',
            title: 'New Publication',
            message: `${user.name} published a new paper: "${updates.title || existingPaper.title}"`,
            entityType: 'paper',
            entityId: paperId,
          });
        }
      }
    }

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

      // Create notification for paper author if not reviewing own paper
      if (paper.createdBy !== req.user.id) {
        const reviewerUser = await storage.getUser(req.user.id);
        if (reviewerUser) {
          await createAndBroadcastNotification({
            userId: paper.createdBy,
            type: 'new_review',
            title: 'New Review',
            message: `${reviewerUser.name} reviewed your paper "${paper.title}"`,
            entityType: 'paper',
            entityId: paperId,
          });
        }
      }

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

// Get unread notification count
app.get("/api/notifications/unread-count", authenticateToken, async (req: any, res) => {
  try {
    const result = await storage.getUserNotifications(req.user.id, {
      page: 1,
      limit: 1,
    });

    res.json({ count: result.unread });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({ error: "Failed to fetch unread count" });
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

// ============================================
// PUBLIC REST API v1 ENDPOINTS
// ============================================

// GET /api/v1/papers - List published papers with pagination
app.get("/api/v1/papers", authenticateApiKey, async (req: any, res) => {
  try {
    const { page = 1, limit = 20, search, field } = req.query;
    const result = await storage.getPapers({
      isPublished: true,
      search: search as string,
      field: field as string,
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100), // Max 100 per page
    });
    res.json(result);
  } catch (error) {
    console.error("Error fetching papers:", error);
    res.status(500).json({ error: "Failed to fetch papers" });
  }
});

// GET /api/v1/papers/search - Search papers
app.get("/api/v1/papers/search", authenticateApiKey, async (req: any, res) => {
  try {
    const { query, author, field, startDate, endDate, sortBy = 'relevance', order = 'desc', page = 1, limit = 20 } = req.query;
    const result = await storage.advancedSearchPapers({
      query: query as string,
      author: author as string,
      field: field as string,
      startDate: startDate as string,
      endDate: endDate as string,
      sortBy: sortBy as string,
      order: order as 'asc' | 'desc',
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
    });
    res.json(result);
  } catch (error) {
    console.error("Error searching papers:", error);
    res.status(500).json({ error: "Failed to search papers" });
  }
});

// GET /api/v1/papers/:id - Get paper details
app.get("/api/v1/papers/:id", authenticateApiKey, async (req: any, res) => {
  try {
    const { id } = req.params;
    const paper = await storage.getPaper(parseInt(id));

    if (!paper || !paper.isPublished) {
      return res.status(404).json({ error: "Paper not found" });
    }

    res.json(paper);
  } catch (error) {
    console.error("Error fetching paper:", error);
    res.status(500).json({ error: "Failed to fetch paper" });
  }
});

// GET /api/v1/users/:id - Get user profile
app.get("/api/v1/users/:id", authenticateApiKey, async (req: any, res) => {
  try {
    const { id } = req.params;
    const user = await storage.getUser(parseInt(id));

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Return public user info only
    res.json({
      id: user.id,
      name: user.name,
      orcid: user.orcid,
      affiliation: user.affiliation,
      bio: user.bio,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// GET /api/v1/users/:id/papers - Get user's papers
app.get("/api/v1/users/:id/papers", authenticateApiKey, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const result = await storage.getPapers({
      isPublished: true,
      page: parseInt(page as string),
      limit: Math.min(parseInt(limit as string), 100),
    });

    // Filter papers by user
    const userPapers = result.papers.filter((p: any) => 
      p.authorIds && (p.authorIds as any[]).includes(parseInt(id))
    );

    res.json({
      papers: userPapers,
      total: userPapers.length,
      page: parseInt(page as string),
      totalPages: Math.ceil(userPapers.length / parseInt(limit as string)),
    });
  } catch (error) {
    console.error("Error fetching user papers:", error);
    res.status(500).json({ error: "Failed to fetch user papers" });
  }
});

// POST /api/v1/papers - Submit paper via API (requires write permission)
app.post("/api/v1/papers", authenticateApiKey, async (req: any, res) => {
  try {
    const { permissions } = req.apiKey;

    if (!permissions || !permissions.write) {
      return res.status(403).json({ error: "Write permission required" });
    }

    const { title, abstract, content, authors, researchField, keywords } = req.body;

    if (!title || !abstract) {
      return res.status(400).json({ error: "Title and abstract are required" });
    }

    const paper = await storage.createPaper({
      title,
      abstract,
      content: content || "",
      authors: authors || [],
      authorIds: [req.apiKey.userId],
      researchField: researchField || "",
      fieldIds: [],
      keywords: keywords || [],
      createdBy: req.apiKey.userId,
      status: "draft",
    });

    res.status(201).json(paper);
  } catch (error) {
    console.error("Error creating paper:", error);
    res.status(500).json({ error: "Failed to create paper" });
  }
});

// ============================================
// API KEY MANAGEMENT ENDPOINTS
// ============================================

// POST /api/api-keys - Create new API key
app.post("/api/api-keys", authenticateToken, async (req: any, res) => {
  try {
    const { name, permissions, expiresAt } = req.body;

    if (!name) {
      return res.status(400).json({ error: "API key name is required" });
    }

    const { apiKey, plainKey } = await storage.createApiKey({
      userId: req.user.id,
      name,
      permissions: permissions || { read: true, write: false },
      expiresAt: expiresAt ? new Date(expiresAt) : undefined,
    });

    // Return the plain key only once - user must save it
    res.status(201).json({
      id: apiKey.id,
      name: apiKey.name,
      key: plainKey, // Only shown once!
      permissions: apiKey.permissions,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      warning: "Save this key now - it won't be shown again!",
    });
  } catch (error) {
    console.error("Error creating API key:", error);
    res.status(500).json({ error: "Failed to create API key" });
  }
});

// GET /api/api-keys - List user's API keys
app.get("/api/api-keys", authenticateToken, async (req: any, res) => {
  try {
    const keys = await storage.getUserApiKeys(req.user.id);

    // Don't return key hashes
    const safeKeys = keys.map((key: any) => ({
      id: key.id,
      name: key.name,
      permissions: key.permissions,
      lastUsedAt: key.lastUsedAt,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
    }));

    res.json(safeKeys);
  } catch (error) {
    console.error("Error fetching API keys:", error);
    res.status(500).json({ error: "Failed to fetch API keys" });
  }
});

// DELETE /api/api-keys/:id - Revoke API key
app.delete("/api/api-keys/:id", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const apiKey = await storage.getApiKey(parseInt(id));

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    if (apiKey.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to delete this API key" });
    }

    await storage.deleteApiKey(parseInt(id));
    res.json({ success: true, message: "API key revoked" });
  } catch (error) {
    console.error("Error deleting API key:", error);
    res.status(500).json({ error: "Failed to delete API key" });
  }
});

// GET /api/api-keys/:id/usage - Get API key usage stats
app.get("/api/api-keys/:id/usage", authenticateToken, async (req: any, res) => {
  try {
    const { id } = req.params;
    const { period = 'hour' } = req.query;

    const apiKey = await storage.getApiKey(parseInt(id));

    if (!apiKey) {
      return res.status(404).json({ error: "API key not found" });
    }

    if (apiKey.userId !== req.user.id) {
      return res.status(403).json({ error: "Not authorized to view this API key usage" });
    }

    const stats = await storage.getApiKeyUsageStats(parseInt(id), period as 'hour' | 'day' | 'week');
    res.json(stats);
  } catch (error) {
    console.error("Error fetching API key usage:", error);
    res.status(500).json({ error: "Failed to fetch API key usage" });
  }
});

// ============================================
// API DOCUMENTATION ENDPOINT
// ============================================

// GET /api/docs - OpenAPI/Swagger documentation
app.get("/api/docs", (req, res) => {
  const apiDocs = {
    openapi: "3.0.0",
    info: {
      title: "Research Papers API",
      version: "1.0.0",
      description: "Public REST API for accessing research papers and user profiles. Requires API key authentication.",
      contact: {
        name: "API Support",
        email: "support@example.com"
      }
    },
    servers: [
      {
        url: process.env.REPL_SLUG 
          ? `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`
          : `http://localhost:${PORT}`,
        description: "Production server"
      }
    ],
    security: [
      {
        ApiKeyAuth: []
      }
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-api-key",
          description: "API key for authentication. Get your API key from the dashboard."
        }
      },
      schemas: {
        Paper: {
          type: "object",
          properties: {
            id: { type: "integer" },
            title: { type: "string" },
            abstract: { type: "string" },
            content: { type: "string" },
            authors: { type: "array", items: { type: "string" } },
            researchField: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
            isPublished: { type: "boolean" },
            publishedAt: { type: "string", format: "date-time" },
            createdAt: { type: "string", format: "date-time" }
          }
        },
        User: {
          type: "object",
          properties: {
            id: { type: "integer" },
            name: { type: "string" },
            orcid: { type: "string" },
            affiliation: { type: "string" },
            bio: { type: "string" }
          }
        },
        Error: {
          type: "object",
          properties: {
            error: { type: "string" }
          }
        }
      }
    },
    paths: {
      "/api/v1/papers": {
        get: {
          summary: "List published papers",
          description: "Get a paginated list of published research papers",
          parameters: [
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } },
            { name: "search", in: "query", schema: { type: "string" } },
            { name: "field", in: "query", schema: { type: "string" } }
          ],
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { type: "object", properties: { papers: { type: "array", items: { $ref: "#/components/schemas/Paper" } }, total: { type: "integer" }, page: { type: "integer" }, totalPages: { type: "integer" } } } } } },
            401: { description: "Unauthorized", content: { "application/json": { schema: { $ref: "#/components/schemas/Error" } } } },
            429: { description: "Rate limit exceeded" }
          }
        },
        post: {
          summary: "Submit a new paper",
          description: "Create a new paper (requires write permission)",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["title", "abstract"],
                  properties: {
                    title: { type: "string" },
                    abstract: { type: "string" },
                    content: { type: "string" },
                    authors: { type: "array", items: { type: "string" } },
                    researchField: { type: "string" },
                    keywords: { type: "array", items: { type: "string" } }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: "Created", content: { "application/json": { schema: { $ref: "#/components/schemas/Paper" } } } },
            400: { description: "Bad request" },
            403: { description: "Write permission required" }
          }
        }
      },
      "/api/v1/papers/search": {
        get: {
          summary: "Search papers",
          description: "Advanced search for research papers",
          parameters: [
            { name: "query", in: "query", schema: { type: "string" } },
            { name: "author", in: "query", schema: { type: "string" } },
            { name: "field", in: "query", schema: { type: "string" } },
            { name: "startDate", in: "query", schema: { type: "string", format: "date" } },
            { name: "endDate", in: "query", schema: { type: "string", format: "date" } },
            { name: "sortBy", in: "query", schema: { type: "string", default: "relevance" } },
            { name: "order", in: "query", schema: { type: "string", enum: ["asc", "desc"], default: "desc" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20, maximum: 100 } }
          ],
          responses: {
            200: { description: "Success" }
          }
        }
      },
      "/api/v1/papers/{id}": {
        get: {
          summary: "Get paper details",
          description: "Get detailed information about a specific paper",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } }
          ],
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/Paper" } } } },
            404: { description: "Paper not found" }
          }
        }
      },
      "/api/v1/users/{id}": {
        get: {
          summary: "Get user profile",
          description: "Get public profile information for a user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } }
          ],
          responses: {
            200: { description: "Success", content: { "application/json": { schema: { $ref: "#/components/schemas/User" } } } },
            404: { description: "User not found" }
          }
        }
      },
      "/api/v1/users/{id}/papers": {
        get: {
          summary: "Get user's papers",
          description: "Get all published papers by a specific user",
          parameters: [
            { name: "id", in: "path", required: true, schema: { type: "integer" } },
            { name: "page", in: "query", schema: { type: "integer", default: 1 } },
            { name: "limit", in: "query", schema: { type: "integer", default: 20 } }
          ],
          responses: {
            200: { description: "Success" }
          }
        }
      }
    }
  };

  res.json(apiDocs);
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
  
  // Start background jobs
  startBackgroundJobs();
});