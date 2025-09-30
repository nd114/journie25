import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface TrendingPaper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  field: string;
  metrics: {
    views: number;
    discussions: number;
    citations: number;
    trend: string;
  };
  publishedAt: string;
  isBookmarked: boolean;
}

export function TrendingResearch() {
  const [trendingPapers, setTrendingPapers] = useState<TrendingPaper[]>([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [fieldFilter, setFieldFilter] = useState('all');

  useEffect(() => {
    loadTrendingPapers();
  }, [timeFilter, fieldFilter]); // Added dependencies to re-fetch on filter change

  const loadTrendingPapers = async () => {
    try {
      // Construct API URL with filters
      const apiUrl = `/api/papers/trending?time=${timeFilter}&field=${fieldFilter}&limit=10`;
      const response = await fetch(apiUrl);

      if (response.ok) {
        const data = await response.json();
        const formattedPapers = data.map((paper: any) => ({
          id: paper.id,
          title: paper.title,
          authors: paper.authors || ['Unknown Author'],
          abstract: paper.abstract || 'No abstract available',
          field: paper.researchField || 'Uncategorized',
          metrics: {
            views: paper.viewCount || 0,
            discussions: paper.metrics?.discussions || 0, // Assuming metrics object from backend
            citations: paper.metrics?.citations || 0, // Assuming metrics object from backend
            trend: paper.metrics?.trend || "+0%" // Assuming metrics object from backend
          },
          publishedAt: paper.publishedAt || paper.createdAt,
          isBookmarked: paper.isBookmarked || false // Assuming backend provides bookmark status
        }));
        setTrendingPapers(formattedPapers);
      } else {
        console.error('Failed to load trending papers:', response.statusText);
        // Optionally set an error state here
      }
    } catch (error) {
      console.error('Error fetching trending papers:', error);
      // Optionally set an error state here
    }
  };

  const handleBookmark = async (paperId: number) => {
    try {
      const paper = trendingPapers.find(p => p.id === paperId);
      if (!paper) return;

      const endpoint = paper.isBookmarked ? 'DELETE' : 'POST';
      const response = await fetch(`/api/papers/${paperId}/bookmark`, {
        method: endpoint,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setTrendingPapers(prev => prev.map(p => 
          p.id === paperId ? { ...p, isBookmarked: !p.isBookmarked } : p
        ));
      } else {
        console.error('Failed to update bookmark:', response.statusText);
        // Optionally show error to user
      }
    } catch (error) {
      console.error('Error updating bookmark:', error);
      // Optionally show error to user
    }
  };

  const timeFilters = [
    { value: 'day', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'year', label: 'This Year' }
  ];

  const fields = ['all', 'AI & Machine Learning', 'Quantum Computing', 'Biotechnology', 'Climate Science', 'Physics'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trending Research</h1>
          <p className="text-lg text-gray-600">
            Discover the most impactful and talked-about research papers across all fields.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time Period</label>
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {timeFilters.map(filter => (
                  <option key={filter.value} value={filter.value}>{filter.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Research Field</label>
              <select
                value={fieldFilter}
                onChange={(e) => setFieldFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {fields.map(field => (
                  <option key={field} value={field}>
                    {field === 'all' ? 'All Fields' : field}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Trending Papers */}
        <div className="space-y-6">
          {trendingPapers.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No trending papers found. Try adjusting filters.</p>
          ) : (
            trendingPapers.map((paper, index) => (
              <div key={paper.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{paper.title}</h3>
                      <p className="text-sm text-gray-600 mb-1">
                        by {paper.authors.join(', ')}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                          {paper.field}
                        </span>
                        <span>{paper.metrics.views.toLocaleString()} views</span>
                        <span>Published {new Date(paper.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">{paper.metrics.trend}</div>
                    <div className="text-xs text-gray-500">Trend</div>
                  </div>
                </div>

                <p className="text-gray-700 mb-4">{paper.abstract}</p>

                <div className="flex justify-between items-center">
                  <button className="text-blue-600 hover:text-blue-800 font-medium">
                    Read Full Paper →
                  </button>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleBookmark(paper.id)}
                      className={`px-3 py-1 text-sm border rounded-md hover:bg-gray-50 ${paper.isBookmarked ? 'bg-yellow-100 border-yellow-400' : 'border-gray-300'}`}
                    >
                      {paper.isBookmarked ? 'Unsave' : 'Save'}
                    </button>
                    <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                      Share
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Trending Topics Section - This section remains as mock data for now */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Trending Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Quantum AI', 'Gene Therapy', 'Climate Modeling'].map((topic, index) => (
              <div key={topic} className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
                <h3 className="text-lg font-semibold mb-2">{topic}</h3>
                <p className="text-blue-100 mb-4">
                  {index === 0 ? '47 papers this week' : index === 1 ? '32 papers this week' : '28 papers this week'}
                </p>
                <button className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100">
                  Explore →
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { TrendingUp, Eye, MessageCircle, Clock, Filter } from 'lucide-react';

interface TrendingTopic {
  id: string;
  topic: string;
  field: string;
  momentumScore: number;
  papers: Array<{
    id: number;
    title: string;
    abstract: string;
    authors: string[];
    viewCount: number;
    commentCount: number;
    publishedAt: string;
  }>;
}

export function TrendingResearch() {
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [selectedField, setSelectedField] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTrendingData();
  }, [selectedField]);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/trending');
      if (response.ok) {
        const data = await response.json();
        setTrendingTopics(data);
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
      // Mock data for development
      setTrendingTopics([
        {
          id: '1',
          topic: 'Machine Learning',
          field: 'Computer Science',
          momentumScore: 95.5,
          papers: [
            {
              id: 1,
              title: 'Advanced Neural Networks for Climate Prediction',
              abstract: 'This paper explores novel neural network architectures for improving climate modeling accuracy.',
              authors: ['Dr. Sarah Chen', 'Dr. Michael Brown'],
              viewCount: 1250,
              commentCount: 89,
              publishedAt: '2024-01-15'
            }
          ]
        },
        {
          id: '2',
          topic: 'Gene Therapy',
          field: 'Biotechnology',
          momentumScore: 89.7,
          papers: [
            {
              id: 2,
              title: 'CRISPR Applications in Rare Disease Treatment',
              abstract: 'Breakthrough applications of CRISPR technology for treating rare genetic disorders.',
              authors: ['Dr. Lisa Wang', 'Dr. James Miller'],
              viewCount: 987,
              commentCount: 67,
              publishedAt: '2024-01-12'
            }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const fields = ['all', 'Computer Science', 'Biotechnology', 'Physics', 'Climate Science'];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Trending Research</h1>
          <p className="text-lg text-gray-600">
            Discover what's capturing the research community's attention right now.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <div className="flex items-center space-x-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <select
              value={selectedField}
              onChange={(e) => setSelectedField(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {fields.map(field => (
                <option key={field} value={field}>
                  {field === 'all' ? 'All Fields' : field}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading trending research...</p>
          </div>
        ) : (
          <div className="space-y-8">
            {trendingTopics.map((topic, index) => (
              <div key={topic.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2 bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
                      <TrendingUp className="w-4 h-4" />
                      <span>#{index + 1} Trending</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900">{topic.topic}</h2>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">{topic.field}</div>
                    <div className="text-lg font-bold text-orange-600">{topic.momentumScore.toFixed(1)}% momentum</div>
                  </div>
                </div>

                <div className="grid gap-4">
                  {topic.papers.map(paper => (
                    <div key={paper.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{paper.abstract}</p>

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          By {paper.authors.join(', ')}
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{paper.viewCount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{paper.commentCount}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}