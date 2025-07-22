import React, { useState } from 'react'
import { 
  Trash2, 
  RotateCcw, 
  X, 
  Search, 
  Filter,
  Calendar,
  FileText,
  FolderOpen,
  BookOpen,
  AlertTriangle
} from 'lucide-react'

interface TrashItem {
  id: string
  title: string
  type: 'page' | 'project' | 'document' | 'citation'
  deletedAt: Date
  originalData: any
}

interface TrashViewProps {
  trashItems: TrashItem[]
  onRestore: (item: TrashItem) => void
  onPermanentDelete: (id: string) => void
  onEmptyTrash: () => void
}

export default function TrashView({ 
  trashItems, 
  onRestore, 
  onPermanentDelete, 
  onEmptyTrash 
}: TrashViewProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState<'all' | 'page' | 'project' | 'document' | 'citation'>('all')
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showEmptyConfirm, setShowEmptyConfirm] = useState(false)

  const filteredItems = trashItems.filter(item => {
    const matchesSearch = searchQuery === '' || 
      item.title.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = filterType === 'all' || item.type === filterType
    
    return matchesSearch && matchesType
  })

  const handleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedItems.length === filteredItems.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredItems.map(item => item.id))
    }
  }

  const handleBulkRestore = () => {
    selectedItems.forEach(id => {
      const item = trashItems.find(item => item.id === id)
      if (item) onRestore(item)
    })
    setSelectedItems([])
  }

  const handleBulkDelete = () => {
    if (confirm(`Are you sure you want to permanently delete ${selectedItems.length} items? This action cannot be undone.`)) {
      selectedItems.forEach(id => onPermanentDelete(id))
      setSelectedItems([])
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page':
        return FileText
      case 'project':
        return FolderOpen
      case 'document':
        return BookOpen
      case 'citation':
        return FileText
      default:
        return FileText
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
      case 'citation':
        return 'bg-orange-100 text-orange-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getDaysInTrash = (deletedAt: Date) => {
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - deletedAt.getTime())
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Trash</h1>
            <p className="text-gray-600 mt-1">{trashItems.length} items in trash</p>
          </div>
          <div className="flex items-center space-x-3">
            {selectedItems.length > 0 && (
              <>
                <button
                  onClick={handleBulkRestore}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Restore ({selectedItems.length})</span>
                </button>
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  <X className="w-4 h-4" />
                  <span>Delete Forever ({selectedItems.length})</span>
                </button>
              </>
            )}
            {trashItems.length > 0 && (
              <button
                onClick={() => setShowEmptyConfirm(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4" />
                <span>Empty Trash</span>
              </button>
            )}
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
              placeholder="Search trash..."
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
            <option value="citation">Citations</option>
          </select>

          {filteredItems.length > 0 && (
            <button
              onClick={handleSelectAll}
              className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              <input
                type="checkbox"
                checked={selectedItems.length === filteredItems.length}
                onChange={() => {}}
                className="rounded"
              />
              <span>Select All</span>
            </button>
          )}
        </div>
      </div>

      {/* Trash Content */}
      <div className="p-6">
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <Trash2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {trashItems.length === 0 ? 'Trash is empty' : 'No items found'}
            </h3>
            <p className="text-gray-600">
              {trashItems.length === 0 
                ? 'Deleted items will appear here'
                : 'Try adjusting your search or filters'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.map((item) => {
              const Icon = getTypeIcon(item.type)
              const daysInTrash = getDaysInTrash(item.deletedAt)
              
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="mt-1 rounded"
                    />
                    <Icon className="w-6 h-6 text-gray-400 mt-1 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                          <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(item.type)}`}>
                              {item.type}
                            </span>
                            <div className="flex items-center space-x-1">
                              <Calendar className="w-3 h-3" />
                              <span>Deleted {item.deletedAt.toLocaleDateString()}</span>
                            </div>
                            <span className={`${daysInTrash > 25 ? 'text-red-600' : daysInTrash > 20 ? 'text-orange-600' : 'text-gray-500'}`}>
                              {daysInTrash} {daysInTrash === 1 ? 'day' : 'days'} in trash
                            </span>
                          </div>
                          
                          {daysInTrash > 25 && (
                            <div className="flex items-center space-x-1 text-red-600 text-sm mb-2">
                              <AlertTriangle className="w-4 h-4" />
                              <span>Will be permanently deleted soon</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => onRestore(item)}
                            className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                            title="Restore item"
                          >
                            <RotateCcw className="w-4 h-4" />
                            <span>Restore</span>
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Are you sure you want to permanently delete "${item.title}"? This action cannot be undone.`)) {
                                onPermanentDelete(item.id)
                              }
                            }}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            title="Delete permanently"
                          >
                            <X className="w-4 h-4" />
                            <span>Delete Forever</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Empty Trash Confirmation Modal */}
      {showEmptyConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Empty Trash</h3>
                </div>
              </div>
              <p className="text-gray-600 mb-6">
                Are you sure you want to permanently delete all {trashItems.length} items in trash? 
                This action cannot be undone.
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    onEmptyTrash()
                    setShowEmptyConfirm(false)
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                >
                  Empty Trash
                </button>
                <button
                  onClick={() => setShowEmptyConfirm(false)}
                  className="flex-1 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}