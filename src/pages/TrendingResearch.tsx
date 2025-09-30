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