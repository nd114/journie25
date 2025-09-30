import fs from "fs";
import path from "path";
import { DataCollector } from "./data-collectors";

interface PubMedArticle {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  doi?: string;
  keywords: string[];
}

interface PubMedSearchResult {
  esearchresult: {
    idlist: string[];
    count: string;
  };
}

interface PubMedSummaryResult {
  result: {
    [pmid: string]: {
      title: string;
      authors: Array<{ name: string }>;
      pubdate: string;
      source: string;
      doi?: string;
      abstract?: string;
    };
  };
}

class PubMedFetcher {
  private baseUrl = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils";
  private email = "your-email@example.com"; // PubMed requests an email for API usage
  private tool = "research-platform";

  async searchPubMed(
    query: string,
    maxResults: number = 20,
  ): Promise<string[]> {
    try {
      const searchUrl = `${this.baseUrl}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${maxResults}&retmode=json&email=${this.email}&tool=${this.tool}`;

      console.log(`Searching PubMed for: ${query}`);
      const response = await fetch(searchUrl);
      const data: PubMedSearchResult = await response.json();

      return data.esearchresult.idlist || [];
    } catch (error) {
      console.error("Error searching PubMed:", error);
      return [];
    }
  }

  async fetchArticleDetails(pmids: string[]): Promise<PubMedArticle[]> {
    if (pmids.length === 0) return [];

    try {
      // Fetch summaries
      const summaryUrl = `${this.baseUrl}/esummary.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=json&email=${this.email}&tool=${this.tool}`;
      const summaryResponse = await fetch(summaryUrl);
      const summaryData: PubMedSummaryResult = await summaryResponse.json();

      // Fetch abstracts
      const abstractUrl = `${this.baseUrl}/efetch.fcgi?db=pubmed&id=${pmids.join(",")}&retmode=xml&email=${this.email}&tool=${this.tool}`;
      const abstractResponse = await fetch(abstractUrl);
      const abstractXml = await abstractResponse.text();

      const articles: PubMedArticle[] = [];

      for (const pmid of pmids) {
        const summary = summaryData.result[pmid];
        if (!summary) continue;

        // Extract abstract from XML (simplified - would need proper XML parsing)
        const abstractMatch = abstractXml.match(
          new RegExp(
            `<PMID Version="1">${pmid}</PMID>[\\s\\S]*?<AbstractText[^>]*>([\\s\\S]*?)</AbstractText>`,
            "i",
          ),
        );
        const abstract = abstractMatch
          ? abstractMatch[1].replace(/<[^>]*>/g, "").trim()
          : "";

        if (abstract) {
          articles.push({
            pmid,
            title: summary.title || "No title available",
            abstract,
            authors: summary.authors?.map((a) => a.name) || [],
            journal: summary.source || "Unknown journal",
            pubDate: summary.pubdate || "",
            doi: summary.doi,
            keywords: this.extractKeywordsFromText(abstract),
          });
        }
      }

      return articles;
    } catch (error) {
      console.error("Error fetching article details:", error);
      return [];
    }
  }

  private extractKeywordsFromText(text: string): string[] {
    const commonWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "by",
      "this",
      "that",
      "we",
      "our",
      "study",
      "research",
      "analysis",
      "results",
      "conclusion",
      "method",
      "approach",
    ]);

    const words = text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 3 && !commonWords.has(word));

    const wordCount: { [key: string]: number } = {};
    words.forEach((word) => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    return Object.entries(wordCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }

  async fetchAndSave(query: string, maxResults: number = 50): Promise<string> {
    console.log(`\n🔍 Fetching PubMed articles for: "${query}"`);
    console.log(`📊 Max results: ${maxResults}`);

    // Search for article IDs
    const pmids = await this.searchPubMed(query, maxResults);
    console.log(`✅ Found ${pmids.length} articles`);

    if (pmids.length === 0) {
      console.log("❌ No articles found for this query");
      return "";
    }

    // Fetch detailed article data
    console.log("📥 Fetching article details...");
    const articles = await this.fetchArticleDetails(pmids);
    console.log(
      `✅ Successfully fetched ${articles.length} articles with abstracts`,
    );

    if (articles.length === 0) {
      console.log("❌ No articles with abstracts found");
      return "";
    }

    // Use DataCollector to format and save
    const collector = new DataCollector();
    const filename = await collector.formatPubMedData(articles);

    console.log(`💾 Articles saved to: ${filename}`);
    console.log(
      `\n🎉 Ready to import! Run: npm run import-articles json data/${filename}`,
    );

    return filename;
  }
}

// Example usage
async function fetchByTopic() {
  const fetcher = new PubMedFetcher();

  console.log(`
🧬 PubMed Research Article Fetcher

Popular research queries you can use:
1. "machine learning healthcare" - AI in medicine
2. "CRISPR gene editing" - Gene therapy research  
3. "climate change adaptation" - Environmental research
4. "quantum computing algorithms" - Quantum research
5. "cancer immunotherapy" - Cancer treatment research
6. "artificial intelligence diagnosis" - AI diagnostics
7. "renewable energy storage" - Clean energy research
8. "brain computer interface" - Neurotechnology

Or create your own query with keywords like:
- "deep learning" AND "medical imaging"
- "COVID-19" AND "vaccine"
- "alzheimer" AND "treatment"
  `);

  // Fetch AI in healthcare articles
  await fetcher.fetchAndSave("machine learning healthcare", 25);
}

// Export for use in other files
export { PubMedFetcher, fetchByTopic };

// Run if called directly
if (require.main === module) {
  const query = process.argv[2] || "machine learning healthcare";
  const maxResults = parseInt(process.argv[3]) || 25;

  const fetcher = new PubMedFetcher();
  fetcher
    .fetchAndSave(query, maxResults)
    .then(() => {
      console.log("\n✅ PubMed fetch completed!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("❌ Error:", error);
      process.exit(1);
    });
}
