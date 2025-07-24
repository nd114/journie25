
import React, { useState } from 'react'
import { ArrowLeft, Book, Search, ChevronRight, ExternalLink } from 'lucide-react'

interface DocumentationPageProps {
  onNavigate: (page: string) => void
}

export default function DocumentationPage({ onNavigate }: DocumentationPageProps) {
  const [activeSection, setActiveSection] = useState('getting-started')
  const [searchQuery, setSearchQuery] = useState('')

  const sections = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      items: [
        { id: 'welcome', title: 'Welcome to Journie', content: 'Welcome content here...' },
        { id: 'setup', title: 'Initial Setup', content: 'Setup content here...' },
        { id: 'first-project', title: 'Creating Your First Project', content: 'First project content...' }
      ]
    },
    {
      id: 'core-features',
      title: 'Core Features',
      items: [
        { id: 'notes', title: 'Notes & Documents', content: 'Notes documentation...' },
        { id: 'projects', title: 'Project Management', content: 'Projects documentation...' },
        { id: 'collaboration', title: 'Team Collaboration', content: 'Collaboration documentation...' },
        { id: 'search', title: 'Advanced Search', content: 'Search documentation...' }
      ]
    },
    {
      id: 'advanced',
      title: 'Advanced Features',
      items: [
        { id: 'citations', title: 'Citation Management', content: 'Citations documentation...' },
        { id: 'integrations', title: 'Third-party Integrations', content: 'Integrations documentation...' },
        { id: 'automation', title: 'Workflow Automation', content: 'Automation documentation...' },
        { id: 'api', title: 'API Reference', content: 'API documentation...' }
      ]
    },
    {
      id: 'troubleshooting',
      title: 'Troubleshooting',
      items: [
        { id: 'common-issues', title: 'Common Issues', content: 'Common issues content...' },
        { id: 'performance', title: 'Performance Tips', content: 'Performance content...' },
        { id: 'data-recovery', title: 'Data Recovery', content: 'Data recovery content...' }
      ]
    }
  ]

  const getContent = (sectionId: string, itemId: string) => {
    const section = sections.find(s => s.id === sectionId)
    const item = section?.items.find(i => i.id === itemId)
    
    // Sample content for different sections
    switch (itemId) {
      case 'welcome':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome to Journie</h1>
            <p className="text-lg text-gray-600">
              Journie is a comprehensive research management platform designed to help researchers, academics, and students organize their work, collaborate with peers, and discover new insights.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-2">What you can do with Journie:</h3>
              <ul className="space-y-2 text-blue-800">
                <li>• Create and organize research notes with rich text editing</li>
                <li>• Manage projects and collaborate with team members</li>
                <li>• Automatically format citations in thousands of styles</li>
                <li>• Search across all your research with AI-powered tools</li>
                <li>• Upload and annotate documents and PDFs</li>
              </ul>
            </div>
          </div>
        )
      case 'setup':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Initial Setup</h1>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Step 1: Create Your Account</h3>
                <p className="text-gray-600">Sign up for a free Journie account to get started. You can upgrade to a paid plan later if you need additional features.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Step 2: Set Up Your Profile</h3>
                <p className="text-gray-600">Complete your profile information, including your research interests and institutional affiliation.</p>
              </div>
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-3">Step 3: Import Existing Research</h3>
                <p className="text-gray-600">Use our import tools to bring in your existing notes, documents, and citations from other platforms.</p>
              </div>
            </div>
          </div>
        )
      case 'notes':
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">Notes & Documents</h1>
            <p className="text-lg text-gray-600">
              Learn how to create, organize, and manage your research notes effectively.
            </p>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Creating Notes</h2>
              <p>Use our rich text editor to create detailed research notes with formatting, links, and embedded media.</p>
              <h2 className="text-xl font-semibold">Organizing with Tags</h2>
              <p>Use tags to categorize and organize your notes for easy retrieval later.</p>
              <h2 className="text-xl font-semibold">Linking Related Content</h2>
              <p>Create connections between related notes to build a knowledge graph of your research.</p>
            </div>
          </div>
        )
      default:
        return (
          <div className="space-y-6">
            <h1 className="text-3xl font-bold text-gray-900">{item?.title}</h1>
            <p className="text-lg text-gray-600">
              Detailed documentation for {item?.title.toLowerCase()} will be available here.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-yellow-800">
                This section is currently being developed. Check back soon for comprehensive documentation.
              </p>
            </div>
          </div>
        )
    }
  }

  const currentSection = sections.find(s => s.id === activeSection)
  const currentItem = currentSection?.items[0]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="p-6">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <div className="flex items-center space-x-2 mb-6">
            <Book className="w-6 h-6 text-blue-600" />
            <h1 className="text-xl font-bold text-gray-900">Documentation</h1>
          </div>

          {/* Search */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search docs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            {sections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left font-medium text-sm rounded-lg transition-colors ${
                    activeSection === section.id
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {section.title}
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    activeSection === section.id ? 'rotate-90' : ''
                  }`} />
                </button>
                
                {activeSection === section.id && (
                  <div className="ml-4 mt-2 space-y-1">
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        className="block w-full text-left px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        {item.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-12">
          {currentItem && getContent(activeSection, currentItem.id)}
          
          {/* Help Section */}
          <div className="mt-16 border-t border-gray-200 pt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Need More Help?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Contact Support</h3>
                <p className="text-gray-600 mb-4">Get help from our support team</p>
                <button 
                  onClick={() => onNavigate('contact')}
                  className="inline-flex items-center text-blue-600 hover:text-blue-700"
                >
                  Contact Us <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Community Forum</h3>
                <p className="text-gray-600 mb-4">Ask questions and share tips with other users</p>
                <button className="inline-flex items-center text-blue-600 hover:text-blue-700">
                  Visit Forum <ExternalLink className="w-4 h-4 ml-1" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
