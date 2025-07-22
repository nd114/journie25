import React, { useState, useMemo } from 'react'
import { 
  Tag, 
  Search, 
  Filter, 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  FolderOpen,
  Hash,
  SortAsc,
  SortDesc
} from 'lucide-react'
import { Page, Project, Document } from '../types'

interface TagInfo {
  name: string
  count: number
  sources: Array<{
    id: string
    title: string
    type: 'page' | 'project' | 'document'
  }>
}

interface TagsViewProps {
  pages: Page[]
  projects: Project[]
  documents: Document[]
  onNavigate: (view: string, id?: string) => void
  onUpdateTags: (type: 'page' | 'project' | 'document', id: string, tags: string[]) => void
}

export default function TagsView({ 
  pages, 
  projects, 
  documents, 
  onNavigate, 
  onUpdateTags 
}: TagsViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'page' | 'project' | 'document'>('all')
  const [sortBy, setSortBy] = useState<'name' | 'count'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState('')

  // Extract hashtags from text content
  const extractHashtags = (content: string): string[] => {
    const hashtagRegex = /#(\w+)/g
    const matches = content.match(hashtagRegex)
    return matches ? matches.map(match => match.substring(1)) : []
  }

  // Extract all tags and their usage
  const allTags = useMemo(() => {
    const tagMap = new Map<string, TagInfo>()

    // Process pages
    pages.forEach(page => {
      // Extract hashtags from content
      const contentTags = extractHashtags(page.content)
      const allPageTags = [...page.tags, ...contentTags]
      
      allPageTags.forEach(tag => {
        const existing = tagMap.get(tag) || { name: tag, count: 0, sources: [] }
        existing.count++
        existing.sources.push({
          id: page.id,
          title: page.title,
          type: 'page'
        })
        tagMap.set(tag, existing)
      })
    })

    // Process projects
    projects.forEach(project => {
      project.tags.forEach(tag => {
        const existing = tagMap.get(tag) || { name: tag, count: 0, sources: [] }
        existing.count++
        existing.sources.push({
          id: project.id,
          title: project.name,
          type: 'project'
        })
        tagMap.set(tag, existing)
      })
    })

    // Process documents
    documents.forEach(document => {
      // Extract hashtags from content
      const contentTags = extractHashtags(document.content)
      const allDocTags = [...document.tags, ...contentTags]
      
      allDocTags.forEach(tag => {
        const existing = tagMap.get(tag) || { name: tag, count: 0, sources: [] }
        existing.count++
        existing.sources.push({
          id: document.id,
          title: document.title,
          type: 'document'
        })
        tagMap.set(tag, existing)
      })
    })

    return Array.from(tagMap.values())
  }, [pages, projects, documents])

  // Filter and sort tags
  const filteredTags = useMemo(() => {
    let filtered = allTags.filter(tag => {
      const matchesSearch = searchQuery === '' || 
        tag.name.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesType = filterType === 'all' || 
        tag.sources.some(source => source.type === filterType)
      
      return matchesSearch && matchesType
    })

    // Sort tags
    filtered.sort((a, b) => {
      let comparison = 0
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name)
      } else {
        comparison = a.count - b.count
      }
      return sortOrder === 'asc' ? comparison : -comparison
    })

    return filtered
  }, [allTags, searchQuery, filterType, sortBy, sortOrder])

  const handleTagClick = (tag: TagInfo) => {
    // Navigate to first source or show all sources
    if (tag.sources.length === 1) {
      const source = tag.sources[0]
      onNavigate(source.type === 'page' ? 'note' : source.type, source.id)
    } else {
      // TODO: Show tag sources modal
    }
  }

  const handleRenameTag = (oldName: string, newName: string) => {
    if (!newName.trim() || oldName === newName) return

    // Update all items that use this tag
    pages.forEach(page => {
      if (page.tags.includes(oldName)) {
        const updatedTags = page.tags.map(tag => tag === oldName ? newName : tag)
        onUpdateTags('page', page.id, updatedTags)
      }
    })

    projects.forEach(project => {
      if (project.tags.includes(oldName)) {
        const updatedTags = project.tags.map(tag => tag === oldName ? newName : tag)
        onUpdateTags('project', project.id, updatedTags)
      }
    })

    documents.forEach(document => {
      if (document.tags.includes(oldName)) {
        const updatedTags = document.tags.map(tag => tag === oldName ? newName : tag)
        onUpdateTags('document', document.id, updatedTags)
      }
    })

    setEditingTag(null)
    setNewTagName('')
  }

  const handleDeleteTag = (tagName: string) => {
    // Remove tag from all items
    pages.forEach(page => {
      if (page.tags.includes(tagName)) {
        const updatedTags = page.tags.filter(tag => tag !== tagName)
        onUpdateTags('page', page.id, updatedTags)
      }
    })

    projects.forEach(project => {
      if (project.tags.includes(tagName)) {
        const updatedTags = project.tags.filter(tag => tag !== tagName)
        onUpdateTags('project', project.id, updatedTags)
      }
    })

    documents.forEach(document => {
      if (document.tags.includes(tagName)) {
        const updatedTags = document.tags.filter(tag => tag !== tagName)
        onUpdateTags('document', document.id, updatedTags)
      }
    })
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return FileText
      case 'project':
        return FolderOpen
      case 'document':
        return FileText
      default:
        return Tag
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'page':
        return 'bg-blue-100 text-blue-800'
      case 'project':
        return 'bg-green-100 text-green-800'
      case 'document':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Tags</h1>
            <p className="text-gray-600 mt-1">{allTags.length} unique tags</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tags..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Types</option>
            <option value="page">Pages</option>
            <option value="project">Projects</option>
            <option value="document">Documents</option>
          </select>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => {
                if (sortBy === 'name') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy('name')
                  setSortOrder('asc')
                }
              }}
              className={`px-3 py-2 text-sm rounded-lg flex items-center space-x-1 ${
                sortBy === 'name' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Name</span>
              {sortBy === 'name' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
            <button
              onClick={() => {
                if (sortBy === 'count') {
                  setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortBy('count')
                  setSortOrder('desc')
                }
              }}
              className={`px-3 py-2 text-sm rounded-lg flex items-center space-x-1 ${
                sortBy === 'count' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>Count</span>
              {sortBy === 'count' && (
                sortOrder === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Tags Content */}
      <div className="p-6">
        {filteredTags.length === 0 ? (
          <div className="text-center py-12">
            <Hash className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tags found</h3>
            <p className="text-gray-600">
              {searchQuery || filterType !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Tags will appear here when you add them to your content'
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredTags.map((tag) => (
              <div
                key={tag.name}
                className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-5 h-5 text-gray-400" />
                    {editingTag === tag.name ? (
                      <input
                        type="text"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        onBlur={() => handleRenameTag(tag.name, newTagName)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleRenameTag(tag.name, newTagName)
                          } else if (e.key === 'Escape') {
                            setEditingTag(null)
                            setNewTagName('')
                          }
                        }}
                        className="font-semibold text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none"
                        autoFocus
                      />
                    ) : (
                      <h3 
                        className="font-semibold text-gray-900 cursor-pointer hover:text-blue-600"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag.name}
                      </h3>
                    )}
                  </div>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => {
                        setEditingTag(tag.name)
                        setNewTagName(tag.name)
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="Rename tag"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleDeleteTag(tag.name)}
                      className="p-1 text-gray-400 hover:text-red-600 rounded"
                      title="Delete tag"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                <div className="mb-3">
                  <span className="text-2xl font-bold text-blue-600">{tag.count}</span>
                  <span className="text-sm text-gray-500 ml-1">
                    {tag.count === 1 ? 'usage' : 'usages'}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex flex-wrap gap-1">
                    {Array.from(new Set(tag.sources.map(s => s.type))).map(type => {
                      const Icon = getTypeIcon(type)
                      const count = tag.sources.filter(s => s.type === type).length
                      return (
                        <span
                          key={type}
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(type)}`}
                        >
                          <Icon className="w-3 h-3 mr-1" />
                          {count} {type}{count !== 1 ? 's' : ''}
                        </span>
                      )
                    })}
                  </div>
                  
                  {tag.sources.length <= 3 ? (
                    <div className="space-y-1">
                      {tag.sources.map(source => (
                        <button
                          key={`${source.type}-${source.id}`}
                          onClick={() => onNavigate(source.type === 'page' ? 'note' : source.type, source.id)}
                          className="block w-full text-left text-xs text-gray-600 hover:text-blue-600 truncate"
                        >
                          {source.title}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleTagClick(tag)}
                      className="text-xs text-blue-600 hover:text-blue-700"
                    >
                      View all {tag.sources.length} items →
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}