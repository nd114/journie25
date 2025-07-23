import React, { useState } from 'react'
import { useTheme } from './hooks/useTheme'
import NotesView from './components/NotesView'
import ProjectsView from './components/ProjectsView'
import DocumentsView from './components/DocumentsView'
import ProjectCreate from './components/ProjectCreate'
import DocumentUpload from './components/DocumentUpload'
import TagsView from './components/TagsView'
import SettingsView from './components/SettingsView'
import TrashView from './components/TrashView'
import Dashboard from './components/Dashboard'
import ProjectManager from './components/ProjectManager'
import DocumentViewer from './components/DocumentViewer'
import CitationManager from './components/CitationManager'
import SplitView from './components/SplitView'
import Sidebar from './components/Sidebar'
import { 
  Page, 
  Project, 
  Document, 
  Citation, 
  Folder,
  ProjectStage,
  ProjectStatus,
  ProjectTemplate,
  DocumentType,
  CitationType,
  CitationStyle
} from './types'
import { savePages, loadPages } from './utils/storage'
import { AuthContext, useAuthState } from './hooks/useAuth'
import AuthForm from './components/AuthForm'
import DiscussionBoard from './components/DiscussionBoard'

export default function App() {
  const { theme } = useTheme()
  const auth = useAuthState()
  const [pages, setPages] = useState<Page[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [citations, setCitations] = useState<Citation[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [trashItems, setTrashItems] = useState<any[]>([])
  const [currentView, setCurrentView] = useState<string>('dashboard')
  const [currentItemId, setCurrentItemId] = useState<string | undefined>()
  const [currentPageId, setCurrentPageId] = useState<string>(() => {
    const savedPages = loadPages()
    return savedPages && savedPages.length > 0 ? savedPages[0].id : '1'
  })

  const currentPage = pages.find(page => page.id === currentPageId)
  const currentProject = projects.find(project => project.id === currentItemId)
  const currentDocument = documents.find(doc => doc.id === currentItemId)

  // Navigation handler
  const handleNavigate = (view: string, id?: string) => {
    setCurrentView(view)
    setCurrentItemId(id)

    if (view === 'note' && id) {
      setCurrentPageId(id)
    }
  }

  // Page management
  const createNewPage = () => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: 'Untitled',
      content: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      projectId: currentProject?.id,
      tags: [],
      customFields: {},
      version: 1,
      versions: []
    }
    const newPages = [...pages, newPage]
    setPages(newPages)
    savePages(newPages)
    setCurrentPageId(newPage.id)
    setCurrentView('note')
  }

  const updatePage = (id: string, updates: Partial<Page>) => {
    const newPages = pages.map(page => 
      page.id === id 
        ? { ...page, ...updates, updatedAt: new Date() }
        : page
    )
    setPages(newPages)
    savePages(newPages)
  }

  const deletePage = (id: string) => {
    if (pages.length > 1) {
      const pageToDelete = pages.find(page => page.id === id)
      if (pageToDelete) {
        // Move to trash
        setTrashItems(prev => [...prev, {
          id: pageToDelete.id,
          title: pageToDelete.title,
          type: 'page',
          deletedAt: new Date(),
          originalData: pageToDelete
        }])
      }

      const newPages = pages.filter(page => page.id !== id)
      setPages(newPages)
      savePages(newPages)
      if (currentPageId === id) {
        setCurrentPageId(newPages[0].id)
      }
    }
  }

  const toggleStar = (id: string) => {
    updatePage(id, { isStarred: !pages.find(p => p.id === id)?.isStarred })
  }

  // Project management
  const createProject = (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      folders: []
    }
    setProjects([...projects, newProject])
  }

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(projects.map(project => 
      project.id === id 
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    ))
  }

  const createFolder = (name: string, parentId?: string) => {
    if (!currentProject) return

    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      parentId,
      projectId: currentProject.id,
      createdAt: new Date(),
      children: [],
      pageIds: []
    }
    setFolders([...folders, newFolder])
  }

  // Document management
  const addDocument = (document: Omit<Document, 'id' | 'uploadedAt'>) => {
    const newDocument: Document = {
      ...document,
      id: Date.now().toString(),
      uploadedAt: new Date(),
      highlights: [],
      annotations: []
    }
    setDocuments([...documents, newDocument])
  }

  const updateDocument = (id: string, updates: Partial<Document>) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, ...updates } : doc
    ))
  }

  const deleteDocument = (id: string) => {
    const documentToDelete = documents.find(doc => doc.id === id)
    if (documentToDelete) {
      // Move to trash
      setTrashItems(prev => [...prev, {
        id: documentToDelete.id,
        title: documentToDelete.title,
        type: 'document',
        deletedAt: new Date(),
        originalData: documentToDelete
      }])
    }

    setDocuments(documents.filter(doc => doc.id !== id))
  }

  // Citation management
  const createCitation = (citation: Omit<Citation, 'id'>) => {
    const newCitation: Citation = {
      ...citation,
      id: Date.now().toString()
    }
    setCitations([...citations, newCitation])
  }

  const updateCitation = (id: string, updates: Partial<Citation>) => {
    setCitations(citations.map(citation => 
      citation.id === id ? { ...citation, ...updates } : citation
    ))
  }

  const deleteCitation = (id: string) => {
    setCitations(citations.filter(citation => citation.id !== id))
  }

  const exportBibliography = (citations: Citation[], style: CitationStyle) => {
    // Create bibliography text
    const bibliography = citations.map(citation => {
      const authors = citation.authors.map(a => `${a.lastName}, ${a.firstName}`).join(', ')
      const year = citation.publicationDate?.getFullYear() || 'n.d.'

      switch (style) {
        case CitationStyle.APA:
          return `${authors} (${year}). ${citation.title}. ${citation.publisher || citation.journal || ''}.`
        case CitationStyle.MLA:
          return `${authors}. "${citation.title}." ${citation.journal || citation.publisher || ''}, ${year}.`
        case CitationStyle.CHICAGO:
          return `${authors}. "${citation.title}." ${citation.journal || citation.publisher || ''} (${year}).`
        default:
          return `${authors} (${year}). ${citation.title}.`
      }
    }).join('\n\n')

    // Download as text file
    const blob = new Blob([bibliography], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bibliography-${style.toLowerCase()}-${new Date().toISOString().split('T')[0]}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Web clipping
  const handleWebClip = (title: string, content: string, url: string) => {
    const newPage: Page = {
      id: Date.now().toString(),
      title: title,
      content: content,
      createdAt: new Date(),
      updatedAt: new Date(),
      isStarred: false,
      projectId: currentProject?.id,
      tags: ['web-clip'],
      customFields: { sourceUrl: url },
      version: 1,
      versions: []
    }
    const newPages = [...pages, newPage]
    setPages(newPages)
    savePages(newPages)
    setCurrentPageId(newPage.id)
  }

  // Tag management
  const handleUpdateTags = (type: 'page' | 'project' | 'document', id: string, tags: string[]) => {
    switch (type) {
      case 'page':
        updatePage(id, { tags })
        break
      case 'project':
        updateProject(id, { tags })
        break
      case 'document':
        updateDocument(id, { tags })
        break
    }
  }

  // Trash management
  const handleRestoreFromTrash = (item: any) => {
    switch (item.type) {
      case 'page':
        const newPages = [...pages, { ...item.originalData, id: Date.now().toString() }]
        setPages(newPages)
        savePages(newPages)
        break
      case 'project':
        setProjects([...projects, { ...item.originalData, id: Date.now().toString() }])
        break
      case 'document':
        setDocuments([...documents, { ...item.originalData, id: Date.now().toString() }])
        break
    }
    setTrashItems(prev => prev.filter(trashItem => trashItem.id !== item.id))
  }

  const handlePermanentDelete = (id: string) => {
    setTrashItems(prev => prev.filter(item => item.id !== id))
  }

  const handleEmptyTrash = () => {
    setTrashItems([])
  }

    // If not authenticated, show auth form
  if (!auth.user) {
    return (
      <AuthContext.Provider value={auth}>
        <AuthForm 
          onSignIn={auth.signIn}
          onSignUp={auth.signUp}
          loading={auth.loading}
          error={auth.error}
        />
      </AuthContext.Provider>
    )
  }

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <Dashboard
            pages={pages}
            projects={projects}
            documents={documents}
            citations={citations}
            onNavigate={handleNavigate}
            onCreatePage={(title) => {
              const newPage: Page = {
                id: Date.now().toString(),
                title,
                content: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                isStarred: false,
                tags: [],
                customFields: {},
                version: 1,
                versions: []
              }
              const newPages = [...pages, newPage]
              setPages(newPages)
              savePages(newPages)
              setCurrentPageId(newPage.id)
              setCurrentView('note')
            }}
          />
        )

      case 'discussions':
        return <DiscussionBoard onNavigate={handleNavigate} />

      case 'documents':
        return (
          <DocumentsView
            documents={documents}
            onNavigate={handleNavigate}
            onUploadDocument={() => handleNavigate('document-upload')}
            onUpdateDocument={updateDocument}
            onDeleteDocument={deleteDocument}
          />
        )

      case 'notes':
        return (
          <NotesView
            pages={pages}
            onNavigate={handleNavigate}
            onCreatePage={createNewPage}
            onDeletePage={deletePage}
            onToggleStar={toggleStar}
          />
        )

      case 'projects':
        return (
          <ProjectsView
            projects={projects}
            onNavigate={handleNavigate}
            onCreateProject={() => handleNavigate('project-create')}
            onUpdateProject={updateProject}
            onDeleteProject={(id) => {
              setProjects(projects.filter(project => project.id !== id))
            }}
          />
        )

      case 'project-create':
        return (
          <ProjectCreate
            onNavigate={handleNavigate}
            onCreateProject={createProject}
          />
        )

      case 'document-upload':
        return (
          <DocumentUpload
            onNavigate={handleNavigate}
            onAddDocument={addDocument}
          />
        )

      case 'project':
        if (!currentProject) return <div>Project not found</div>
        return (
          <ProjectManager
            project={currentProject}
            folders={folders.filter(f => f.projectId === currentProject.id)}
            pages={pages.filter(p => p.projectId === currentProject.id)}
            onUpdateProject={(updates) => updateProject(currentProject.id, updates)}
            onCreateFolder={createFolder}
            onCreatePage={(title, folderId) => {
              const newPage: Page = {
                id: Date.now().toString(),
                title,
                content: '',
                createdAt: new Date(),
                updatedAt: new Date(),
                isStarred: false,
                projectId: currentProject.id,
                folderId,
                tags: [],
                customFields: {},
                version: 1,
                versions: []
              }
              const newPages = [...pages, newPage]
              setPages(newPages)
              savePages(newPages)
            }}
            onNavigateToPage={(pageId) => handleNavigate('note', pageId)}
          />
        )

      case 'document':
        if (!currentDocument) return <div>Document not found</div>
        return (
          <DocumentViewer
            document={currentDocument}
            onAddHighlight={(highlight) => {
              // Add highlight to document
              console.log('Adding highlight:', highlight)
            }}
            onAddAnnotation={(annotation) => {
              // Add annotation to document
              console.log('Adding annotation:', annotation)
            }}
            onUpdateDocument={(updates) => updateDocument(currentDocument.id, updates)}
          />
        )

      case 'citations':
        return (
          <CitationManager
            citations={citations}
            onCreateCitation={createCitation}
            onUpdateCitation={updateCitation}
            onDeleteCitation={deleteCitation}
            onExportBibliography={exportBibliography}
          />
        )

      case 'tags':
        return (
          <TagsView
            pages={pages}
            projects={projects}
            documents={documents}
            onNavigate={handleNavigate}
            onUpdateTags={handleUpdateTags}
          />
        )

      case 'settings':
        return (
          <SettingsView
            onNavigate={handleNavigate}
            onThemeChange={changeTheme}
            currentTheme={theme}
          />
        )

      case 'trash':
        return (
          <TrashView
            trashItems={trashItems}
            onRestore={handleRestoreFromTrash}
            onPermanentDelete={handlePermanentDelete}
            onEmptyTrash={handleEmptyTrash}
          />
        )

      case 'note':
        if (!currentPage) return <div>Page not found</div>
        return (
          <SplitView
            currentPage={currentPage}
            onUpdatePage={updatePage}
            onClipPage={handleWebClip}
            onToggleStar={toggleStar}
            onShowWebClipper={() => {}}
            onShowExportModal={() => {}}
            onShowFullBrowser={() => {}}
          />
        )

      default:
        return (
          <Dashboard
            projects={projects}
            documents={documents}
            citations={citations}
            pages={pages}
            onNavigate={handleNavigate}
          />
        )
    }
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
        <div className="flex bg-gray-50 dark:bg-gray-900 min-h-screen">
          <Sidebar 
            currentView={currentView}
            onNavigate={handleNavigate}
            pages={pages}
            projects={projects}
            onUpdateTags={handleUpdateTags}
            user={auth.user}
            onSignOut={auth.signOut}
          />
          <div className="flex-1">
            {renderContent()}
          </div>
        </div>
      </div>
    </AuthContext.Provider>
  )
}