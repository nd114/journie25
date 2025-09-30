// Citation generator utility
// Supports APA, MLA, Chicago, BibTeX, and EndNote formats

interface CitationData {
  title: string;
  authors: string[];
  year?: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publishedAt?: Date;
}

export function generateAPA(data: CitationData): string {
  const authors = formatAuthorsAPA(data.authors);
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  const title = data.title;
  const journal = data.journal || 'Research Platform';
  
  let citation = `${authors} (${year}). ${title}. ${journal}`;
  
  if (data.volume) citation += `, ${data.volume}`;
  if (data.issue) citation += `(${data.issue})`;
  if (data.pages) citation += `, ${data.pages}`;
  if (data.doi) citation += `. https://doi.org/${data.doi}`;
  else if (data.url) citation += `. ${data.url}`;
  
  return citation + '.';
}

export function generateMLA(data: CitationData): string {
  const authors = formatAuthorsMLA(data.authors);
  const title = `"${data.title}"`;
  const journal = data.journal || 'Research Platform';
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  
  let citation = `${authors}. ${title}. ${journal}`;
  
  if (data.volume) citation += `, vol. ${data.volume}`;
  if (data.issue) citation += `, no. ${data.issue}`;
  if (data.pages) citation += `, pp. ${data.pages}`;
  
  citation += `, ${year}`;
  
  if (data.doi) citation += `, doi:${data.doi}`;
  else if (data.url) citation += `, ${data.url}`;
  
  return citation + '.';
}

export function generateChicago(data: CitationData): string {
  const authors = formatAuthorsChicago(data.authors);
  const title = `"${data.title}"`;
  const journal = data.journal || 'Research Platform';
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  
  let citation = `${authors}. ${title}. ${journal}`;
  
  if (data.volume) citation += ` ${data.volume}`;
  if (data.issue) citation += `, no. ${data.issue}`;
  if (data.pages) citation += ` (${data.pages})`;
  
  citation += ` (${year})`;
  
  if (data.doi) citation += `. https://doi.org/${data.doi}`;
  else if (data.url) citation += `. ${data.url}`;
  
  return citation + '.';
}

export function generateBibTeX(data: CitationData): string {
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  const key = generateCiteKey(data);
  const authors = data.authors.join(' and ');
  const journal = data.journal || 'Research Platform';
  
  let bibtex = `@article{${key},\n`;
  bibtex += `  author = {${authors}},\n`;
  bibtex += `  title = {${data.title}},\n`;
  bibtex += `  journal = {${journal}},\n`;
  bibtex += `  year = {${year}}`;
  
  if (data.volume) bibtex += `,\n  volume = {${data.volume}}`;
  if (data.issue) bibtex += `,\n  number = {${data.issue}}`;
  if (data.pages) bibtex += `,\n  pages = {${data.pages}}`;
  if (data.doi) bibtex += `,\n  doi = {${data.doi}}`;
  if (data.url) bibtex += `,\n  url = {${data.url}}`;
  
  bibtex += '\n}';
  return bibtex;
}

export function generateEndNote(data: CitationData): string {
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  const journal = data.journal || 'Research Platform';
  
  let endnote = '%0 Journal Article\n';
  
  data.authors.forEach(author => {
    endnote += `%A ${author}\n`;
  });
  
  endnote += `%T ${data.title}\n`;
  endnote += `%J ${journal}\n`;
  endnote += `%D ${year}\n`;
  
  if (data.volume) endnote += `%V ${data.volume}\n`;
  if (data.issue) endnote += `%N ${data.issue}\n`;
  if (data.pages) endnote += `%P ${data.pages}\n`;
  if (data.doi) endnote += `%R ${data.doi}\n`;
  if (data.url) endnote += `%U ${data.url}\n`;
  
  return endnote;
}

// Helper functions for author formatting
function formatAuthorsAPA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} & ${authors[1]}`;
  
  const lastAuthor = authors[authors.length - 1];
  const otherAuthors = authors.slice(0, -1).join(', ');
  return `${otherAuthors}, & ${lastAuthor}`;
}

function formatAuthorsMLA(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]}, and ${authors[1]}`;
  
  const lastAuthor = authors[authors.length - 1];
  const otherAuthors = authors.slice(0, -1).join(', ');
  return `${otherAuthors}, and ${lastAuthor}`;
}

function formatAuthorsChicago(authors: string[]): string {
  if (authors.length === 0) return 'Unknown Author';
  if (authors.length === 1) return authors[0];
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
  
  const lastAuthor = authors[authors.length - 1];
  const otherAuthors = authors.slice(0, -1).join(', ');
  return `${otherAuthors}, and ${lastAuthor}`;
}

function generateCiteKey(data: CitationData): string {
  const year = data.year || new Date(data.publishedAt || Date.now()).getFullYear();
  const firstAuthor = data.authors[0]?.split(' ').pop()?.toLowerCase() || 'unknown';
  const titleWord = data.title.split(' ')[0]?.toLowerCase() || 'paper';
  return `${firstAuthor}${year}${titleWord}`;
}
