import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Search,
  Users,
  Sparkles,
  TrendingUp,
  Eye,
  MessageCircle,
  Zap,
} from "lucide-react";
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
    const response = await apiClient.getPapers({ limit: 3 });
    if (response.data) {
      setTrendingPapers(
        response.data.map((paper) => ({
          ...paper,
          readCount: Math.floor(Math.random() * 150) + 20,
          commentCount: Math.floor(Math.random() * 25) + 1,
        })),
      );
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-600">
              {activeReaders} researchers exploring right now
            </span>
          </div>

          <h1 className="text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Where Curiosity Meets
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              {" "}
              Discovery
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Dive into research that sparks wonder. Connect ideas across fields.
            Join conversations that matter.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/library"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium transform hover:scale-105"
            >
              <Zap className="w-5 h-5" />
              <span>Start Exploring</span>
            </Link>

            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all text-lg font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Join the Community</span>
            </Link>
          </div>
        </div>

        {/* Trending Research Stories */}
        <div className="mb-16">
          <div className="flex items-center space-x-2 mb-8">
            <TrendingUp className="w-6 h-6 text-indigo-600" />
            <h2 className="text-3xl font-bold text-gray-900">
              Research Stories Trending Now
            </h2>
          </div>
          <p className="text-gray-600 mb-6 text-center max-w-2xl mx-auto">
            Each research paper is transformed into an engaging story
            highlighting key insights, real-world impact, and why it matters to
            you.
          </p>

          <div className="grid md:grid-cols-3 gap-6">
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
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            What Sparks Your Curiosity?
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
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

        {/* Community Highlights */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">Join the Conversation</h2>
          <p className="text-xl opacity-90 mb-6 max-w-2xl mx-auto">
            Every paper tells a story. Every reader brings a perspective. What
            will you discover today?
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <div>
              <div className="text-2xl font-bold">2.4k+</div>
              <div className="opacity-80">Active Researchers</div>
            </div>
            <div>
              <div className="text-2xl font-bold">850+</div>
              <div className="opacity-80">Papers Published</div>
            </div>
            <div>
              <div className="text-2xl font-bold">15k+</div>
              <div className="opacity-80">Discussions Started</div>
            </div>
          </div>
        </div>
      </div>

      {/* Simplified Footer */}
      <footer className="bg-gray-50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
              <span className="text-xl font-bold text-gray-900">
                Research Platform
              </span>
            </div>
            <p className="text-gray-600 mb-6">Where research comes alive</p>
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <Link
                to="/library"
                className="hover:text-indigo-600 transition-colors"
              >
                Explore
              </Link>
              <Link
                to="/about"
                className="hover:text-indigo-600 transition-colors"
              >
                About
              </Link>
              <Link
                to="/how-it-works"
                className="hover:text-indigo-600 transition-colors"
              >
                How It Works
              </Link>
              <Link
                to="/auth"
                className="hover:text-indigo-600 transition-colors"
              >
                Join
              </Link>
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