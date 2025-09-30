
import fs from 'fs';
import path from 'path';

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

interface ArxivArticle {
  id: string;
  title: string;
  abstract: string;
  authors: string[];
  categories: string[];
  submitted: string;
  doi?: string;
}

class DataCollector {
  private outputDir: string;

  constructor(outputDir = './data') {
    this.outputDir = outputDir;
    this.ensureOutputDir();
  }

  private ensureOutputDir() {
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // Helper to manually format data from various sources
  async formatPubMedData(pubmedData: PubMedArticle[]) {
    const formatted = pubmedData.map(article => ({
      title: article.title,
      abstract: article.abstract,
      authors: article.authors,
      journal: article.journal,
      doi: article.doi,
      publishedDate: article.pubDate,
      keywords: article.keywords,
      researchField: this.inferFieldFromKeywords(article.keywords),
      subjects: article.keywords,
      externalId: article.pmid,
      source: "PubMed"
    }));

    const filename = `pubmed-articles-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(this.outputDir, filename),
      JSON.stringify({ articles: formatted }, null, 2)
    );

    console.log(`Formatted ${formatted.length} PubMed articles saved to ${filename}`);
    return filename;
  }

  async formatArxivData(arxivData: ArxivArticle[]) {
    const formatted = arxivData.map(article => ({
      title: article.title,
      abstract: article.abstract,
      authors: article.authors,
      journal: "arXiv preprint",
      doi: article.doi,
      publishedDate: article.submitted,
      keywords: this.extractKeywordsFromAbstract(article.abstract),
      researchField: this.mapArxivCategory(article.categories[0]),
      subjects: article.categories,
      externalId: article.id,
      source: "arXiv"
    }));

    const filename = `arxiv-articles-${Date.now()}.json`;
    fs.writeFileSync(
      path.join(this.outputDir, filename),
      JSON.stringify({ articles: formatted }, null, 2)
    );

    console.log(`Formatted ${formatted.length} arXiv articles saved to ${filename}`);
    return filename;
  }

  // Helper methods
  private inferFieldFromKeywords(keywords: string[]): string {
    const fieldMappings = {
      'AI|machine learning|neural network|deep learning': 'Computer Science',
      'climate|environment|sustainability|carbon': 'Environmental Science',
      'gene|DNA|CRISPR|protein|molecular': 'Biotechnology',
      'quantum|physics|particle|photon': 'Physics',
      'brain|neuron|cognitive|neural': 'Neuroscience',
      'cancer|disease|therapy|medical|clinical': 'Medicine',
      'space|planet|astronomy|cosmology': 'Space Science'
    };

    const keywordStr = keywords.join(' ').toLowerCase();
    
    for (const [pattern, field] of Object.entries(fieldMappings)) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(keywordStr)) {
        return field;
      }
    }
    
    return 'General Science';
  }

  private mapArxivCategory(category: string): string {
    const mappings: { [key: string]: string } = {
      'cs.': 'Computer Science',
      'physics.': 'Physics',
      'q-bio.': 'Biology',
      'math.': 'Mathematics',
      'stat.': 'Statistics',
      'econ.': 'Economics',
      'astro-ph': 'Astrophysics'
    };

    for (const [prefix, field] of Object.entries(mappings)) {
      if (category.startsWith(prefix)) {
        return field;
      }
    }
    
    return 'General Science';
  }

  private extractKeywordsFromAbstract(abstract: string): string[] {
    // Simple keyword extraction - could be enhanced with NLP
    const commonWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'this', 'that', 'these', 'those', 'we', 'our', 'study', 'research', 'paper', 'work', 'results', 'show', 'demonstrate', 'propose', 'present', 'method', 'approach']);
    
    const words = abstract.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word));
    
    // Get most frequent non-common words
    const wordCount: { [key: string]: number } = {};
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });
    
    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 8)
      .map(([word]) => word);
  }
}

// Example usage functions
export function createSampleDataFile() {
  const collector = new DataCollector();
  
  // Example of how to use with real data
  console.log(`
To collect real research articles:

1. PubMed Data:
   - Visit https://pubmed.ncbi.nlm.nih.gov/
   - Search for your topic
   - Export results as JSON/XML
   - Use formatPubMedData() method

2. arXiv Data:
   - Visit https://arxiv.org/
   - Use their API: https://arxiv.org/help/api
   - Use formatArxivData() method

3. DOI Data:
   - Use CrossRef API: https://api.crossref.org/
   - Get metadata for papers by DOI

4. Manual Entry:
   - Use the template in data/article-template.json
   - Add your articles to the array
  `);
}

export { DataCollector };
