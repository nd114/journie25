
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

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setCommunities([
      {
        id: '1',
        name: 'AI & Machine Learning',
        description: 'Discuss latest developments in artificial intelligence and machine learning research.',
        memberCount: 1240,
        category: 'Technology',
        isJoined: false
      },
      {
        id: '2',
        name: 'Climate Science',
        description: 'Community for researchers working on climate change and environmental science.',
        memberCount: 890,
        category: 'Environment',
        isJoined: true
      },
      {
        id: '3',
        name: 'Quantum Computing',
        description: 'Explore quantum computing research, algorithms, and applications.',
        memberCount: 567,
        category: 'Technology',
        isJoined: false
      },
      {
        id: '4',
        name: 'Medical Research',
        description: 'Share and discuss medical research findings and methodologies.',
        memberCount: 2100,
        category: 'Medicine',
        isJoined: false
      }
    ]);
  }, []);

  const categories = ['all', 'Technology', 'Environment', 'Medicine', 'Physics', 'Biology'];
  const filteredCommunities = filter === 'all' ? communities : communities.filter(c => c.category === filter);

  const handleJoinCommunity = (communityId: string) => {
    setCommunities(prev => prev.map(c => 
      c.id === communityId ? { ...c, isJoined: !c.isJoined, memberCount: c.isJoined ? c.memberCount - 1 : c.memberCount + 1 } : c
    ));
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
            <button className="bg-blue-600 text-white px-6 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors">
              Create Community
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
