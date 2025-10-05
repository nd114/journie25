
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Users, Plus, Search, AlertCircle, RefreshCw } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface Community {
  id: number;
  name: string;
  description: string;
  category: string;
  memberCount: number;
  isJoined: boolean;
}

export function ResearchCommunities() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'Computer Science'
  });

  const categories = [
    'All',
    'Computer Science',
    'Physics',
    'Biology',
    'Chemistry',
    'Mathematics',
    'Climate Science',
    'Neuroscience',
    'Psychology'
  ];

  useEffect(() => {
    loadCommunities();
  }, [selectedCategory]);

  const loadCommunities = async () => {
    setLoading(true);
    setError(null);
    try {
      const category = selectedCategory === 'All' ? '' : selectedCategory;
      const response = await apiClient.getCommunities(category);
      if (response.data && Array.isArray(response.data)) {
        setCommunities(response.data);
      } else if (response.error) {
        setError('Failed to load communities. Please try again.');
        setCommunities([]);
      } else {
        setCommunities([]);
      }
    } catch (error) {
      console.error('Failed to load communities:', error);
      setError('Unable to load communities. Please check your connection and try again.');
      setCommunities([]);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinCommunity = async (communityId: number) => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const community = communities.find(c => c.id === communityId);
      if (!community) return;

      if (community.isJoined) {
        const response = await apiClient.leaveCommunity(communityId);
        if (!response.error) {
          setCommunities(prev => prev.map(c => 
            c.id === communityId ? { ...c, isJoined: false, memberCount: c.memberCount - 1 } : c
          ));
        }
      } else {
        const response = await apiClient.joinCommunity(communityId);
        if (!response.error) {
          setCommunities(prev => prev.map(c => 
            c.id === communityId ? { ...c, isJoined: true, memberCount: c.memberCount + 1 } : c
          ));
        }
      }
    } catch (error) {
      console.error('Failed to join/leave community:', error);
    }
  };

  const handleCreateCommunity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(newCommunity)
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewCommunity({ name: '', description: '', category: 'Computer Science' });
        loadCommunities();
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };

  const filteredCommunities = communities.filter(community =>
    community.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    community.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Communities</h1>
              <p className="text-lg text-gray-600">
                Connect with researchers in your field and beyond
              </p>
            </div>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Community</span>
              </button>
            )}
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search communities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category === 'All' ? '' : category)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  (category === 'All' && !selectedCategory) || selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">Loading communities...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Unable to Load Communities</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={loadCommunities}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Retry</span>
            </button>
          </div>
        ) : filteredCommunities.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No communities found</h3>
            <p className="text-gray-500 mb-6">
              {searchQuery || selectedCategory 
                ? 'Try adjusting your search or filters' 
                : 'Be the first to create a community'}
            </p>
            {user && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Create Community</span>
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCommunities.map((community) => (
              <div key={community.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-800 rounded-full">
                    {community.category}
                  </span>
                  <div className="flex items-center space-x-1 text-sm text-gray-500">
                    <Users className="w-4 h-4" />
                    <span>{community.memberCount}</span>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{community.name}</h3>
                <p className="text-gray-600 mb-4 line-clamp-2">{community.description}</p>
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    community.isJoined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  {community.isJoined ? 'Leave' : 'Join Community'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Community Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Community</h2>
            <form onSubmit={handleCreateCommunity}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Community Name
                </label>
                <input
                  type="text"
                  required
                  value={newCommunity.name}
                  onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={3}
                  value={newCommunity.description}
                  onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newCommunity.category}
                  onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {categories.filter(c => c !== 'All').map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}
