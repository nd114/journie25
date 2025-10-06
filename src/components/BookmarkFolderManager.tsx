import React, { useState, useEffect } from 'react';
import { Folder, Plus, Edit2, Trash2, Bookmark } from 'lucide-react';

interface BookmarkFolder {
  id: number;
  name: string;
  color: string;
  bookmarkCount: number;
  createdAt: string;
}

interface BookmarkedPaper {
  id: number;
  paperId: number;
  folderId: number | null;
  paper: {
    id: number;
    title: string;
    abstract: string;
    authors: string[];
  };
}

const FOLDER_COLORS = [
  { value: '#3b82f6', label: 'Blue' },
  { value: '#8b5cf6', label: 'Purple' },
  { value: '#ec4899', label: 'Pink' },
  { value: '#f59e0b', label: 'Orange' },
  { value: '#10b981', label: 'Green' },
  { value: '#ef4444', label: 'Red' },
];

export const BookmarkFolderManager: React.FC = () => {
  const [folders, setFolders] = useState<BookmarkFolder[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkedPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState<number | null>(null);
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false);
  const [editingFolder, setEditingFolder] = useState<BookmarkFolder | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [newFolderColor, setNewFolderColor] = useState('#3b82f6');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [foldersRes, bookmarksRes] = await Promise.all([
        fetch('/api/bookmark-folders', { headers }),
        fetch('/api/bookmarks', { headers })
      ]);

      if (foldersRes.ok) {
        const foldersData = await foldersRes.json();
        setFolders(foldersData);
      }

      if (bookmarksRes.ok) {
        const bookmarksData = await bookmarksRes.json();
        setBookmarks(bookmarksData);
      }
    } catch (error) {
      console.error('Error loading bookmark data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createFolder = async () => {
    if (!newFolderName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/bookmark-folders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName,
          color: newFolderColor
        })
      });

      if (response.ok) {
        await loadData();
        setShowNewFolderDialog(false);
        setNewFolderName('');
        setNewFolderColor('#3b82f6');
      } else {
        let errorMessage = `Failed to create folder (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = `Failed to create folder: ${errorData.error || errorMessage}`;
        } catch {
          // Response wasn't JSON, use status-based message
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error creating folder:', error);
      alert('Failed to create folder. Please try again.');
    }
  };

  const updateFolder = async () => {
    if (!editingFolder || !newFolderName.trim()) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookmark-folders/${editingFolder.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newFolderName,
          color: newFolderColor
        })
      });

      if (response.ok) {
        await loadData();
        setEditingFolder(null);
        setNewFolderName('');
        setNewFolderColor('#3b82f6');
      } else {
        let errorMessage = `Failed to update folder (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = `Failed to update folder: ${errorData.error || errorMessage}`;
        } catch {
          // Response wasn't JSON, use status-based message
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error updating folder:', error);
      alert('Failed to update folder. Please try again.');
    }
  };

  const deleteFolder = async (folderId: number) => {
    if (!confirm('Delete this folder? Bookmarks will be moved to Unfiled.')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookmark-folders/${folderId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await loadData();
        if (selectedFolder === folderId) {
          setSelectedFolder(null);
        }
      }
    } catch (error) {
      console.error('Error deleting folder:', error);
    }
  };

  const moveBookmark = async (paperId: number, folderId: number | null) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/bookmarks/${paperId}/folder`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ folderId })
      });

      if (response.ok) {
        await loadData();
      } else {
        let errorMessage = `Failed to move bookmark (${response.status})`;
        try {
          const errorData = await response.json();
          errorMessage = `Failed to move bookmark: ${errorData.error || errorMessage}`;
        } catch {
          // Response wasn't JSON, use status-based message
        }
        alert(errorMessage);
      }
    } catch (error) {
      console.error('Error moving bookmark:', error);
      alert('Failed to move bookmark. Please try again.');
    }
  };

  const openEditDialog = (folder: BookmarkFolder) => {
    setEditingFolder(folder);
    setNewFolderName(folder.name);
    setNewFolderColor(folder.color);
  };

  const filteredBookmarks = selectedFolder === null
    ? bookmarks.filter(b => b.folderId === null)
    : bookmarks.filter(b => b.folderId === selectedFolder);

  const unfiledCount = bookmarks.filter(b => b.folderId === null).length;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-gray-500">Loading bookmarks...</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Saved Papers</h2>
          <button
            onClick={() => setShowNewFolderDialog(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Folder</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Folders</h3>
            <div className="space-y-2">
              <button
                onClick={() => setSelectedFolder(null)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                  selectedFolder === null
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Bookmark className="w-4 h-4" />
                  <span className="text-sm font-medium">Unfiled</span>
                </div>
                <span className="text-xs text-gray-500">{unfiledCount}</span>
              </button>

              {folders.map(folder => (
                <div
                  key={folder.id}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg transition-colors group ${
                    selectedFolder === folder.id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <button
                    onClick={() => setSelectedFolder(folder.id)}
                    className="flex items-center space-x-2 flex-1"
                  >
                    <Folder className="w-4 h-4" style={{ color: folder.color }} />
                    <span className="text-sm font-medium truncate">{folder.name}</span>
                    <span className="text-xs text-gray-500">({folder.bookmarkCount})</span>
                  </button>
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditDialog(folder)}
                      className="p-1 hover:bg-gray-200 rounded"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => deleteFolder(folder.id)}
                      className="p-1 hover:bg-red-100 rounded text-red-600"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:col-span-3">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              {selectedFolder === null
                ? 'Unfiled Bookmarks'
                : folders.find(f => f.id === selectedFolder)?.name || 'Bookmarks'}
            </h3>

            {filteredBookmarks.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bookmark className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bookmarks in this folder</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredBookmarks.map(bookmark => (
                  <div
                    key={bookmark.id}
                    className="flex items-start justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <a
                        href={`/paper/${bookmark.paper.id}`}
                        className="font-medium text-gray-900 hover:text-indigo-600 block truncate"
                      >
                        {bookmark.paper.title}
                      </a>
                      <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                        {bookmark.paper.abstract}
                      </p>
                      {bookmark.paper.authors && bookmark.paper.authors.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {bookmark.paper.authors.join(', ')}
                        </p>
                      )}
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <select
                        value={bookmark.folderId || ''}
                        onChange={(e) => moveBookmark(bookmark.paperId, e.target.value ? parseInt(e.target.value) : null)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 hover:border-indigo-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">Unfiled</option>
                        {folders.map(folder => (
                          <option key={folder.id} value={folder.id}>
                            {folder.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {(showNewFolderDialog || editingFolder) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingFolder ? 'Edit Folder' : 'Create New Folder'}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Folder Name
                </label>
                <input
                  type="text"
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g., Must Read, AI Research"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {FOLDER_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewFolderColor(color.value)}
                      className={`w-10 h-10 rounded-lg transition-all ${
                        newFolderColor === color.value
                          ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color.value }}
                      title={color.label}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowNewFolderDialog(false);
                  setEditingFolder(null);
                  setNewFolderName('');
                  setNewFolderColor('#3b82f6');
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={editingFolder ? updateFolder : createFolder}
                disabled={!newFolderName.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {editingFolder ? 'Save Changes' : 'Create Folder'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkFolderManager;
