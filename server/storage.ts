import { users, papers, comments, reviews, citations, paperVersions, paperInsights, paperViews, trendingTopics, userInteractions, userProgress, achievements, visualAbstracts, communities, communityMembers, userFollows, userBookmarks, peerReviewAssignments, peerReviewSubmissions, paperAnalytics, userAnalytics, analyticsEvents, type User, type InsertUser, type Paper, type InsertPaper, type Comment, type InsertComment, type Review, type InsertReview, type InsertCitation, type InsertPeerReviewAssignment, type InsertPeerReviewSubmission, type PaperAnalytics, type InsertPaperAnalytics, type UserAnalytics, type InsertUserAnalytics, type AnalyticsEvent, type InsertAnalyticsEvent } from "../shared/schema";
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
  advancedSearchPapers(filters: { query?: string; author?: string; field?: string; startDate?: string; endDate?: string; sortBy?: string; order?: 'asc' | 'desc'; page?: number; limit?: number }): Promise<{ papers: Paper[]; total: number; page: number; totalPages: number }>;
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
  createCommunity(data: { name: string; description: string; category: string; createdBy: number }): Promise<any>;
  joinCommunity(userId: number, communityId: number): Promise<void>;
  leaveCommunity(userId: number, communityId: number): Promise<void>;
  getUserCommunities(userId: number): Promise<any[]>;

  // User follows
  followUser(followerId: number, followingId: number): Promise<void>;
  unfollowUser(followerId: number, followingId: number): Promise<void>;
  getUserFollowers(userId: number): Promise<any[]>;
  getUserFollowing(userId: number): Promise<any[]>;
  isFollowing(followerId: number, followingId: number): Promise<boolean>;

  // User bookmarks
  addBookmark(userId: number, paperId: number): Promise<void>;
  removeBookmark(userId: number, paperId: number): Promise<void>;
  getUserBookmarks(userId: number): Promise<any[]>;
  isBookmarked(userId: number, paperId: number): Promise<boolean>;

  // Activity feed
  getUserActivityFeed(userId: number, limit?: number): Promise<any[]>;

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

  // Peer review methods
  createReviewAssignment(data: { paperId: number; reviewerId: number; deadline?: Date; isBlind: boolean; assignedBy: number }): Promise<any>;
  getReviewAssignments(reviewerId: number): Promise<any[]>;
  submitPeerReview(assignmentId: number, data: { rating: number; recommendation: string; comments: string }): Promise<any>;
  getPeerReviews(paperId: number): Promise<any[]>;
  updateReviewStatus(paperId: number, status: string): Promise<void>;

  // Analytics methods
  getPaperAnalytics(paperId: number): Promise<PaperAnalytics | undefined>;
  getUserAnalytics(userId: number): Promise<UserAnalytics | undefined>;
  updatePaperAnalytics(paperId: number, data: Partial<PaperAnalytics>): Promise<PaperAnalytics | undefined>;
  updateUserAnalytics(userId: number, data: Partial<UserAnalytics>): Promise<UserAnalytics | undefined>;
  trackAnalyticsEvent(eventType: string, entityId: number, entityType: string, userId: number | null, metadata?: any): Promise<AnalyticsEvent>;
  calculateEngagementScore(paperId: number): Promise<number>;
  calculateImpactScore(userId: number): Promise<number>;
  calculateHIndex(userId: number): Promise<number>;
  getDashboardAnalytics(): Promise<any>;
  getTrendingAnalytics(limit?: number): Promise<any>;
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

  async advancedSearchPapers(filters: { 
    query?: string; 
    author?: string; 
    field?: string; 
    startDate?: string; 
    endDate?: string; 
    sortBy?: string; 
    order?: 'asc' | 'desc'; 
    page?: number; 
    limit?: number 
  }): Promise<{ papers: Paper[]; total: number; page: number; totalPages: number }> {
    const conditions: any[] = [eq(papers.isPublished, true)];
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const offset = (page - 1) * limit;

    // Full-text search across title, abstract, and content
    if (filters.query) {
      conditions.push(
        or(
          like(papers.title, `%${filters.query}%`),
          like(papers.abstract, `%${filters.query}%`),
          like(papers.content, `%${filters.query}%`)
        )
      );
    }

    // Author filter
    if (filters.author) {
      conditions.push(sql`${papers.authors}::text ILIKE ${'%' + filters.author + '%'}`);
    }

    // Field filter
    if (filters.field) {
      conditions.push(eq(papers.researchField, filters.field));
    }

    // Date range filter
    if (filters.startDate) {
      conditions.push(gte(papers.publishedAt, new Date(filters.startDate)));
    }
    if (filters.endDate) {
      conditions.push(sql`${papers.publishedAt} <= ${new Date(filters.endDate)}`);
    }

    // Count total results
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(papers)
      .where(and(...conditions));

    const totalResults = Number(count);
    const totalPages = Math.ceil(totalResults / limit);

    // Sorting
    let orderBy;
    const sortOrder = filters.order === 'asc' ? asc : desc;
    
    switch (filters.sortBy) {
      case 'date':
        orderBy = sortOrder(papers.publishedAt);
        break;
      case 'title':
        orderBy = sortOrder(papers.title);
        break;
      case 'views':
        orderBy = sortOrder(papers.viewCount);
        break;
      case 'engagement':
        orderBy = sortOrder(papers.engagementScore);
        break;
      default: // relevance or default
        orderBy = desc(papers.createdAt);
    }

    // Execute paginated query
    const results = await db
      .select()
      .from(papers)
      .where(and(...conditions))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    return {
      papers: results,
      total: totalResults,
      page,
      totalPages
    };
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

  // Community methods
  async getCommunities(category?: string) {
    try {
      if (category) {
        return await db.query.communities.findMany({
          where: eq(communities.category, category),
          orderBy: [desc(communities.memberCount)]
        });
      }
      return await db.query.communities.findMany({
        orderBy: [desc(communities.memberCount)]
      });
    } catch (error) {
      console.error('Error fetching communities:', error);
      return [];
    }
  }

  async createCommunity(data: { name: string; description: string; category: string; createdBy: number }) {
    try {
      const [community] = await db.insert(communities).values({
        name: data.name,
        description: data.description,
        category: data.category,
        memberCount: 1
      }).returning();

      await db.insert(communityMembers).values({
        userId: data.createdBy,
        communityId: community.id,
        role: 'admin'
      });

      return community;
    } catch (error) {
      console.error('Error creating community:', error);
      throw error;
    }
  }

  async joinCommunity(userId: number, communityId: number) {
    try {
      await db.insert(communityMembers).values({
        userId,
        communityId
      });

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
      await db.delete(communityMembers)
        .where(and(
          eq(communityMembers.userId, userId),
          eq(communityMembers.communityId, communityId)
        ));

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

  async getUserCommunities(userId: number) {
    try {
      const memberships = await db.query.communityMembers.findMany({
        where: eq(communityMembers.userId, userId),
        with: {
          community: true
        }
      });
      return memberships.map(m => m.community);
    } catch (error) {
      console.error('Error fetching user communities:', error);
      return [];
    }
  }

  // User follow methods
  async followUser(followerId: number, followingId: number) {
    try {
      if (followerId === followingId) {
        throw new Error('Cannot follow yourself');
      }
      await db.insert(userFollows).values({
        followerId,
        followingId
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  async unfollowUser(followerId: number, followingId: number) {
    try {
      await db.delete(userFollows)
        .where(and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        ));
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  async getUserFollowers(userId: number) {
    try {
      const followers = await db.query.userFollows.findMany({
        where: eq(userFollows.followingId, userId),
        with: {
          follower: true
        }
      });
      return followers.map(f => ({
        id: f.follower.id,
        name: f.follower.name,
        email: f.follower.email,
        affiliation: f.follower.affiliation,
        followedAt: f.createdAt
      }));
    } catch (error) {
      console.error('Error fetching followers:', error);
      return [];
    }
  }

  async getUserFollowing(userId: number) {
    try {
      const following = await db.query.userFollows.findMany({
        where: eq(userFollows.followerId, userId),
        with: {
          following: true
        }
      });
      return following.map(f => ({
        id: f.following.id,
        name: f.following.name,
        email: f.following.email,
        affiliation: f.following.affiliation,
        followedAt: f.createdAt
      }));
    } catch (error) {
      console.error('Error fetching following:', error);
      return [];
    }
  }

  async isFollowing(followerId: number, followingId: number) {
    try {
      const follow = await db.query.userFollows.findFirst({
        where: and(
          eq(userFollows.followerId, followerId),
          eq(userFollows.followingId, followingId)
        )
      });
      return !!follow;
    } catch (error) {
      console.error('Error checking follow status:', error);
      return false;
    }
  }

  async getUserBookmarks(userId: number) {
    try {
      const bookmarks = await db.query.userBookmarks.findMany({
        where: eq(userBookmarks.userId, userId),
        with: {
          paper: true
        },
        orderBy: [desc(userBookmarks.createdAt)]
      });
      return bookmarks.map(b => b.paper);
    } catch (error) {
      console.error('Error fetching bookmarks:', error);
      return [];
    }
  }

  async isBookmarked(userId: number, paperId: number) {
    try {
      const bookmark = await db.query.userBookmarks.findFirst({
        where: and(
          eq(userBookmarks.userId, userId),
          eq(userBookmarks.paperId, paperId)
        )
      });
      return !!bookmark;
    } catch (error) {
      console.error('Error checking bookmark status:', error);
      return false;
    }
  }

  // Activity feed
  async getUserActivityFeed(userId: number, limit: number = 20) {
    try {
      const following = await this.getUserFollowing(userId);
      const followingIds = following.map(f => f.id);

      if (followingIds.length === 0) {
        return [];
      }

      const activities = await db.query.papers.findMany({
        where: and(
          sql`${papers.createdBy} = ANY(${followingIds})`,
          eq(papers.isPublished, true)
        ),
        limit,
        orderBy: [desc(papers.publishedAt)],
        with: {
          creator: true
        }
      });

      return activities.map(paper => ({
        type: 'paper_published',
        paper,
        user: paper.creator,
        createdAt: paper.publishedAt
      }));
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return [];
    }
  }

  // Peer review methods
  async createReviewAssignment(data: { paperId: number; reviewerId: number; deadline?: Date; isBlind: boolean; assignedBy: number }) {
    try {
      const [assignment] = await db
        .insert(peerReviewAssignments)
        .values({
          paperId: data.paperId,
          reviewerId: data.reviewerId,
          deadline: data.deadline,
          isBlind: data.isBlind,
          assignedBy: data.assignedBy,
          status: 'pending',
        })
        .returning();
      return assignment;
    } catch (error) {
      console.error('Error creating review assignment:', error);
      throw error;
    }
  }

  async getReviewAssignments(reviewerId: number) {
    try {
      const assignments = await db.query.peerReviewAssignments.findMany({
        where: eq(peerReviewAssignments.reviewerId, reviewerId),
        with: {
          paper: true,
          submissions: true,
        },
        orderBy: [desc(peerReviewAssignments.createdAt)],
      });
      return assignments;
    } catch (error) {
      console.error('Error fetching review assignments:', error);
      return [];
    }
  }

  async submitPeerReview(assignmentId: number, data: { rating: number; recommendation: string; comments: string }) {
    try {
      const [submission] = await db
        .insert(peerReviewSubmissions)
        .values({
          assignmentId,
          rating: data.rating,
          recommendation: data.recommendation,
          comments: data.comments,
        })
        .returning();

      await db
        .update(peerReviewAssignments)
        .set({ status: 'completed', updatedAt: new Date() })
        .where(eq(peerReviewAssignments.id, assignmentId));

      return submission;
    } catch (error) {
      console.error('Error submitting peer review:', error);
      throw error;
    }
  }

  async getPeerReviews(paperId: number) {
    try {
      const assignments = await db.query.peerReviewAssignments.findMany({
        where: eq(peerReviewAssignments.paperId, paperId),
        with: {
          reviewer: true,
          submissions: true,
        },
        orderBy: [desc(peerReviewAssignments.createdAt)],
      });
      return assignments;
    } catch (error) {
      console.error('Error fetching peer reviews:', error);
      return [];
    }
  }

  async updateReviewStatus(paperId: number, status: string) {
    try {
      await db
        .update(papers)
        .set({ reviewStatus: status, updatedAt: new Date() })
        .where(eq(papers.id, paperId));
    } catch (error) {
      console.error('Error updating review status:', error);
      throw error;
    }
  }

  async getPaperAnalytics(paperId: number): Promise<PaperAnalytics | undefined> {
    try {
      const [analytics] = await db
        .select()
        .from(paperAnalytics)
        .where(eq(paperAnalytics.paperId, paperId));
      
      if (!analytics) {
        const [newAnalytics] = await db
          .insert(paperAnalytics)
          .values({ paperId, totalViews: 0, uniqueVisitors: 0, citationCount: 0, downloadCount: 0, engagementScore: "0.0" })
          .returning();
        return newAnalytics;
      }
      
      return analytics;
    } catch (error) {
      console.error('Error fetching paper analytics:', error);
      return undefined;
    }
  }

  async getUserAnalytics(userId: number): Promise<UserAnalytics | undefined> {
    try {
      const [analytics] = await db
        .select()
        .from(userAnalytics)
        .where(eq(userAnalytics.userId, userId));
      
      if (!analytics) {
        const [newAnalytics] = await db
          .insert(userAnalytics)
          .values({ userId, totalPapers: 0, totalCitations: 0, hIndex: 0, totalViews: 0, totalFollowers: 0, impactScore: "0.0" })
          .returning();
        return newAnalytics;
      }
      
      return analytics;
    } catch (error) {
      console.error('Error fetching user analytics:', error);
      return undefined;
    }
  }

  async updatePaperAnalytics(paperId: number, data: Partial<PaperAnalytics>): Promise<PaperAnalytics | undefined> {
    try {
      await this.getPaperAnalytics(paperId);
      
      const [updated] = await db
        .update(paperAnalytics)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(paperAnalytics.paperId, paperId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error('Error updating paper analytics:', error);
      return undefined;
    }
  }

  async updateUserAnalytics(userId: number, data: Partial<UserAnalytics>): Promise<UserAnalytics | undefined> {
    try {
      await this.getUserAnalytics(userId);
      
      const [updated] = await db
        .update(userAnalytics)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(userAnalytics.userId, userId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error('Error updating user analytics:', error);
      return undefined;
    }
  }

  async trackAnalyticsEvent(eventType: string, entityId: number, entityType: string, userId: number | null, metadata: any = {}): Promise<AnalyticsEvent> {
    try {
      const [event] = await db
        .insert(analyticsEvents)
        .values({
          eventType,
          entityId,
          entityType,
          userId,
          metadata,
        })
        .returning();
      
      if (eventType === 'paper_view' && entityType === 'paper') {
        await this.incrementPaperViews(entityId);
        const currentAnalytics = await this.getPaperAnalytics(entityId);
        const engagementScore = await this.calculateEngagementScore(entityId);
        await this.updatePaperAnalytics(entityId, { 
          totalViews: (currentAnalytics?.totalViews || 0) + 1,
          engagementScore: engagementScore.toString()
        });
      } else if (eventType === 'paper_download' && entityType === 'paper') {
        const currentAnalytics = await this.getPaperAnalytics(entityId);
        await this.updatePaperAnalytics(entityId, { 
          downloadCount: (currentAnalytics?.downloadCount || 0) + 1 
        });
      }
      
      return event;
    } catch (error) {
      console.error('Error tracking analytics event:', error);
      throw error;
    }
  }

  async calculateEngagementScore(paperId: number): Promise<number> {
    try {
      const analytics = await this.getPaperAnalytics(paperId);
      if (!analytics) return 0;

      const views = analytics.totalViews || 0;
      const downloads = analytics.downloadCount || 0;
      const citations = analytics.citationCount || 0;

      const commentsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(comments)
        .where(eq(comments.paperId, paperId));
      
      const reviewsCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(reviews)
        .where(eq(reviews.paperId, paperId));

      const totalComments = Number(commentsCount[0]?.count || 0);
      const totalReviews = Number(reviewsCount[0]?.count || 0);

      const score = (views * 1) + (downloads * 5) + (citations * 10) + (totalComments * 3) + (totalReviews * 7);
      
      return Math.round(score * 100) / 100;
    } catch (error) {
      console.error('Error calculating engagement score:', error);
      return 0;
    }
  }

  async calculateImpactScore(userId: number): Promise<number> {
    try {
      const userPapers = await db
        .select()
        .from(papers)
        .where(eq(papers.createdBy, userId));

      let totalViews = 0;
      let totalCitations = 0;

      for (const paper of userPapers) {
        const analytics = await this.getPaperAnalytics(paper.id);
        if (analytics) {
          totalViews += analytics.totalViews || 0;
          totalCitations += analytics.citationCount || 0;
        }
      }

      const hIndex = await this.calculateHIndex(userId);
      const followersCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(userFollows)
        .where(eq(userFollows.followingId, userId));
      
      const followers = Number(followersCount[0]?.count || 0);

      const score = (totalViews * 0.1) + (totalCitations * 5) + (hIndex * 10) + (followers * 2) + (userPapers.length * 3);
      
      return Math.round(score * 100) / 100;
    } catch (error) {
      console.error('Error calculating impact score:', error);
      return 0;
    }
  }

  async calculateHIndex(userId: number): Promise<number> {
    try {
      const userPapers = await db
        .select()
        .from(papers)
        .where(eq(papers.createdBy, userId));

      const citationCounts: number[] = [];

      for (const paper of userPapers) {
        const analytics = await this.getPaperAnalytics(paper.id);
        citationCounts.push(analytics?.citationCount || 0);
      }

      citationCounts.sort((a, b) => b - a);

      let hIndex = 0;
      for (let i = 0; i < citationCounts.length; i++) {
        if (citationCounts[i] >= i + 1) {
          hIndex = i + 1;
        } else {
          break;
        }
      }

      return hIndex;
    } catch (error) {
      console.error('Error calculating h-index:', error);
      return 0;
    }
  }

  async getDashboardAnalytics(): Promise<any> {
    try {
      const totalUsers = await db
        .select({ count: sql<number>`count(*)` })
        .from(users);
      
      const totalPapers = await db
        .select({ count: sql<number>`count(*)` })
        .from(papers)
        .where(eq(papers.isPublished, true));
      
      const totalViews = await db
        .select({ sum: sql<number>`COALESCE(sum(total_views), 0)` })
        .from(paperAnalytics);
      
      const totalDownloads = await db
        .select({ sum: sql<number>`COALESCE(sum(download_count), 0)` })
        .from(paperAnalytics);

      const recentPapers = await db
        .select()
        .from(papers)
        .where(eq(papers.isPublished, true))
        .orderBy(desc(papers.publishedAt))
        .limit(10);

      const topPapers = await db
        .select({
          paper: papers,
          analytics: paperAnalytics,
        })
        .from(papers)
        .leftJoin(paperAnalytics, eq(papers.id, paperAnalytics.paperId))
        .where(eq(papers.isPublished, true))
        .orderBy(desc(paperAnalytics.totalViews))
        .limit(10);

      return {
        totalUsers: Number(totalUsers[0]?.count || 0),
        totalPapers: Number(totalPapers[0]?.count || 0),
        totalViews: Number(totalViews[0]?.sum || 0),
        totalDownloads: Number(totalDownloads[0]?.sum || 0),
        recentPapers,
        topPapers: topPapers.map(tp => ({
          ...tp.paper,
          analytics: tp.analytics,
        })),
      };
    } catch (error) {
      console.error('Error fetching dashboard analytics:', error);
      return {
        totalUsers: 0,
        totalPapers: 0,
        totalViews: 0,
        totalDownloads: 0,
        recentPapers: [],
        topPapers: [],
      };
    }
  }

  async getTrendingAnalytics(limit: number = 10): Promise<any> {
    try {
      const trendingPapers = await db
        .select({
          paper: papers,
          analytics: paperAnalytics,
        })
        .from(papers)
        .leftJoin(paperAnalytics, eq(papers.id, paperAnalytics.paperId))
        .where(eq(papers.isPublished, true))
        .orderBy(desc(paperAnalytics.engagementScore))
        .limit(limit);

      const topics = await db
        .select()
        .from(trendingTopics)
        .orderBy(desc(trendingTopics.momentumScore))
        .limit(limit);

      const topAuthors = await db
        .select({
          user: users,
          analytics: userAnalytics,
        })
        .from(users)
        .leftJoin(userAnalytics, eq(users.id, userAnalytics.userId))
        .orderBy(desc(userAnalytics.impactScore))
        .limit(limit);

      return {
        trendingPapers: trendingPapers.map(tp => ({
          ...tp.paper,
          analytics: tp.analytics,
        })),
        trendingTopics: topics,
        topAuthors: topAuthors.map(ta => ({
          ...ta.user,
          analytics: ta.analytics,
        })),
      };
    } catch (error) {
      console.error('Error fetching trending analytics:', error);
      return {
        trendingPapers: [],
        trendingTopics: [],
        topAuthors: [],
      };
    }
  }
}

export const storage = new DatabaseStorage();
