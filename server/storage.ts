import { users, papers, comments, reviews, citations, paperVersions, paperInsights, paperViews, trendingTopics, userInteractions, type User, type InsertUser, type Paper, type InsertPaper, type Comment, type InsertComment, type Review, type InsertReview, type InsertCitation } from "../shared/schema";
import { db } from "./db";
import { eq, and, desc, like, or, isNull, sql, gte } from "drizzle-orm";

type InsertPaperVersion = typeof paperVersions.$inferInsert;

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;

  // Paper methods
  getPaper(id: number): Promise<Paper | undefined>;
  getPapers(filters?: { fieldIds?: number[], isPublished?: boolean, search?: string, field?: string }): Promise<Paper[]>;
  createPaper(insertPaper: InsertPaper): Promise<Paper>;
  updatePaper(id: number, updates: Partial<Paper>): Promise<Paper | undefined>;
  deletePaper(id: number): Promise<void>;

  // Comment methods
  getComments(paperId: number): Promise<Comment[]>;
  createComment(insertComment: InsertComment): Promise<Comment>;
  deleteComment(id: number): Promise<void>;

  // Review methods
  getReviews(paperId: number): Promise<Review[]>;
  createReview(insertReview: InsertReview): Promise<Review>;

  // Paper version methods
  createPaperVersion(insertPaperVersion: InsertPaperVersion): Promise<any>;
  getPaperVersions(paperId: number): Promise<any[]>;

  // Citation methods
  createCitation(data: InsertCitation): Promise<any>;
  getCitations(userId: number): Promise<any[]>;

  // Phase 2: Analytics and Research Stories methods

  // Paper view tracking
  recordPaperView(data: { paperId: number; userId?: number | null; sessionId?: string; readTime?: number }): Promise<any>;
  incrementPaperViews(paperId: number): Promise<void>;

  // Trending papers
  getTrendingPapers(limit?: number): Promise<Paper[]>;

  // Paper insights
  getPaperInsights(paperId: number): Promise<any | undefined>;
  createPaperInsights(data: { paperId: number; keyInsights: string[]; whyItMatters: string; realWorldApplications: string[]; crossFieldConnections: any[] }): Promise<any>;

  // User recommendations
  getUserRecommendations(userId: number, limit?: number): Promise<Paper[]>;

  // Cross-field connections
  getCrossFieldConnections(paperId: number): Promise<Paper[]>;

  // User interactions
  recordUserInteraction(data: { userId: number; paperId: number; interactionType: string; metadata: any }): Promise<any>;

  // Trending topics
  getTrendingTopics(limit?: number): Promise<any[]>;
  updateTrendingTopics(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user || undefined;
  }

  // Paper methods
  async getPaper(id: number): Promise<Paper | undefined> {
    const [paper] = await db.select().from(papers).where(eq(papers.id, id));
    return paper || undefined;
  }

  async getPapers(filters?: { fieldIds?: number[], isPublished?: boolean, search?: string, field?: string }): Promise<Paper[]> {
    let query = db.select().from(papers);

    const conditions: any[] = [];

    if (filters?.isPublished !== undefined) {
      conditions.push(eq(papers.isPublished, filters.isPublished));
    }

    if (filters?.search) {
      conditions.push(
        or(
          ilike(papers.title, `%${filters.search}%`),
          ilike(papers.abstract, `%${filters.search}%`)
        )
      );
    }

    if (filters?.field) {
      conditions.push(eq(papers.researchField, filters.field));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    return query.orderBy(desc(papers.createdAt));
  }

  async createPaper(insertPaper: InsertPaper): Promise<Paper> {
    const [paper] = await db
      .insert(papers)
      .values(insertPaper)
      .returning();
    return paper;
  }

  async updatePaper(id: number, updates: Partial<Paper>): Promise<Paper | undefined> {
    const [paper] = await db
      .update(papers)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(papers.id, id))
      .returning();
    return paper || undefined;
  }

  async deletePaper(id: number): Promise<void> {
    await db.delete(papers).where(eq(papers.id, id));
  }

  // Comment methods
  async getComments(paperId: number): Promise<Comment[]> {
    return db.select().from(comments).where(eq(comments.paperId, paperId)).orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  async deleteComment(id: number): Promise<void> {
    await db.delete(comments).where(eq(comments.id, id));
  }

  // Review methods
  async getReviews(paperId: number): Promise<Review[]> {
    return db.select().from(reviews).where(eq(reviews.paperId, paperId)).orderBy(desc(reviews.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  // Paper version methods
  async createPaperVersion(insertPaperVersion: InsertPaperVersion): Promise<any> {
    const [version] = await db
      .insert(paperVersions)
      .values(insertPaperVersion)
      .returning();
    return version;
  }

  async getPaperVersions(paperId: number): Promise<any[]> {
    return db.select().from(paperVersions).where(eq(paperVersions.paperId, paperId)).orderBy(desc(paperVersions.version));
  }

  // Citation methods
  async createCitation(data: InsertCitation) {
    const [citation] = await db.insert(citations).values(data).returning();
    return citation;
  }

  async getCitations(userId: number) {
    return await db.select().from(citations).where(eq(citations.userId, userId));
  }

  // Phase 2: Analytics and Research Stories methods

  // Paper view tracking
  async recordPaperView(data: { paperId: number; userId?: number | null; sessionId?: string; readTime?: number }) {
    const [view] = await db.insert(paperViews).values({
      paperId: data.paperId,
      userId: data.userId,
      sessionId: data.sessionId,
      readTime: data.readTime,
    }).returning();
    return view;
  }

  async incrementPaperViews(paperId: number) {
    await db.update(papers)
      .set({
        viewCount: sql`${papers.viewCount} + 1`,
        engagementScore: sql`${papers.engagementScore} + 1`
      })
      .where(eq(papers.id, paperId));
  }

  // Trending papers
  async getTrendingPapers(limit: number = 10) {
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    return await db.select({
      id: papers.id,
      title: papers.title,
      abstract: papers.abstract,
      authors: papers.authors,
      createdAt: papers.createdAt,
      researchField: papers.researchField,
      viewCount: papers.viewCount,
      engagementScore: papers.engagementScore,
    })
    .from(papers)
    .where(and(
      eq(papers.isPublished, true),
      gte(papers.publishedAt, oneDayAgo)
    ))
    .orderBy(desc(papers.engagementScore), desc(papers.viewCount))
    .limit(limit);
  }

  // Paper insights
  async getPaperInsights(paperId: number) {
    const [insights] = await db.select()
      .from(paperInsights)
      .where(eq(paperInsights.paperId, paperId));
    return insights;
  }

  async createPaperInsights(data: { paperId: number; keyInsights: string[]; whyItMatters: string; realWorldApplications: string[]; crossFieldConnections: any[] }) {
    const [insights] = await db.insert(paperInsights).values({
      paperId: data.paperId,
      keyInsights: data.keyInsights,
      whyItMatters: data.whyItMatters,
      realWorldApplications: data.realWorldApplications,
      crossFieldConnections: data.crossFieldConnections,
    }).returning();
    return insights;
  }

  // User recommendations
  async getUserRecommendations(userId: number, limit: number = 5) {
    // Simple recommendation based on user's viewed papers and fields
    const userInteractionFields = await db.select({
      field: papers.researchField,
    })
    .from(userInteractions)
    .innerJoin(papers, eq(userInteractions.paperId, papers.id))
    .where(eq(userInteractions.userId, userId))
    .groupBy(papers.researchField)
    .limit(3);

    const fields = userInteractionFields.map(f => f.field).filter(Boolean);

    if (fields.length === 0) {
      // Return trending papers if no interaction history
      return await this.getTrendingPapers(limit);
    }

    return await db.select({
      id: papers.id,
      title: papers.title,
      abstract: papers.abstract,
      authors: papers.authors,
      createdAt: papers.createdAt,
      researchField: papers.researchField,
      viewCount: papers.viewCount,
    })
    .from(papers)
    .where(and(
      eq(papers.isPublished, true),
      or(...fields.map(field => eq(papers.researchField, field)))
    ))
    .orderBy(desc(papers.engagementScore))
    .limit(limit);
  }

  // Cross-field connections
  async getCrossFieldConnections(paperId: number) {
    const paper = await this.getPaper(paperId);
    if (!paper) return [];

    // Find papers in different fields with similar keywords or themes
    return await db.select({
      id: papers.id,
      title: papers.title,
      abstract: papers.abstract,
      researchField: papers.researchField,
      authors: papers.authors,
    })
    .from(papers)
    .where(and(
      eq(papers.isPublished, true),
      sql`${papers.researchField} != ${paper.researchField}`,
      sql`${papers.id} != ${paperId}`
    ))
    .orderBy(desc(papers.viewCount))
    .limit(5);
  }

  // User interactions
  async recordUserInteraction(data: { userId: number; paperId: number; interactionType: string; metadata: any }) {
    const [interaction] = await db.insert(userInteractions).values(data).returning();

    // Update engagement score
    await db.update(papers)
      .set({
        engagementScore: sql`${papers.engagementScore} + ${this.getInteractionWeight(data.interactionType)}`
      })
      .where(eq(papers.id, data.paperId));

    return interaction;
  }

  private getInteractionWeight(type: string): number {
    const weights = {
      'view': 1,
      'like': 3,
      'share': 5,
      'save': 4,
      'comment': 6,
    };
    return weights[type as keyof typeof weights] || 1;
  }

  // Trending topics
  async getTrendingTopics(limit: number = 10) {
    return await db.select()
      .from(trendingTopics)
      .orderBy(desc(trendingTopics.momentum), desc(trendingTopics.calculatedAt))
      .limit(limit);
  }

  async updateTrendingTopics() {
    // Calculate trending topics based on recent paper activity
    const recentPapers = await db.select({
      field: papers.researchField,
      viewCount: papers.viewCount,
      commentCount: sql<number>`(SELECT COUNT(*) FROM ${comments} WHERE ${comments.paperId} = ${papers.id})`,
    })
    .from(papers)
    .where(and(
      eq(papers.isPublished, true),
      gte(papers.publishedAt, new Date(Date.now() - 7 * 24 * 60 * 60 * 1000))
    ));

    // Group by field and calculate momentum
    const fieldMomentum = recentPapers.reduce((acc: any, paper) => {
      if (!paper.field) return acc;
      if (!acc[paper.field]) {
        acc[paper.field] = { momentum: 0, papers: [] };
      }
      acc[paper.field].momentum += (paper.viewCount || 0) + (paper.commentCount || 0) * 3;
      return acc;
    }, {});

    // Update trending topics
    for (const [field, data] of Object.entries(fieldMomentum)) {
      await db.insert(trendingTopics).values({
        topic: field,
        field: field,
        momentum: (data as any).momentum,
        relatedPaperIds: [],
      }).onConflictDoUpdate({
        target: trendingTopics.topic,
        set: {
          momentum: (data as any).momentum,
          calculatedAt: new Date(),
        }
      });
    }
  }
}

export const storage = new DatabaseStorage();