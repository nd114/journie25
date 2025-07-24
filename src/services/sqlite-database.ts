
import Database from 'better-sqlite3'
import { DatabaseService } from './database'

class SQLiteDatabase implements DatabaseService {
  private db: Database.Database
  private currentUser = { id: 'sqlite-user', email: 'user@journie.app' }

  constructor() {
    this.db = new Database('journie.db')
    this.initializeTables()
  }

  private initializeTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE,
        password_hash TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        description TEXT,
        deadline DATETIME,
        status TEXT DEFAULT 'active',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS documents (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        filename TEXT,
        file_path TEXT,
        metadata TEXT,
        uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );

      CREATE TABLE IF NOT EXISTS citations (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        title TEXT,
        authors TEXT,
        publication_date DATETIME,
        url TEXT,
        access_date DATETIME,
        citation_style TEXT DEFAULT 'APA',
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `)
  }

  async signUp(email: string, password: string) {
    return { user: this.currentUser }
  }

  async signIn(email: string, password: string) {
    return { user: this.currentUser }
  }

  async signOut() {
    // No-op for SQLite
  }

  async getCurrentUser() {
    return this.currentUser
  }

  async getPages(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM pages WHERE user_id = ? ORDER BY updated_at DESC')
    return stmt.all(userId)
  }

  async createPage(userId: string, page: any) {
    const id = Date.now().toString()
    const stmt = this.db.prepare(`
      INSERT INTO pages (id, user_id, title, content, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(id, userId, page.title, page.content, now, now)
    return { ...page, id, user_id: userId, created_at: now, updated_at: now }
  }

  async updatePage(userId: string, pageId: string, updates: any) {
    const stmt = this.db.prepare(`
      UPDATE pages SET title = ?, content = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `)
    const now = new Date().toISOString()
    stmt.run(updates.title, updates.content, now, pageId, userId)
    
    const getStmt = this.db.prepare('SELECT * FROM pages WHERE id = ? AND user_id = ?')
    return getStmt.get(pageId, userId)
  }

  async deletePage(userId: string, pageId: string) {
    const stmt = this.db.prepare('DELETE FROM pages WHERE id = ? AND user_id = ?')
    stmt.run(pageId, userId)
  }

  async getProjects(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    return stmt.all(userId)
  }

  async createProject(userId: string, project: any) {
    const id = Date.now().toString()
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, user_id, title, description, deadline, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(id, userId, project.title, project.description, project.deadline, project.status || 'active', now, now)
    return { ...project, id, user_id: userId, created_at: now, updated_at: now }
  }

  async updateProject(userId: string, projectId: string, updates: any) {
    const stmt = this.db.prepare(`
      UPDATE projects SET title = ?, description = ?, deadline = ?, status = ?, updated_at = ?
      WHERE id = ? AND user_id = ?
    `)
    const now = new Date().toISOString()
    stmt.run(updates.title, updates.description, updates.deadline, updates.status, now, projectId, userId)
    
    const getStmt = this.db.prepare('SELECT * FROM projects WHERE id = ? AND user_id = ?')
    return getStmt.get(projectId, userId)
  }

  async deleteProject(userId: string, projectId: string) {
    const stmt = this.db.prepare('DELETE FROM projects WHERE id = ? AND user_id = ?')
    stmt.run(projectId, userId)
  }

  async getDocuments(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM documents WHERE user_id = ? ORDER BY uploaded_at DESC')
    return stmt.all(userId)
  }

  async createDocument(userId: string, document: any) {
    const id = Date.now().toString()
    const stmt = this.db.prepare(`
      INSERT INTO documents (id, user_id, filename, file_path, metadata, uploaded_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)
    const now = new Date().toISOString()
    stmt.run(id, userId, document.filename, document.file_path, JSON.stringify(document.metadata), now)
    return { ...document, id, user_id: userId, uploaded_at: now }
  }

  async updateDocument(userId: string, documentId: string, updates: any) {
    const stmt = this.db.prepare(`
      UPDATE documents SET filename = ?, metadata = ?
      WHERE id = ? AND user_id = ?
    `)
    stmt.run(updates.filename, JSON.stringify(updates.metadata), documentId, userId)
    
    const getStmt = this.db.prepare('SELECT * FROM documents WHERE id = ? AND user_id = ?')
    return getStmt.get(documentId, userId)
  }

  async deleteDocument(userId: string, documentId: string) {
    const stmt = this.db.prepare('DELETE FROM documents WHERE id = ? AND user_id = ?')
    stmt.run(documentId, userId)
  }

  async getCitations(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM citations WHERE user_id = ? ORDER BY publication_date DESC')
    return stmt.all(userId)
  }

  async createCitation(userId: string, citation: any) {
    const id = Date.now().toString()
    const stmt = this.db.prepare(`
      INSERT INTO citations (id, user_id, title, authors, publication_date, url, access_date, citation_style)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)
    stmt.run(id, userId, citation.title, citation.authors, citation.publication_date, citation.url, citation.access_date, citation.citation_style || 'APA')
    return { ...citation, id, user_id: userId }
  }

  async updateCitation(userId: string, citationId: string, updates: any) {
    const stmt = this.db.prepare(`
      UPDATE citations SET title = ?, authors = ?, publication_date = ?, url = ?, access_date = ?, citation_style = ?
      WHERE id = ? AND user_id = ?
    `)
    stmt.run(updates.title, updates.authors, updates.publication_date, updates.url, updates.access_date, updates.citation_style, citationId, userId)
    
    const getStmt = this.db.prepare('SELECT * FROM citations WHERE id = ? AND user_id = ?')
    return getStmt.get(citationId, userId)
  }

  async deleteCitation(userId: string, citationId: string) {
    const stmt = this.db.prepare('DELETE FROM citations WHERE id = ? AND user_id = ?')
    stmt.run(citationId, userId)
  }

  subscribeToPages(userId: string, callback: (pages: any[]) => void) {
    // Simple polling for SQLite
    const interval = setInterval(async () => {
      const pages = await this.getPages(userId)
      callback(pages)
    }, 2000)
    
    return () => clearInterval(interval)
  }

  subscribeToProjects(userId: string, callback: (projects: any[]) => void) {
    const interval = setInterval(async () => {
      const projects = await this.getProjects(userId)
      callback(projects)
    }, 2000)
    
    return () => clearInterval(interval)
  }
}

export { SQLiteDatabase }
