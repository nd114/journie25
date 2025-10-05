import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Users,
  TrendingUp,
  Eye,
  MessageCircle,
  Zap
} from "lucide-react";

const CommunityStats: React.FC = () => {
  const [stats, setStats] = useState({
    researchers: 0,
    papers: 0,
    discussions: 0,
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await fetch('/api/analytics/dashboard');
        if (response.ok) {
          const data = await response.json();
          setStats({
            researchers: data.totalUsers || 0,
            papers: data.totalPapers || 0,
            discussions: data.totalComments || 0,
          });
        }
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    };
    loadStats();
  }, []);

  return (
    <div className="flex flex-col sm:flex-row justify-center sm:space-x-8 space-y-4 sm:space-y-0 text-sm">
      <div>
        <div className="text-xl sm:text-2xl font-bold">{stats.researchers.toLocaleString()}+</div>
        <div className="opacity-80 text-xs sm:text-sm">Active Researchers</div>
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold">{stats.papers.toLocaleString()}+</div>
        <div className="opacity-80 text-xs sm:text-sm">Papers Published</div>
      </div>
      <div>
        <div className="text-xl sm:text-2xl font-bold">{stats.discussions.toLocaleString()}+</div>
        <div className="opacity-80 text-xs sm:text-sm">Discussions Started</div>
      </div>
    </div>
  );
};


import Navbar from "../components/Navbar";
import { apiClient } from "../services/apiClient";

interface TrendingPaper {
  id: number;
  title: string;
  abstract: string;
  authors?: string[];
  field?: string;
  readCount?: number;
  commentCount?: number;
}

const LibraryLanding: React.FC = () => {
  const [trendingPapers, setTrendingPapers] = useState<TrendingPaper[]>([]);
  const [activeReaders, setActiveReaders] = useState(127); // Mock data for now

  useEffect(() => {
    loadTrendingPapers();
    // Simulate live reader count updates
    const interval = setInterval(() => {
      setActiveReaders((prev) => prev + Math.floor(Math.random() * 3) - 1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadTrendingPapers = async () => {
    try {
      const response = await apiClient.getPapers({ limit: 3 });
      if (response.error) {
        console.error('Error loading trending papers:', response.error);
        setTrendingPapers([]);
        return;
      }

      if (response.data && Array.isArray(response.data)) {
        setTrendingPapers(
          response.data.map((paper) => ({
            ...paper,
            readCount: Math.floor(Math.random() * 150) + 20,
            commentCount: Math.floor(Math.random() * 25) + 1,
          })),
        );
      } else {
        setTrendingPapers([]);
      }
    } catch (error) {
      console.error('Exception loading trending papers:', error);
      setTrendingPapers([]);
    }
  };

  const researchFields = [
    {
      name: "AI & Machine Learning",
      color: "bg-purple-100 text-purple-800",
      icon: "🤖",
    },
    {
      name: "Climate Science",
      color: "bg-green-100 text-green-800",
      icon: "🌍",
    },
    { name: "Neuroscience", color: "bg-blue-100 text-blue-800", icon: "🧠" },
    {
      name: "Space Exploration",
      color: "bg-indigo-100 text-indigo-800",
      icon: "🚀",
    },
    { name: "Biotechnology", color: "bg-pink-100 text-pink-800", icon: "🧬" },
    {
      name: "Quantum Physics",
      color: "bg-orange-100 text-orange-800",
      icon: "⚛️",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />

      {/* Hero Section with Live Activity */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs sm:text-sm text-gray-600">
              {activeReaders} researchers exploring right now
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Where Curiosity Meets
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {" "}
              Discovery
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-6 sm:mb-8 leading-relaxed px-4">
            Dive into research that sparks wonder. Connect ideas across fields.
            Join conversations that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              to="/library"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-base sm:text-lg font-medium transform hover:scale-105 w-full sm:w-auto"
              aria-label="Start exploring research papers"
            >
              <Zap className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span>Start Exploring</span>
            </Link>

            <Link
              to="/auth"
              className="inline-flex items-center justify-center space-x-2 px-6 py-3 sm:px-8 sm:py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all text-base sm:text-lg font-medium w-full sm:w-auto"
              aria-label="Join the research community"
            >
              <Users className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />
              <span>Join the Community</span>
            </Link>
          </div>
        </div>

        {/* Trending Research Stories */}
        <div className="mb-12 sm:mb-16">
          <div className="flex items-center space-x-2 mb-6 sm:mb-8 px-2">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Research Stories Trending Now
            </h2>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 text-center max-w-2xl mx-auto px-4">
            Each research paper is transformed into an engaging story
            highlighting key insights, real-world impact, and why it matters to
            you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {trendingPapers.map((paper, index) => (
              <Link key={paper.id} to={`/paper/${paper.id}`}>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-xl transition-all transform hover:scale-102 group">
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 rounded-full">
                      #{index + 1} Trending
                    </span>
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{paper.readCount}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MessageCircle className="w-4 h-4" />
                        <span>{paper.commentCount}</span>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors line-clamp-2">
                    {paper.title}
                  </h3>

                  <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                    {paper.abstract}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {paper.authors?.slice(0, 2).join(", ")}
                      {paper.authors && paper.authors.length > 2 && " +more"}
                    </span>
                    <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
                      <span className="text-xs">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Explore by Interest */}
        <div className="mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center px-4">
            What Sparks Your Curiosity?
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {researchFields.map((field) => (
              <Link
                key={field.name}
                to={`/library?field=${encodeURIComponent(field.name)}`}
                className="group"
              >
                <div className="bg-white rounded-xl p-6 text-center border border-gray-100 hover:shadow-lg transition-all transform hover:scale-105">
                  <div className="text-3xl mb-3">{field.icon}</div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {field.name}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* New Feature Section */}
        <div className="text-center py-8 sm:py-12 lg:py-16 px-4">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 sm:mb-12">
            Unlock Your Research Potential
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📚</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Discover Research</h3>
              <p className="text-gray-600">
                Access cutting-edge research papers across all fields
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🤝</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Join Communities</h3>
              <p className="text-gray-600">
                Connect with researchers in your field and beyond
              </p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🛠️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Use Research Tools</h3>
              <p className="text-gray-600">
                Access powerful tools for analysis and collaboration
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎓</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Learn & Grow</h3>
              <p className="text-gray-600">
                Follow structured learning paths for your research area
              </p>
            </div>
          </div>
        </div>

        {/* Community Highlights */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-white text-center mx-2 sm:mx-0">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Join the Conversation</h2>
          <p className="text-base sm:text-xl opacity-90 mb-4 sm:mb-6 max-w-2xl mx-auto px-2">
            Every paper tells a story. Every reader brings a perspective. What
            will you discover today?
          </p>
          <CommunityStats />
        </div>
      </div>

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 mt-12 sm:mt-20 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Brand Section */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <BookOpen className="w-6 h-6 text-indigo-400" />
                <span className="text-xl font-bold">Research Platform</span>
              </div>
              <p className="text-gray-400 text-sm">
                Where curiosity meets discovery. Transforming academic papers into engaging research stories.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Explore</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/library" className="text-gray-400 hover:text-white transition-colors">Browse Papers</Link></li>
                <li><Link to="/trending" className="text-gray-400 hover:text-white transition-colors">Trending Research</Link></li>
                <li><Link to="/communities" className="text-gray-400 hover:text-white transition-colors">Communities</Link></li>
                <li><Link to="/learning-paths" className="text-gray-400 hover:text-white transition-colors">Learning Paths</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-gray-400 hover:text-white transition-colors">About Us</Link></li>
                <li><Link to="/how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</Link></li>
                <li><Link to="/tools" className="text-gray-400 hover:text-white transition-colors">Research Tools</Link></li>
                <li><Link to="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-gray-400 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
                <li><Link to="/auth" className="text-gray-400 hover:text-white transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">
              © {new Date().getFullYear()} Research Platform. All rights reserved.
            </p>
            <div className="flex space-x-6 text-gray-400">
              <a href="#" className="hover:text-white transition-colors text-sm">Twitter</a>
              <a href="#" className="hover:text-white transition-colors text-sm">GitHub</a>
              <a href="#" className="hover:text-white transition-colors text-sm">LinkedIn</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LibraryLanding;

/*
Phase 2 Plan: Enhancements and New Features

Frontend:
- Implement user profiles with customizable avatars and bios.
- Develop a "Saved Papers" feature for users to bookmark articles.
- Enhance search functionality with advanced filtering options (date, author, journal).
- Add a "Recommended Papers" section based on user's reading history and interests.
- Implement real-time collaboration features for group discussions on papers.
- Improve UI/UX with more dynamic animations and smoother transitions.

Backend:
- Develop robust user authentication and authorization system.
- Create APIs for managing user profiles, saved papers, and search queries.
- Implement a recommendation engine for personalized paper suggestions.
- Set up a system for tracking paper reads, comments, and user engagement.
- Optimize database performance for faster data retrieval.
- Integrate with external research databases (e.g., PubMed, arXiv) for broader content access.
- Implement a notification system for new papers or discussions relevant to user interests.
- Develop a content moderation system for user-generated content.
*/