// Mock SQLite implementation for browser environment
class MockDatabase {
  private data: Map<string, any> = new Map()

  constructor(path: string) {
    // Initialize mock database
    console.log(`Mock database initialized at: ${path}`)
  }

  exec(sql: string) {
    console.log(`Executing SQL: ${sql}`)
    // Mock table creation
    return this
  }

  prepare(sql: string) {
    return {
      run: (...args: any[]) => {
        console.log(`Mock SQL run: ${sql}`, args)
        return { lastInsertRowid: Date.now() }
      },
      get: (...args: any[]) => {
        console.log(`Mock SQL get: ${sql}`, args)
        return null
      },
      all: (...args: any[]) => {
        console.log(`Mock SQL all: ${sql}`, args)
        return []
      }
    }
  }

  close() {
    console.log('Mock database closed')
  }
}

export class SQLiteDatabase {
  private db: MockDatabase

  constructor() {
    // Use mock database for browser environment
    this.db = new MockDatabase(':memory:')
    this.initializeTables()
  }

  private initializeTables() {
    // Create tables
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        name TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pages (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        is_starred BOOLEAN DEFAULT FALSE,
        tags TEXT,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id)
      )
    `)
  }

  // User methods
  async createUser(userData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO users (id, email, name, password_hash)
      VALUES (?, ?, ?, ?)
    `)

    const result = stmt.run(userData.id, userData.email, userData.name, userData.password_hash)
    return { id: userData.id, ...userData }
  }

  async getUserByEmail(email: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE email = ?')
    return stmt.get(email)
  }

  async getUserById(id: string) {
    const stmt = this.db.prepare('SELECT * FROM users WHERE id = ?')
    return stmt.get(id)
  }

  // Page methods
  async createPage(userId: string, pageData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO pages (id, user_id, title, content, created_at, updated_at, is_starred, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      pageData.id,
      userId,
      pageData.title,
      pageData.content,
      pageData.createdAt,
      pageData.updatedAt,
      pageData.isStarred || false,
      JSON.stringify(pageData.tags || [])
    )

    return { id: pageData.id, ...pageData }
  }

  async getPages(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM pages WHERE user_id = ? ORDER BY updated_at DESC')
    const pages = stmt.all(userId)

    return pages.map(page => ({
      ...page,
      tags: JSON.parse(page.tags || '[]'),
      isStarred: Boolean(page.is_starred)
    }))
  }

  async updatePage(userId: string, pageId: string, updates: any) {
    const stmt = this.db.prepare(`
      UPDATE pages 
      SET title = ?, content = ?, updated_at = ?, is_starred = ?, tags = ?
      WHERE id = ? AND user_id = ?
    `)

    stmt.run(
      updates.title,
      updates.content,
      updates.updatedAt,
      updates.isStarred || false,
      JSON.stringify(updates.tags || []),
      pageId,
      userId
    )

    return { id: pageId, ...updates }
  }

  async deletePage(userId: string, pageId: string) {
    const stmt = this.db.prepare('DELETE FROM pages WHERE id = ? AND user_id = ?')
    stmt.run(pageId, userId)
    return true
  }

  // Project methods
  async createProject(userId: string, projectData: any) {
    const stmt = this.db.prepare(`
      INSERT INTO projects (id, user_id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `)

    const result = stmt.run(
      projectData.id,
      userId,
      projectData.name,
      projectData.description,
      projectData.createdAt,
      projectData.updatedAt
    )

    return { id: projectData.id, ...projectData }
  }

  async getProjects(userId: string) {
    const stmt = this.db.prepare('SELECT * FROM projects WHERE user_id = ? ORDER BY updated_at DESC')
    return stmt.all(userId)
  }

  close() {
    this.db.close()
  }
}

//export default SQLiteDatabase