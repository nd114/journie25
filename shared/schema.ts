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
