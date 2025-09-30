import "dotenv/config";
import { db } from "./db";
import { papers } from "../shared/schema";
import { count, eq } from "drizzle-orm";

async function checkArticleCount() {
  try {
    console.log("📊 Checking article database statistics...\n");

    // Total articles
    const totalCount = await db.select({ count: count() }).from(papers);
    console.log(`📄 Total articles: ${totalCount[0].count}`);

    // Published articles
    const publishedCount = await db
      .select({ count: count() })
      .from(papers)
      .where(eq(papers.isPublished, true));
    console.log(`✅ Published articles: ${publishedCount[0].count}`);

    // Draft articles
    const draftCount = await db
      .select({ count: count() })
      .from(papers)
      .where(eq(papers.isPublished, false));
    console.log(`📝 Draft articles: ${draftCount[0].count}`);

    // Articles by research field
    console.log("\n🔬 Articles by research field:");
    const fieldStats = await db.query.papers.findMany({
      columns: {
        researchField: true,
      },
      where: eq(papers.isPublished, true),
    });

    const fieldCounts: { [key: string]: number } = {};
    fieldStats.forEach((paper) => {
      const field = paper.researchField || "Unknown";
      fieldCounts[field] = (fieldCounts[field] || 0) + 1;
    });

    Object.entries(fieldCounts)
      .sort(([, a], [, b]) => b - a)
      .forEach(([field, count]) => {
        console.log(`  ${field}: ${count} articles`);
      });

    // Recent imports
    console.log("\n📅 Recent articles (last 5):");
    const recentArticles = await db.query.papers.findMany({
      columns: {
        title: true,
        authors: true,
        createdAt: true,
        isPublished: true,
      },
      orderBy: (papers, { desc }) => [desc(papers.createdAt)],
      limit: 5,
    });

    recentArticles.forEach((article) => {
      const status = article.isPublished ? "✅ Published" : "📝 Draft";
      const authors = Array.isArray(article.authors)
        ? article.authors.slice(0, 2).join(", ")
        : "Unknown";
      console.log(
        `  ${status} - "${article.title.substring(0, 60)}..." by ${authors}`,
      );
    });

    // Author handling analysis
    console.log("\n👥 Author handling analysis:");
    const authorsWithExternal = await db.query.papers.findMany({
      columns: {
        authors: true,
        authorIds: true,
        createdBy: true,
      },
      where: eq(papers.isPublished, true),
      limit: 10,
    });

    let externalAuthorCount = 0;
    let platformUserCount = 0;

    authorsWithExternal.forEach((paper) => {
      const authors = Array.isArray(paper.authors) ? paper.authors : [];
      const authorIds = Array.isArray(paper.authorIds) ? paper.authorIds : [];

      externalAuthorCount += authors.length;
      platformUserCount += authorIds.length;
    });

    console.log(`  📝 External author names (strings): ${externalAuthorCount}`);
    console.log(`  👤 Platform user associations: ${platformUserCount}`);
    console.log(
      `  📊 Ratio: ${(externalAuthorCount / Math.max(platformUserCount, 1)).toFixed(2)} external names per platform user`,
    );

    console.log("\n🎉 Database check complete!");
  } catch (error) {
    console.error("❌ Error checking database:", error);
  } finally {
    process.exit(0);
  }
}

checkArticleCount();
