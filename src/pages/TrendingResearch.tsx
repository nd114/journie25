import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { TrendingUp, Eye, MessageCircle, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiClient } from '../services/apiClient';

interface TrendingPaper {
  id: number;
  title: string;
  abstract: string;
  field: string;
  viewCount: number;
  commentCount: number;
  trendScore: number;
  publishedAt: string;
  authors?: string[];
}

interface TrendingTopic {
  name: string;
  count: number;
  growth: string;
}

export function TrendingResearch() {
  const [trendingPapers, setTrendingPapers] = useState<TrendingPaper[]>([]);
  const [trendingTopics, setTrendingTopics] = useState<TrendingTopic[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month'>('week');

  useEffect(() => {
    loadTrendingData();
  }, [timeRange]);

  const loadTrendingData = async () => {
    setLoading(true);
    try {
      const [papersResponse, topicsResponse] = await Promise.all([
        apiClient.getTrendingPapers(20),
        fetch('/api/trending-topics?limit=10').then(r => r.json())
      ]);

      if (papersResponse.data && Array.isArray(papersResponse.data)) {
        setTrendingPapers(papersResponse.data);
      }

      if (topicsResponse && Array.isArray(topicsResponse)) {
        setTrendingTopics(topicsResponse);
      }
    } catch (error) {
      console.error('Failed to load trending data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Trending Research</h1>
          <p className="text-lg text-gray-600">
            Discover what's hot in the research community
          </p>
        </div>

        {/* Time Range Filter */}
        <div className="flex space-x-2 mb-6">
          {(['day', 'week', 'month'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              Past {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">Loading trending data...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Trending Papers */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Papers</h2>
              <div className="space-y-4">
                {trendingPapers.map((paper, index) => (
                  <Link
                    key={paper.id}
                    to={`/paper/${paper.id}`}
                    className="block bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-indigo-600">#{index + 1}</span>
                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {paper.field}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-600 text-sm font-medium">
                        <TrendingUp className="w-4 h-4" />
                        <span>+{Math.round(paper.trendScore)}%</span>
                      </div>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{paper.title}</h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{paper.abstract}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-4 h-4" />
                          <span>{paper.viewCount.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>{paper.commentCount}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Trending Topics */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Trending Topics</h2>
              <div className="bg-white rounded-lg shadow-md p-6">
                <div className="space-y-4">
                  {trendingTopics.map((topic, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-900">{topic.name}</div>
                        <div className="text-sm text-gray-500">{topic.count} papers</div>
                      </div>
                      <span className="text-green-600 text-sm font-medium">{topic.growth}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
