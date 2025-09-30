
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  category: string;
  isJoined: boolean;
}

export function ResearchCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [filter, setFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    description: '',
    category: 'Technology'
  });

  useEffect(() => {
    loadCommunities();
  }, [filter]);

  const loadCommunities = async () => {
    try {
      const response = await fetch(`/api/communities${filter !== 'all' ? `?category=${filter}` : ''}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCommunities(data.map((c: any) => ({ ...c, id: c.id.toString() })));
      }
    } catch (error) {
      console.error('Failed to load communities:', error);
    }
  };

  const categories = ['all', 'Technology', 'Environment', 'Medicine', 'Physics', 'Biology'];
  const filteredCommunities = filter === 'all' ? communities : communities.filter(c => c.category === filter);

  const handleJoinCommunity = async (communityId: string) => {
    try {
      const community = communities.find(c => c.id === communityId);
      if (!community) return;

      const endpoint = community.isJoined ? 'leave' : 'join';
      const response = await fetch(`/api/communities/${communityId}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setCommunities(prev => prev.map(c => 
          c.id === communityId ? { 
            ...c, 
            isJoined: !c.isJoined, 
            memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 
          } : c
        ));
      }
    } catch (error) {
      console.error('Failed to update community membership:', error);
    }
  };

  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.description.trim()) return;
    
    try {
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newCommunity)
      });

      if (response.ok) {
        const community = await response.json();
        setCommunities(prev => [community, ...prev]);
        setShowCreateModal(false);
        setNewCommunity({ name: '', description: '', category: 'Technology' });
      }
    } catch (error) {
      console.error('Failed to create community:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Communities</h1>
          <p className="text-lg text-gray-600">
            Connect with researchers in your field, share insights, and collaborate on groundbreaking research.
          </p>
        </div>

        {/* Filter Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setFilter(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filter === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Communities Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCommunities.map(community => (
            <div key={community.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{community.name}</h3>
                <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {community.category}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{community.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">
                  {community.memberCount.toLocaleString()} members
                </span>
                <button
                  onClick={() => handleJoinCommunity(community.id)}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    community.isJoined
                      ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {community.isJoined ? 'Joined' : 'Join'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Create Community CTA */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Don't see your research area?
            </h2>
            <p className="text-gray-600 mb-6">
              Create a new community and bring together researchers in your field.
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors"
            >
              Create Community
            </button>
          </div>
        </div>

        {/* Create Community Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">Create New Community</h3>
                  <button 
                    onClick={() => setShowCreateModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Community Name
                    </label>
                    <input
                      type="text"
                      value={newCommunity.name}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter community name"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newCommunity.description}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                      placeholder="Describe your community"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={newCommunity.category}
                      onChange={(e) => setNewCommunity(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {categories.slice(1).map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    onClick={handleCreateCommunity}
                    disabled={!newCommunity.name.trim() || !newCommunity.description.trim()}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Create Community
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          </div>
        </div>
      </div>
    </div>
  );
}
