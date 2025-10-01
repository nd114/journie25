import { pgTable, text, serial, timestamp, integer, boolean, jsonb, decimal, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { varchar } from "drizzle-orm/pg-core";

// Users table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  orcid: text("orcid"),
  affiliation: text("affiliation"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Journals
export const journals = pgTable("journals", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  issn: text("issn"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Research fields/categories
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  parentId: integer("parent_id").references((): any => fields.id),
});

// Papers table
export const papers = pgTable("papers", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  content: text("content"),
  authors: jsonb("authors").notNull().default([]),
  authorIds: jsonb("author_ids").default([]),
  researchField: text("research_field"),
  fieldIds: jsonb("field_ids").default([]),
  keywords: jsonb("keywords").default([]),
  status: text("status").notNull().default("draft"),
  pdfUrl: text("pdf_url"),
  doi: text("doi"),
  version: integer("version").notNull().default(1),
  isPublished: boolean("is_published").notNull().default(false),
  publishedAt: timestamp("published_at"),
  journalId: integer("journal_id").references(() => journals.id),
  // Phase 2: Research Stories data
  storyData: jsonb("story_data").default({}),
  viewCount: integer("view_count").notNull().default(0),
  engagementScore: integer("engagement_score").notNull().default(0),
  reviewStatus: text("review_status").default("not_requested"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
}, (table) => ({
  isPublishedIdx: index("papers_is_published_idx").on(table.isPublished),
  createdAtIdx: index("papers_created_at_idx").on(table.createdAt),
  viewCountIdx: index("papers_view_count_idx").on(table.viewCount),
  engagementScoreIdx: index("papers_engagement_score_idx").on(table.engagementScore),
  publishedCreatedIdx: index("papers_published_created_idx").on(table.isPublished, table.createdAt),
  publishedEngagementIdx: index("papers_published_engagement_idx").on(table.isPublished, table.engagementScore),
}));

// Paper versions
export const paperVersions = pgTable("paper_versions", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  version: integer("version").notNull(),
  title: text("title").notNull(),
  abstract: text("abstract").notNull(),
  content: text("content"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  parentId: integer("parent_id").references((): any => comments.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  paperIdIdx: index("comments_paper_id_idx").on(table.paperId),
  userIdIdx: index("comments_user_id_idx").on(table.userId),
  createdAtIdx: index("comments_created_at_idx").on(table.createdAt),
  paperUserIdx: index("comments_paper_user_idx").on(table.paperId, table.userId),
  paperCreatedIdx: index("comments_paper_created_idx").on(table.paperId, table.createdAt),
}));

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  rating: integer("rating"),
  content: text("content").notNull(),
  recommendation: text("recommendation"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  paperIdIdx: index("reviews_paper_id_idx").on(table.paperId),
  userIdIdx: index("reviews_user_id_idx").on(table.userId),
  paperUserIdx: index("reviews_paper_user_idx").on(table.paperId, table.userId),
}));

// Peer Review Assignments
export const peerReviewAssignments = pgTable("peer_review_assignments", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  reviewerId: integer("reviewer_id").notNull().references(() => users.id),
  status: text("status").notNull().default("pending"),
  deadline: timestamp("deadline"),
  isBlind: boolean("is_blind").notNull().default(false),
  assignedBy: integer("assigned_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Peer Review Submissions
export const peerReviewSubmissions = pgTable("peer_review_submissions", {
  id: serial("id").primaryKey(),
  assignmentId: integer("assignment_id").notNull().references(() => peerReviewAssignments.id),
  rating: integer("rating").notNull(),
  recommendation: text("recommendation").notNull(),
  comments: text("comments").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

// Citations
export const citations = pgTable("citations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  authors: jsonb("authors").notNull(),
  year: integer("year"),
  journal: text("journal"),
  doi: text("doi"),
  isbn: text("isbn"),
  citationType: text("citation_type").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("citations_user_id_idx").on(table.userId),
  createdAtIdx: index("citations_created_at_idx").on(table.createdAt),
}));

// Phase 2: Paper insights for research stories
export const paperInsights = pgTable("paper_insights", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  keyInsights: jsonb("key_insights").notNull().default([]),
  whyItMatters: text("why_it_matters"),
  realWorldApplications: jsonb("real_world_applications").default([]),
  crossFieldConnections: jsonb("cross_field_connections").default([]),
  impactScore: integer("impact_score").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Phase 2: Paper views tracking
export const paperViews = pgTable("paper_views", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  userId: integer("user_id").references(() => users.id),
  viewedAt: timestamp("viewed_at").defaultNow().notNull(),
  sessionId: text("session_id"),
  readTimeSeconds: integer("read_time_seconds"),
}, (table) => ({
  paperIdIdx: index("paper_views_paper_id_idx").on(table.paperId),
  userIdIdx: index("paper_views_user_id_idx").on(table.userId),
  viewedAtIdx: index("paper_views_viewed_at_idx").on(table.viewedAt),
  paperUserIdx: index("paper_views_paper_user_idx").on(table.paperId, table.userId),
  paperViewedIdx: index("paper_views_paper_viewed_idx").on(table.paperId, table.viewedAt),
}));

// Trending topics table
export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  field: text("field"),
  momentumScore: decimal("momentum_score", { precision: 5, scale: 2 }).default("0.0"),
  paperCount: integer("paper_count").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User interactions tracking
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  interactionType: text("interaction_type").notNull(),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Phase 3: Gamification tables
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  level: integer("level").default(1),
  xp: integer("xp").default(0),
  streakDays: integer("streak_days").default(0),
  lastActiveDate: timestamp("last_active_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementType: text("achievement_type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

export const visualAbstracts = pgTable('visual_abstracts', {
  id: serial('id').primaryKey(),
  paperId: integer('paper_id').references(() => papers.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  elements: jsonb('elements').notNull(),
  canvasStyle: jsonb('canvas_style').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const communities = pgTable('communities', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  memberCount: integer('member_count').default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const communityMembers = pgTable('community_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  communityId: integer('community_id').references(() => communities.id).notNull(),
  joinedAt: timestamp('joined_at').defaultNow().notNull(),
  role: varchar('role', { length: 50 }).default('member'),
});

export const learningPaths = pgTable('learning_paths', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  difficulty: varchar('difficulty', { length: 50 }),
  estimatedHours: integer('estimated_hours'),
  steps: jsonb('steps').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userLearningProgress = pgTable('user_learning_progress', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  pathId: integer('path_id').references(() => learningPaths.id).notNull(),
  completedSteps: jsonb('completed_steps').default('[]'),
  overallProgress: integer('overall_progress').default(0),
  startedAt: timestamp('started_at').defaultNow().notNull(),
  lastAccessedAt: timestamp('last_accessed_at').defaultNow().notNull(),
});

export const researchTools = pgTable('research_tools', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  category: varchar('category', { length: 100 }),
  icon: varchar('icon', { length: 100 }),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const userBookmarks = pgTable('user_bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  paperId: integer('paper_id').references(() => papers.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// User follows (followers/following relationships)
export const userFollows = pgTable('user_follows', {
  id: serial('id').primaryKey(),
  followerId: integer('follower_id').references(() => users.id).notNull(),
  followingId: integer('following_id').references(() => users.id).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Quests
export const quests = pgTable("quests", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // reading, discussing, discovering, sharing
  difficulty: text("difficulty").notNull(), // easy, medium, hard
  maxProgress: integer("max_progress").notNull(),
  rewardXP: integer("reward_xp").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User quest progress
export const userQuestProgress = pgTable("user_quest_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  questId: integer("quest_id").notNull().references(() => quests.id),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Multi-level content
export const multiLevelContent = pgTable("multi_level_content", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  level: text("level").notNull(), // general, intermediate, expert
  title: text("title").notNull(),
  content: text("content").notNull(),
  examples: jsonb("examples").default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Research timelines
export const researchTimelines = pgTable("research_timelines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  paperIds: jsonb("paper_ids").notNull().default([]),
  milestones: jsonb("milestones").default([]),
  isPublic: boolean("is_public").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Collaborative editing tables
export const sectionLocks = pgTable("section_locks", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  sectionId: text("section_id").notNull(),
  userId: integer("user_id").notNull().references(() => users.id),
  userName: text("user_name").notNull(),
  lockedAt: timestamp("locked_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const paperDrafts = pgTable("paper_drafts", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  content: text("content").notNull(),
  version: integer("version").notNull().default(1),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics tables
export const paperAnalytics = pgTable("paper_analytics", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id).unique(),
  totalViews: integer("total_views").notNull().default(0),
  uniqueVisitors: integer("unique_visitors").notNull().default(0),
  citationCount: integer("citation_count").notNull().default(0),
  downloadCount: integer("download_count").notNull().default(0),
  engagementScore: decimal("engagement_score", { precision: 10, scale: 2 }).notNull().default("0.0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userAnalytics = pgTable("user_analytics", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  totalPapers: integer("total_papers").notNull().default(0),
  totalCitations: integer("total_citations").notNull().default(0),
  hIndex: integer("h_index").notNull().default(0),
  totalViews: integer("total_views").notNull().default(0),
  totalFollowers: integer("total_followers").notNull().default(0),
  impactScore: decimal("impact_score", { precision: 10, scale: 2 }).notNull().default("0.0"),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  entityId: integer("entity_id").notNull(),
  entityType: text("entity_type").notNull(),
  userId: integer("user_id").references(() => users.id),
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notifications system
export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  entityType: text("entity_type"),
  entityId: integer("entity_id"),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index("notifications_user_id_idx").on(table.userId),
  isReadIdx: index("notifications_is_read_idx").on(table.isRead),
  createdAtIdx: index("notifications_created_at_idx").on(table.createdAt),
  userReadIdx: index("notifications_user_read_idx").on(table.userId, table.isRead),
  userCreatedIdx: index("notifications_user_created_idx").on(table.userId, table.createdAt),
}));

export const notificationPreferences = pgTable("notification_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id).unique(),
  emailOnComment: boolean("email_on_comment").notNull().default(true),
  emailOnFollow: boolean("email_on_follow").notNull().default(true),
  emailOnCitation: boolean("email_on_citation").notNull().default(true),
  pushNotifications: boolean("push_notifications").notNull().default(true),
  emailOnReviewAssignment: boolean("email_on_review_assignment").notNull().default(true),
  emailOnReviewCompleted: boolean("email_on_review_completed").notNull().default(true),
  emailOnPaperStatus: boolean("email_on_paper_status").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  papers: many(papers),
  comments: many(comments),
  reviews: many(reviews),
  citations: many(citations),
}));

export const journalsRelations = relations(journals, ({ many }) => ({
  papers: many(papers),
}));

export const papersRelations = relations(papers, ({ one, many }) => ({
  creator: one(users, {
    fields: [papers.createdBy],
    references: [users.id],
  }),
  journal: one(journals, {
    fields: [papers.journalId],
    references: [journals.id],
  }),
  comments: many(comments),
  reviews: many(reviews),
  versions: many(paperVersions),
}));

export const commentsRelations = relations(comments, ({ one }) => ({
  paper: one(papers, {
    fields: [comments.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  paper: one(papers, {
    fields: [reviews.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}));

export const peerReviewAssignmentsRelations = relations(peerReviewAssignments, ({ one, many }) => ({
  paper: one(papers, {
    fields: [peerReviewAssignments.paperId],
    references: [papers.id],
  }),
  reviewer: one(users, {
    fields: [peerReviewAssignments.reviewerId],
    references: [users.id],
  }),
  assignedByUser: one(users, {
    fields: [peerReviewAssignments.assignedBy],
    references: [users.id],
  }),
  submissions: many(peerReviewSubmissions),
}));

export const peerReviewSubmissionsRelations = relations(peerReviewSubmissions, ({ one }) => ({
  assignment: one(peerReviewAssignments, {
    fields: [peerReviewSubmissions.assignmentId],
    references: [peerReviewAssignments.id],
  }),
}));

export const citationsRelations = relations(citations, ({ one }) => ({
  user: one(users, {
    fields: [citations.userId],
    references: [users.id],
  }),
}));

// Phase 2 relations
export const paperInsightsRelations = relations(paperInsights, ({ one }) => ({
  paper: one(papers, {
    fields: [paperInsights.paperId],
    references: [papers.id],
  }),
}));

export const paperViewsRelations = relations(paperViews, ({ one }) => ({
  paper: one(papers, {
    fields: [paperViews.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [paperViews.userId],
    references: [users.id],
  }),
}));

export const userInteractionsRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [userInteractions.paperId],
    references: [papers.id],
  }),
}));

export const communityRelations = relations(communities, ({ many }) => ({
  members: many(communityMembers),
}));

export const communityMembersRelations = relations(communityMembers, ({ one }) => ({
  user: one(users, {
    fields: [communityMembers.userId],
    references: [users.id],
  }),
  community: one(communities, {
    fields: [communityMembers.communityId],
    references: [communities.id],
  }),
}));

export const learningPathRelations = relations(learningPaths, ({ many }) => ({
  userProgress: many(userLearningProgress),
}));

export const userLearningProgressRelations = relations(userLearningProgress, ({ one }) => ({
  user: one(users, {
    fields: [userLearningProgress.userId],
    references: [users.id],
  }),
  path: one(learningPaths, {
    fields: [userLearningProgress.pathId],
    references: [learningPaths.id],
  }),
}));

export const researchToolRelations = relations(researchTools, ({}) => ({
  // No relations defined for researchTools for now
}));

export const userBookmarksRelations = relations(userBookmarks, ({ one }) => ({
  user: one(users, {
    fields: [userBookmarks.userId],
    references: [users.id],
  }),
  paper: one(papers, {
    fields: [userBookmarks.paperId],
    references: [papers.id],
  }),
}));

export const userFollowsRelations = relations(userFollows, ({ one }) => ({
  follower: one(users, {
    fields: [userFollows.followerId],
    references: [users.id],
  }),
  following: one(users, {
    fields: [userFollows.followingId],
    references: [users.id],
  }),
}));

export const paperAnalyticsRelations = relations(paperAnalytics, ({ one }) => ({
  paper: one(papers, {
    fields: [paperAnalytics.paperId],
    references: [papers.id],
  }),
}));

export const userAnalyticsRelations = relations(userAnalytics, ({ one }) => ({
  user: one(users, {
    fields: [userAnalytics.userId],
    references: [users.id],
  }),
}));

export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

export const sectionLocksRelations = relations(sectionLocks, ({ one }) => ({
  paper: one(papers, {
    fields: [sectionLocks.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [sectionLocks.userId],
    references: [users.id],
  }),
}));

export const paperDraftsRelations = relations(paperDrafts, ({ one }) => ({
  paper: one(papers, {
    fields: [paperDrafts.paperId],
    references: [papers.id],
  }),
  user: one(users, {
    fields: [paperDrafts.userId],
    references: [users.id],
  }),
}));

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}));

export const notificationPreferencesRelations = relations(notificationPreferences, ({ one }) => ({
  user: one(users, {
    fields: [notificationPreferences.userId],
    references: [users.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Journal = typeof journals.$inferSelect;
export type InsertJournal = typeof journals.$inferInsert;
export type Paper = typeof papers.$inferSelect;
export type InsertPaper = typeof papers.$inferInsert;
export type Comment = typeof comments.$inferSelect;
export type InsertComment = typeof comments.$inferInsert;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;
export type PeerReviewAssignment = typeof peerReviewAssignments.$inferSelect;
export type InsertPeerReviewAssignment = typeof peerReviewAssignments.$inferInsert;
export type PeerReviewSubmission = typeof peerReviewSubmissions.$inferSelect;
export type InsertPeerReviewSubmission = typeof peerReviewSubmissions.$inferInsert;
export type Citation = typeof citations.$inferSelect;
export type InsertCitation = typeof citations.$inferInsert;

// Phase 2 types
export type PaperInsight = typeof paperInsights.$inferSelect;
export type InsertPaperInsight = typeof paperInsights.$inferInsert;
export type PaperView = typeof paperViews.$inferSelect;
export type InsertPaperView = typeof paperViews.$inferInsert;
export type TrendingTopic = typeof trendingTopics.$inferSelect;
export type InsertTrendingTopic = typeof trendingTopics.$inferInsert;
export type UserInteraction = typeof userInteractions.$inferSelect;
export type InsertUserInteraction = typeof userInteractions.$inferInsert;

// Phase 3 types
export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = typeof userProgress.$inferInsert;
export type Quest = typeof quests.$inferSelect;
export type InsertQuest = typeof quests.$inferInsert;
export type UserQuestProgress = typeof userQuestProgress.$inferSelect;
export type InsertUserQuestProgress = typeof userQuestProgress.$inferInsert;
export type Achievement = typeof achievements.$inferSelect;
export type InsertAchievement = typeof achievements.$inferInsert;
export type UserAchievement = typeof userAchievements.$inferSelect;
export type InsertUserAchievement = typeof userAchievements.$inferInsert;
export type VisualAbstract = typeof visualAbstracts.$inferSelect;
export type InsertVisualAbstract = typeof visualAbstracts.$inferInsert;
export type MultiLevelContent = typeof multiLevelContent.$inferSelect;
export type InsertMultiLevelContent = typeof multiLevelContent.$inferInsert;
export type ResearchTimeline = typeof researchTimelines.$inferSelect;
export type InsertResearchTimeline = typeof researchTimelines.$inferInsert;

// New types for added tables
export type Community = typeof communities.$inferSelect;
export type InsertCommunity = typeof communities.$inferInsert;
export type CommunityMember = typeof communityMembers.$inferSelect;
export type InsertCommunityMember = typeof communityMembers.$inferInsert;
export type LearningPath = typeof learningPaths.$inferSelect;
export type InsertLearningPath = typeof learningPaths.$inferInsert;
export type UserLearningProgress = typeof userLearningProgress.$inferSelect;
export type InsertUserLearningProgress = typeof userLearningProgress.$inferInsert;
export type ResearchTool = typeof researchTools.$inferSelect;
export type InsertResearchTool = typeof researchTools.$inferInsert;
export type UserBookmark = typeof userBookmarks.$inferSelect;
export type InsertUserBookmark = typeof userBookmarks.$inferInsert;
export type UserFollow = typeof userFollows.$inferSelect;
export type InsertUserFollow = typeof userFollows.$inferInsert;

// Analytics types
export type PaperAnalytics = typeof paperAnalytics.$inferSelect;
export type InsertPaperAnalytics = typeof paperAnalytics.$inferInsert;
export type UserAnalytics = typeof userAnalytics.$inferSelect;
export type InsertUserAnalytics = typeof userAnalytics.$inferInsert;
export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

// Collaborative editing types
export type SectionLock = typeof sectionLocks.$inferSelect;
export type InsertSectionLock = typeof sectionLocks.$inferInsert;
export type PaperDraft = typeof paperDrafts.$inferSelect;
export type InsertPaperDraft = typeof paperDrafts.$inferInsert;

// Notification types
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;