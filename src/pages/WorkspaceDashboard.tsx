import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, FileText, Edit, Trash2, BookOpen, Bookmark } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PaperCard from '../components/PaperCard';
import BookmarkFolderManager from '../components/BookmarkFolderManager';
import { apiClient } from '../services/apiClient';

interface Paper {
  id: number;
  title: string;
  abstract: string;
  authors?: string[];
  createdAt: string;
  status: string;
}

const WorkspaceDashboard: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'papers' | 'bookmarks'>('papers');
  const [filter, setFilter] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    loadPapers();
  }, []);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/me/papers', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setPapers(data.papers || []);
      } else {
        console.error('Error loading papers:', response.statusText);
        setPapers([]);
      }
    } catch (error) {
      console.error('Exception loading papers:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this paper?')) return;

    const response = await apiClient.deletePaper(id);
    if (!response.error) {
      setPapers(papers.filter(p => p.id !== id));
    }
  };

  const filteredPapers = Array.isArray(papers) ? papers.filter(paper => {
    if (filter === 'all') return true;
    return paper.status === filter;
  }) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Research Workspace</h1>
            <p className="text-gray-600 mt-2">Manage your research papers and bookmarks</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/library"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-white text-indigo-600 border-2 border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              <BookOpen className="w-5 h-5" />
              <span>Browse All Papers</span>
            </Link>
            <Link
              to="/workspace/editor"
              className="flex items-center justify-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span>New Paper</span>
            </Link>
          </div>
        </div>

        <div className="flex space-x-4 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('papers')}
            className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'papers'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>My Papers</span>
          </button>
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`flex items-center space-x-2 px-4 py-3 font-medium transition-colors border-b-2 ${
              activeTab === 'bookmarks'
                ? 'text-indigo-600 border-indigo-600'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            <Bookmark className="w-4 h-4" />
            <span>Saved Papers</span>
          </button>
        </div>

        {activeTab === 'papers' && (
          <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            All Papers ({Array.isArray(papers) ? papers.length : 0})
          </button>
          <button
            onClick={() => setFilter('draft')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'draft'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Drafts ({Array.isArray(papers) ? papers.filter(p => p.status === 'draft').length : 0})
          </button>
          <button
            onClick={() => setFilter('published')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === 'published'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            Published ({Array.isArray(papers) ? papers.filter(p => p.status === 'published').length : 0})
          </button>
        </div>
        )}

        {activeTab === 'papers' ? (
          <>
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            ) : filteredPapers.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No papers found</p>
                <Link
                  to="/workspace/editor"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  <span>Create Your First Paper</span>
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredPapers.map((paper) => (
                  <div key={paper.id} className="relative group">
                    <PaperCard {...paper} />
                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex space-x-2">
                      <Link
                        to={`/workspace/editor/${paper.id}`}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                      >
                        <Edit className="w-4 h-4 text-indigo-600" />
                      </Link>
                      <button
                        onClick={() => handleDelete(paper.id)}
                        className="p-2 bg-white rounded-lg shadow-md hover:bg-gray-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <BookmarkFolderManager />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default WorkspaceDashboard;