
// Mock SQLite implementation for browser environment
class MockDatabase {
  private data: Map<string, any> = new Map()

  constructor(path: string) {
    // Initialize mock database
    console.log(`Mock database initialized at: ${path}`)
    this.initializeStorage()
  }

  private initializeStorage() {
    // Initialize localStorage with proper structure
    if (!localStorage.getItem('sqlite_users')) {
      localStorage.setItem('sqlite_users', JSON.stringify([]))
    }
    if (!localStorage.getItem('sqlite_pages')) {
      localStorage.setItem('sqlite_pages', JSON.stringify([]))
    }
    if (!localStorage.getItem('sqlite_projects')) {
      localStorage.setItem('sqlite_projects', JSON.stringify([]))
    }
    if (!localStorage.getItem('sqlite_documents')) {
      localStorage.setItem('sqlite_documents', JSON.stringify([]))
    }
    if (!localStorage.getItem('sqlite_citations')) {
      localStorage.setItem('sqlite_citations', JSON.stringify([]))
    }
    if (!localStorage.getItem('current_user')) {
      localStorage.setItem('current_user', 'null')
    }
  }

  exec(sql: string) {
    console.log(`Executing SQL: ${sql}`)
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
    this.db = new MockDatabase(':memory:')
    this.initializeTables()
  }

  private initializeTables() {
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

  // Authentication methods
  async signUp(email: string, password: string): Promise<{ user: any; error?: string }> {
    try {
      const users = JSON.parse(localStorage.getItem('sqlite_users') || '[]')
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email)
      if (existingUser) {
        return { user: null, error: 'User already exists' }
      }

      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        email,
        name: email.split('@')[0], // Default name from email
        password_hash: btoa(password), // Simple encoding for demo
        created_at: new Date().toISOString()
      }

      users.push(newUser)
      localStorage.setItem('sqlite_users', JSON.stringify(users))
      localStorage.setItem('current_user', JSON.stringify(newUser))

      return { user: newUser }
    } catch (error) {
      return { user: null, error: 'Sign up failed' }
    }
  }

  async signIn(email: string, password: string): Promise<{ user: any; error?: string }> {
    try {
      const users = JSON.parse(localStorage.getItem('sqlite_users') || '[]')
      const user = users.find((u: any) => u.email === email && u.password_hash === btoa(password))
      
      if (!user) {
        return { user: null, error: 'Invalid credentials' }
      }

      localStorage.setItem('current_user', JSON.stringify(user))
      return { user }
    } catch (error) {
      return { user: null, error: 'Sign in failed' }
    }
  }

  async signOut(): Promise<void> {
    localStorage.setItem('current_user', 'null')
  }

  async getCurrentUser(): Promise<any> {
    const userStr = localStorage.getItem('current_user')
    if (userStr === 'null' || !userStr) return null
    return JSON.parse(userStr)
  }

  async resetPassword(email: string): Promise<{ success: boolean; error?: string }> {
    try {
      const users = JSON.parse(localStorage.getItem('sqlite_users') || '[]')
      const user = users.find((u: any) => u.email === email)
      
      if (!user) {
        return { success: false, error: 'User not found' }
      }

      // In a real app, you'd send an email here
      console.log(`Password reset link would be sent to ${email}`)
      return { success: true }
    } catch (error) {
      return { success: false, error: 'Password reset failed' }
    }
  }

  // Page methods
  async getPages(userId: string): Promise<any[]> {
    const pages = JSON.parse(localStorage.getItem('sqlite_pages') || '[]')
    return pages
      .filter((page: any) => page.user_id === userId)
      .map((page: any) => ({
        ...page,
        tags: JSON.parse(page.tags || '[]'),
        isStarred: Boolean(page.is_starred)
      }))
  }

  async createPage(userId: string, pageData: any): Promise<any> {
    const pages = JSON.parse(localStorage.getItem('sqlite_pages') || '[]')
    const newPage = {
      ...pageData,
      id: `page_${Date.now()}`,
      user_id: userId,
      tags: JSON.stringify(pageData.tags || []),
      is_starred: pageData.isStarred || false
    }
    
    pages.push(newPage)
    localStorage.setItem('sqlite_pages', JSON.stringify(pages))
    return newPage
  }

  async updatePage(userId: string, pageId: string, updates: any): Promise<any> {
    const pages = JSON.parse(localStorage.getItem('sqlite_pages') || '[]')
    const index = pages.findIndex((p: any) => p.id === pageId && p.user_id === userId)
    
    if (index !== -1) {
      pages[index] = {
        ...pages[index],
        ...updates,
        tags: JSON.stringify(updates.tags || []),
        is_starred: updates.isStarred || false
      }
      localStorage.setItem('sqlite_pages', JSON.stringify(pages))
      return pages[index]
    }
    throw new Error('Page not found')
  }

  async deletePage(userId: string, pageId: string): Promise<void> {
    const pages = JSON.parse(localStorage.getItem('sqlite_pages') || '[]')
    const filtered = pages.filter((p: any) => !(p.id === pageId && p.user_id === userId))
    localStorage.setItem('sqlite_pages', JSON.stringify(filtered))
  }

  // Project methods
  async getProjects(userId: string): Promise<any[]> {
    const projects = JSON.parse(localStorage.getItem('sqlite_projects') || '[]')
    return projects.filter((project: any) => project.user_id === userId)
  }

  async createProject(userId: string, projectData: any): Promise<any> {
    const projects = JSON.parse(localStorage.getItem('sqlite_projects') || '[]')
    const newProject = {
      ...projectData,
      id: `project_${Date.now()}`,
      user_id: userId
    }
    
    projects.push(newProject)
    localStorage.setItem('sqlite_projects', JSON.stringify(projects))
    return newProject
  }

  async updateProject(userId: string, projectId: string, updates: any): Promise<any> {
    const projects = JSON.parse(localStorage.getItem('sqlite_projects') || '[]')
    const index = projects.findIndex((p: any) => p.id === projectId && p.user_id === userId)
    
    if (index !== -1) {
      projects[index] = { ...projects[index], ...updates }
      localStorage.setItem('sqlite_projects', JSON.stringify(projects))
      return projects[index]
    }
    throw new Error('Project not found')
  }

  async deleteProject(userId: string, projectId: string): Promise<void> {
    const projects = JSON.parse(localStorage.getItem('sqlite_projects') || '[]')
    const filtered = projects.filter((p: any) => !(p.id === projectId && p.user_id === userId))
    localStorage.setItem('sqlite_projects', JSON.stringify(filtered))
  }

  // Document methods
  async getDocuments(userId: string): Promise<any[]> {
    const documents = JSON.parse(localStorage.getItem('sqlite_documents') || '[]')
    return documents.filter((doc: any) => doc.user_id === userId)
  }

  async createDocument(userId: string, documentData: any): Promise<any> {
    const documents = JSON.parse(localStorage.getItem('sqlite_documents') || '[]')
    const newDocument = {
      ...documentData,
      id: `doc_${Date.now()}`,
      user_id: userId
    }
    
    documents.push(newDocument)
    localStorage.setItem('sqlite_documents', JSON.stringify(documents))
    return newDocument
  }

  async updateDocument(userId: string, documentId: string, updates: any): Promise<any> {
    const documents = JSON.parse(localStorage.getItem('sqlite_documents') || '[]')
    const index = documents.findIndex((d: any) => d.id === documentId && d.user_id === userId)
    
    if (index !== -1) {
      documents[index] = { ...documents[index], ...updates }
      localStorage.setItem('sqlite_documents', JSON.stringify(documents))
      return documents[index]
    }
    throw new Error('Document not found')
  }

  async deleteDocument(userId: string, documentId: string): Promise<void> {
    const documents = JSON.parse(localStorage.getItem('sqlite_documents') || '[]')
    const filtered = documents.filter((d: any) => !(d.id === documentId && d.user_id === userId))
    localStorage.setItem('sqlite_documents', JSON.stringify(filtered))
  }

  // Citation methods
  async getCitations(userId: string): Promise<any[]> {
    const citations = JSON.parse(localStorage.getItem('sqlite_citations') || '[]')
    return citations.filter((citation: any) => citation.user_id === userId)
  }

  async createCitation(userId: string, citationData: any): Promise<any> {
    const citations = JSON.parse(localStorage.getItem('sqlite_citations') || '[]')
    const newCitation = {
      ...citationData,
      id: `citation_${Date.now()}`,
      user_id: userId
    }
    
    citations.push(newCitation)
    localStorage.setItem('sqlite_citations', JSON.stringify(citations))
    return newCitation
  }

  async updateCitation(userId: string, citationId: string, updates: any): Promise<any> {
    const citations = JSON.parse(localStorage.getItem('sqlite_citations') || '[]')
    const index = citations.findIndex((c: any) => c.id === citationId && c.user_id === userId)
    
    if (index !== -1) {
      citations[index] = { ...citations[index], ...updates }
      localStorage.setItem('sqlite_citations', JSON.stringify(citations))
      return citations[index]
    }
    throw new Error('Citation not found')
  }

  async deleteCitation(userId: string, citationId: string): Promise<void> {
    const citations = JSON.parse(localStorage.getItem('sqlite_citations') || '[]')
    const filtered = citations.filter((c: any) => !(c.id === citationId && c.user_id === userId))
    localStorage.setItem('sqlite_citations', JSON.stringify(filtered))
  }

  close() {
    this.db.close()
  }
}
