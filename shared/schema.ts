import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

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
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  createdBy: integer("created_by").notNull().references(() => users.id),
});

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
});

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
});

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
  readTime: integer("read_time_seconds"),
});

// Phase 2: Trending topics
export const trendingTopics = pgTable("trending_topics", {
  id: serial("id").primaryKey(),
  topic: text("topic").notNull(),
  field: text("field"),
  momentum: integer("momentum").notNull().default(0),
  relatedPaperIds: jsonb("related_paper_ids").default([]),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
});

// Phase 2: User interactions for recommendations
export const userInteractions = pgTable("user_interactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  interactionType: text("interaction_type").notNull(), // view, like, share, save, comment
  metadata: jsonb("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Phase 3: Gamification tables

// User progress and levels
export const userProgress = pgTable("user_progress", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  level: integer("level").notNull().default(1),
  experience: integer("experience").notNull().default(0),
  totalPapersRead: integer("total_papers_read").notNull().default(0),
  totalCommentsCreated: integer("total_comments_created").notNull().default(0),
  totalFieldsExplored: integer("total_fields_explored").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastActiveDate: timestamp("last_active_date").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Achievements
export const achievements = pgTable("achievements", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  rarity: text("rarity").notNull(), // common, rare, epic, legendary
  condition: jsonb("condition").notNull(), // criteria for earning
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User achievements
export const userAchievements = pgTable("user_achievements", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  achievementId: integer("achievement_id").notNull().references(() => achievements.id),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

// Phase 3: Creator tools tables

// Visual abstracts
export const visualAbstracts = pgTable("visual_abstracts", {
  id: serial("id").primaryKey(),
  paperId: integer("paper_id").notNull().references(() => papers.id),
  userId: integer("user_id").notNull().references(() => users.id),
  elements: jsonb("elements").notNull().default([]),
  canvasStyle: jsonb("canvas_style").notNull().default({}),
  isPublished: boolean("is_published").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
