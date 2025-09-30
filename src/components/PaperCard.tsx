import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Eye, MessageCircle, TrendingUp, Lightbulb, Target, Zap } from "lucide-react";

interface PaperCardProps {
  id: number;
  title: string;
  abstract: string;
  authors?: string[];
  createdAt: string;
  status?: string;
  field?: string;
  readCount?: number;
  commentCount?: number;
  showEngagement?: boolean;
  rank?: number;
}

const PaperCard: React.FC<PaperCardProps> = ({
  id,
  title,
  abstract,
  authors,
  createdAt,
  status,
  field,
  readCount,
  commentCount,
  showEngagement = false,
  rank,
}) => {
  // Extract key insight from abstract (first sentence or up to 120 chars)
  const keyInsight = abstract.split('.')[0].substring(0, 120) + (abstract.length > 120 ? '...' : '');

  // Generate a "why this matters" snippet based on field
  const getWhyThisMatters = (field?: string) => {
    const impacts = {
      'Computer Science': 'Could reshape how we interact with technology',
      'AI & Machine Learning': 'May unlock new possibilities in artificial intelligence',
      'Climate Science': 'Could help address our climate challenges',
      'Neuroscience': 'Might advance our understanding of the brain',
      'Physics': 'Could reveal new laws of the universe',
      'Biology': 'May lead to breakthrough medical treatments',
      'Space Exploration': 'Could expand human presence beyond Earth',
      'Biotechnology': 'Might revolutionize healthcare and medicine',
      'Quantum Physics': 'Could enable quantum computing breakthroughs'
    };
    return impacts[field as keyof typeof impacts] || 'Could open new research directions';
  };

  const estimatedReadTime = Math.max(2, Math.ceil(abstract.length / 200));

  return (
    <Link to={`/paper/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-102 relative overflow-hidden">
        {/* Story Badge */}
        <div className="absolute top-4 left-4">
          <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
            <Lightbulb className="w-3 h-3" />
            <span>Research Story</span>
          </div>
        </div>


        {/* Read Time & Field */}
        <div className="mt-8 mb-4 flex items-center justify-between">
          <span className="text-xs text-gray-500 font-medium">
            {estimatedReadTime} min read
          </span>
          {field && (
            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md">
              {field}
            </span>
          )}
        </div>

        {/* Story Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
          {title}
        </h3>

        {/* Key Insight */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Key Insight</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-300">
            {keyInsight}
          </p>
        </div>

        {/* Why This Matters */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">Why This Matters</span>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed bg-green-50 p-3 rounded-lg border-l-4 border-green-300">
            {getWhyThisMatters(field)}
          </p>
        </div>
        
        {/* Trending Badge */}
        {rank && (
          <div className="absolute top-4 right-4">
            <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full">
              <TrendingUp className="w-3 h-3" />
              <span>#{rank}</span>
            </div>
          </div>
        )}

        {/* Status Badge */}
        {status && (
          <span
            className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-3 ${
              status === "published"
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {status}
          </span>
        )}

        {/* Engagement Metrics */}
        {showEngagement && (readCount || commentCount) && (
          <div className="flex items-center space-x-4 mb-4 text-sm">
            {readCount && (
              <div className="flex items-center space-x-1 text-gray-500">
                <Eye className="w-4 h-4" />
                <span>{readCount}</span>
                <span className="text-xs">reads</span>
              </div>
            )}
            {commentCount && (
              <div className="flex items-center space-x-1 text-gray-500">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
                <span className="text-xs">discussions</span>
              </div>
            )}
          </div>
        )}

        {/* Author & Date */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100"><div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="truncate">
              {authors?.join(", ") || "Unknown Author"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>

          {/* Story Continuation Hint */}
          <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
              <span className="text-indigo-600 font-bold">→</span>
            </div>
          </div>

          {/* Hover Effect Gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default PaperCard;
