
import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';

interface TrendingPaper {
  id: number;
  title: string;
  authors: string[];
  abstract: string;
  field: string;
  viewCount: number;
  trendingScore: number;
  publishedAt: string;
}

export function TrendingResearch() {
  const [trendingPapers, setTrendingPapers] = useState<TrendingPaper[]>([]);
  const [timeFilter, setTimeFilter] = useState('week');
  const [fieldFilter, setFieldFilter] = useState('all');

  useEffect(() => {
    // Mock data - in real app, fetch from API
    setTrendingPapers([
      {
        id: 1,
        title: 'Revolutionary Quantum Error Correction Using AI-Optimized Protocols',
        authors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
        abstract: 'We present a novel approach to quantum error correction that leverages machine learning to optimize correction protocols in real-time...',
        field: 'Quantum Computing',
        viewCount: 12500,
        trendingScore: 98.5,
        publishedAt: '2024-01-15'
      },
      {
        id: 2,
        title: 'CRISPR-Cas9 Breakthrough: Precision Gene Editing in Neural Tissue',
        authors: ['Dr. Emma Watson', 'Dr. James Liu', 'Prof. Sarah Johnson'],
        abstract: 'Our research demonstrates unprecedented precision in gene editing within neural tissue using modified CRISPR-Cas9 systems...',
        field: 'Biotechnology',
        viewCount: 9800,
        trendingScore: 94.2,
        publishedAt: '2024-01-12'
      },
      {
        id: 3,
        title: 'Climate Tipping Points: New Models Predict Earlier Timeline',
        authors: ['Prof. David Kim', 'Dr. Maria Santos'],
        abstract: 'Advanced climate modeling reveals that critical tipping points may occur 15-20 years earlier than previously predicted...',
        field: 'Climate Science',
        viewCount: 15200,
        trendingScore: 92.8,
        publishedAt: '2024-01-10'
      }
    ]);
  }, [timeFilter, fieldFilter]);

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
          {trendingPapers.map((paper, index) => (
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
                      <span>{paper.viewCount.toLocaleString()} views</span>
                      <span>Published {new Date(paper.publishedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">{paper.trendingScore}</div>
                  <div className="text-xs text-gray-500">Trending Score</div>
                </div>
              </div>
              
              <p className="text-gray-700 mb-4">{paper.abstract}</p>
              
              <div className="flex justify-between items-center">
                <button className="text-blue-600 hover:text-blue-800 font-medium">
                  Read Full Paper →
                </button>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Save
                  </button>
                  <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
                    Share
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trending Topics Section */}
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
