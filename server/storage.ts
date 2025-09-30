import { users, papers, comments, reviews, citations, paperVersions, paperInsights, paperViews, trendingTopics, userInteractions, userProgress, achievements, visualAbstracts, type User, type InsertUser, type Paper, type InsertPaper, type Comment, type InsertComment, type Review, type InsertReview, type InsertCitation } from "../shared/schema";
import { db } from "./db";
import { eq, desc, asc, and, or, like, isNull, ne, sql, gte } from "drizzle-orm";

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

  // Communities
  getCommunities(category?: string): Promise<any[]>;
  joinCommunity(userId: number, communityId: number): Promise<void>;
  leaveCommunity(userId: number, communityId: number): Promise<void>;

  // Learning paths
  getLearningPaths(): Promise<any[]>;
  getLearningPathProgress(userId: number, pathId: number): Promise<any>;
  completeLearningStep(userId: number, pathId: number, stepId: string): Promise<any>;

  // Research tools
  getResearchTools(): Promise<any[]>;
  useResearchTool(toolId: number, input: any, userId: number): Promise<any>;

  // User bookmarks and engagement
  bookmarkPaper(userId: number, paperId: number): Promise<void>;
  removeBookmark(userId: number, paperId: number): Promise<void>;
  getUserBookmarks(userId: number): Promise<any[]>;
  getUserDashboardData(userId: number): Promise<any>;
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
          like(papers.title, `%${filters.search}%`),
          like(papers.abstract, `%${filters.search}%`)
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
    try {
      await db.insert(paperViews).values({
        paperId: data.paperId,
        userId: data.userId,
        sessionId: data.sessionId,
        readTimeSeconds: data.readTime,
      });
    } catch (error) {
      console.error('Error recording paper view:', error);
    }
  }

  async incrementPaperViews(paperId: number) {
    try {
      await db.update(papers)
        .set({ 
          viewCount: sql`${papers.viewCount} + 1` 
        })
        .where(eq(papers.id, paperId));
    } catch (error) {
      console.error('Error incrementing paper views:', error);
    }
  }

  // Trending papers
  async getTrendingPapers(limit: number = 10) {
    try {
      const result = await db.query.papers.findMany({
        where: eq(papers.isPublished, true),
        orderBy: [desc(papers.viewCount), desc(papers.engagementScore)],
        limit
      });
      return result;
    } catch (error) {
      console.error('Error fetching trending papers:', error);
      return [];
    }
  }

  // Paper insights
  async getPaperInsights(paperId: number) {
    try {
      const result = await db.query.paperInsights.findFirst({
        where: eq(paperInsights.paperId, paperId)
      });
      return result;
    } catch (error) {
      console.error('Error fetching paper insights:', error);
      return null;
    }
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
    try {
      // Simple recommendation based on user's field interests
      const result = await db.query.papers.findMany({
        where: eq(papers.isPublished, true),
        orderBy: [desc(papers.engagementScore)],
        limit
      });
      return result;
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  // Cross-field connections
  async getCrossFieldConnections(paperId: number) {
    try {
      const paper = await db.query.papers.findFirst({
        where: eq(papers.id, paperId)
      });

      if (!paper) return [];

      // Find papers in different fields with similar keywords
      const connections = await db.query.papers.findMany({
        where: and(
          eq(papers.isPublished, true),
          ne(papers.id, paperId),
          ne(papers.researchField, paper.researchField || '')
        ),
        limit: 5
      });

      return connections;
    } catch (error) {
      console.error('Error fetching cross-field connections:', error);
      return [];
    }
  }

  // User interactions
  async recordUserInteraction(data: {
    userId: number;
    paperId: number;
    interactionType: string;
    metadata?: any;
  }) {
    try {
      // Insert into user_interactions table
      await db.insert(userInteractions).values({
        userId: data.userId,
        paperId: data.paperId,
        interactionType: data.interactionType,
        metadata: data.metadata || {},
      });

      // Update engagement score
      await db.update(papers)
        .set({ 
          engagementScore: sql`${papers.engagementScore} + 0.1` 
        })
        .where(eq(papers.id, data.paperId));
    } catch (error) {
      console.error('Error recording user interaction:', error);
    }
  }

  // Gamification methods
  async getUserProgress(userId: number) {
    try {
      const progress = await db.query.userProgress.findFirst({
        where: eq(userProgress.userId, userId)
      });

      if (!progress) {
        // Create initial progress
        const newProgress = await db.insert(userProgress).values({
          userId,
          level: 1,
          xp: 0,
          streakDays: 0
        }).returning();
        return newProgress[0];
      }

      return progress;
    } catch (error) {
      console.error('Error fetching user progress:', error);
      return null;
    }
  }

  async updateQuestProgress(userId: number, questId: string, action: string) {
    try {
      // Update XP based on action
      const xpGain = action === 'read_paper' ? 10 : action === 'comment' ? 5 : 2;

      await db.update(userProgress)
        .set({ 
          xp: sql`${userProgress.xp} + ${xpGain}`,
          updatedAt: new Date()
        })
        .where(eq(userProgress.userId, userId));

      return await this.getUserProgress(userId);
    } catch (error) {
      console.error('Error updating quest progress:', error);
      return null;
    }
  }

  async getUserAchievements(userId: number) {
    try {
      const result = await db.query.achievements.findMany({
        where: eq(achievements.userId, userId),
        orderBy: [desc(achievements.unlockedAt)]
      });
      return result;
    } catch (error) {
      console.error('Error fetching achievements:', error);
      return [];
    }
  }

  async saveVisualAbstract(data: {
    paperId: number;
    userId: number;
    elements: any;
    canvasStyle: any;
  }) {
    try {
      const existing = await db.query.visualAbstracts.findFirst({
        where: and(
          eq(visualAbstracts.paperId, data.paperId),
          eq(visualAbstracts.userId, data.userId)
        )
      });

      if (existing) {
        const updated = await db.update(visualAbstracts)
          .set({
            elements: data.elements,
            canvasStyle: data.canvasStyle,
            updatedAt: new Date()
          })
          .where(eq(visualAbstracts.id, existing.id))
          .returning();
        return updated[0];
      } else {
        const created = await db.insert(visualAbstracts)
          .values(data)
          .returning();
        return created[0];
      }
    } catch (error) {
      console.error('Error saving visual abstract:', error);
      return null;
    }
  }

  async getVisualAbstract(paperId: number) {
    try {
      const result = await db.query.visualAbstracts.findFirst({
        where: eq(visualAbstracts.paperId, paperId)
      });
      return result;
    } catch (error) {
      console.error('Error fetching visual abstract:', error);
      return null;
    }
  }

  async generateMultiLevelContent(paperId: number) {
    try {
      const paper = await db.query.papers.findFirst({
        where: eq(papers.id, paperId)
      });

      if (!paper) return null;

      // Generate simplified versions (mock implementation)
      return {
        elementary: {
          title: `Simple: ${paper.title}`,
          content: "This research explains something important in simple terms."
        },
        highSchool: {
          title: `For Students: ${paper.title}`,
          content: "This study investigates an interesting question using scientific methods."
        },
        undergraduate: {
          title: `Academic: ${paper.title}`,
          content: paper.abstract || "Abstract content here."
        },
        expert: {
          title: paper.title,
          content: paper.content || "Full research content here."
        }
      };
    } catch (error) {
      console.error('Error generating multi-level content:', error);
      return null;
    }
  }

  // Trending topics
  async getTrendingTopics(limit: number = 10) {
    try {
      const result = await db.query.trendingTopics.findMany({
        orderBy: [desc(trendingTopics.momentumScore)],
        limit
      });
      return result;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
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

  // Communities implementation
  async getCommunities(category?: string, userId?: number) {
    try {
      const result = await db.query.communities.findMany({
        where: category ? eq(communities.category, category) : undefined,
        orderBy: [desc(communities.memberCount)]
      });

      // Check membership status for authenticated users
      let communitiesWithMembership = result;
      if (userId) {
        const memberships = await db.query.communityMembers.findMany({
          where: eq(communityMembers.userId, userId)
        });
        const membershipMap = new Set(memberships.map(m => m.communityId));
        
        communitiesWithMembership = result.map(c => ({
          ...c,
          isJoined: membershipMap.has(c.id)
        }));
      } else {
        communitiesWithMembership = result.map(c => ({
          ...c,
          isJoined: false
        }));
      }

      return communitiesWithMembership;
    } catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  }

  async joinCommunity(userId: number, communityId: number) {
    try {
      // Check if already a member
      const existing = await db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      });

      if (existing) {
        throw new Error('Already a member of this community');
      }

      // Add membership
      await db.insert(communityMembers).values({
        userId,
        communityId,
        role: 'member'
      });

      // Update member count
      await db.update(communities)
        .set({ 
          memberCount: sql`${communities.memberCount} + 1` 
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveCommunity(userId: number, communityId: number) {
    try {
      // Remove membership
      const deleted = await db.delete(communityMembers)
        .where(and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        ))
        .returning();

      if (deleted.length === 0) {
        throw new Error('Not a member of this community');
      }

      // Update member count
      await db.update(communities)
        .set({ 
          memberCount: sql`${communities.memberCount} - 1` 
        })
        .where(eq(communities.id, communityId));
    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }

  async createCommunity(data: {
    name: string;
    description: string;
    category: string;
    memberCount?: number;
  }) {
    try {
      const [community] = await db.insert(communities).values({
        name: data.name,
        description: data.description,
        category: data.category,
        memberCount: data.memberCount || 0
      }).returning();
      
      return community;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  // Learning paths implementation
  async getLearningPaths(userId?: number) {
    try {
      const paths = await db.query.learningPaths.findMany({
        orderBy: [asc(learningPaths.difficulty)]
      });

      // Get user progress if authenticated
      if (userId) {
        const progresses = await db.query.userLearningProgress.findMany({
          where: eq(userLearningProgress.userId, userId)
        });
        
        const progressMap = new Map(progresses.map(p => [p.pathId, p]));
        
        return paths.map(path => {
          const userProgress = progressMap.get(path.id);
          const completedSteps = userProgress?.completedSteps as string[] || [];
          
          return {
            ...path,
            userProgress: userProgress?.overallProgress || 0,
            steps: (path.steps as any[]).map(step => ({
              ...step,
              completed: completedSteps.includes(step.id)
            }))
          };
        });
      }

      return paths.map(path => ({
        ...path,
        userProgress: 0,
        steps: (path.steps as any[]).map(step => ({
          ...step,
          completed: false
        }))
      }));
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      return [];
    }
  }

  async getLearningPathProgress(userId: number, pathId: number) {
    // Mock implementation - would query user_learning_progress table
    return {
      pathId,
      userId,
      completedSteps: [],
      overallProgress: 0,
      startedAt: new Date(),
      lastAccessedAt: new Date()
    };
  }

  async completeLearningStep(userId: number, pathId: number, stepId: string) {
    try {
      // Get or create user progress
      let progress = await db.query.userLearningProgress.findFirst({
        where: and(
          eq(userLearningProgress.userId, userId),
          eq(userLearningProgress.pathId, pathId)
        )
      });

      if (!progress) {
        // Create new progress record
        [progress] = await db.insert(userLearningProgress).values({
          userId,
          pathId,
          completedSteps: [stepId],
          overallProgress: 1
        }).returning();
      } else {
        // Update existing progress
        const completedSteps = progress.completedSteps as string[] || [];
        if (!completedSteps.includes(stepId)) {
          completedSteps.push(stepId);
          
          // Get the learning path to calculate progress
          const path = await db.query.learningPaths.findFirst({
            where: eq(learningPaths.id, pathId)
          });
          
          const totalSteps = (path?.steps as any[])?.length || 1;
          const newProgress = Math.round((completedSteps.length / totalSteps) * 100);
          
          await db.update(userLearningProgress)
            .set({
              completedSteps,
              overallProgress: newProgress,
              lastAccessedAt: new Date()
            })
            .where(and(
              eq(userLearningProgress.userId, userId),
              eq(userLearningProgress.pathId, pathId)
            ));
        }
      }
      
      return progress;
    } catch (error) {
      console.error('Error completing learning step:', error);
      throw error;
    }
  }

  async joinCommunity(userId: number, communityId: number) {
    try {
      // Check if already a member
      const existingMembership = await db.query.communityMembers.findFirst({
        where: and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        )
      });

      if (existingMembership) {
        throw new Error('Already a member of this community');
      }

      // Add membership
      await db.insert(communityMembers).values({
        userId,
        communityId
      });

      // Update member count
      await db.update(communities)
        .set({ 
          memberCount: sql`${communities.memberCount} + 1`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));

    } catch (error) {
      console.error('Error joining community:', error);
      throw error;
    }
  }

  async leaveCommunity(userId: number, communityId: number) {
    try {
      // Remove membership
      await db.delete(communityMembers)
        .where(and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        ));

      // Update member count
      await db.update(communities)
        .set({ 
          memberCount: sql`${communities.memberCount} - 1`,
          updatedAt: new Date()
        })
        .where(eq(communities.id, communityId));

    } catch (error) {
      console.error('Error leaving community:', error);
      throw error;
    }
  }

  async getTrendingTopics() {
    try {
      const trending = await db.query.trendingTopics.findMany({
        orderBy: [desc(trendingTopics.momentumScore)],
        limit: 20
      });

      // Get recent papers for trending topics
      const trendingWithPapers = await Promise.all(
        trending.map(async (topic) => {
          const relatedPapers = await db.query.papers.findMany({
            where: sql`${papers.keywords}::text ILIKE ${'%' + topic.topic + '%'}`,
            orderBy: [desc(papers.publishedAt)],
            limit: 5
          });

          return {
            ...topic,
            papers: relatedPapers
          };
        })
      );

      return trendingWithPapers;
    } catch (error) {
      console.error('Error fetching trending topics:', error);
      return [];
    }
  }

  async getResearchTools() {
    try {
      const tools = await db.query.researchTools.findMany({
        where: eq(researchTools.isActive, true),
        orderBy: [asc(researchTools.category), asc(researchTools.name)]
      });

      return tools;
    } catch (error) {
      console.error('Error fetching research tools:', error);
      return [];
    }
  }

  async getUserBookmarks(userId: number) {
    try {
      const bookmarks = await db.query.userBookmarks.findMany({
        where: eq(userBookmarks.userId, userId),
        with: {
          paper: {
            with: {
              creator: true
            }
          }
        },
        orderBy: [desc(userBookmarks.createdAt)]
      });

      return bookmarks;
    } catch (error) {
      console.error('Error fetching user bookmarks:', error);
      return [];
    }
  }

  async addBookmark(userId: number, paperId: number) {
    try {
      // Check if bookmark already exists
      const existing = await db.query.userBookmarks.findFirst({
        where: and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.paperId, paperId)
        )
      });

      if (existing) {
        throw new Error('Paper already bookmarked');
      }

      await db.insert(userBookmarks).values({
        userId,
        paperId
      });
    } catch (error) {
      console.error('Error adding bookmark:', error);
      throw error;
    }
  }

  async removeBookmark(userId: number, paperId: number) {
    try {
      await db.delete(userBookmarks)
        .where(and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.paperId, paperId)
        ));
    } catch (error) {
      console.error('Error removing bookmark:', error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();
        const newProgress = await db.insert(userLearningProgress).values({
          userId,
          pathId,
