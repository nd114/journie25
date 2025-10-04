
import React from "react";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  User, 
  Eye, 
  MessageCircle, 
  TrendingUp, 
  Lightbulb, 
  Target, 
  Zap,
  Clock,
  Share2,
  Bookmark
} from "lucide-react";

interface ResearchStoryCardProps {
  id: number;
  title: string;
  abstract: string;
  authors?: string[];
  createdAt: string;
  field?: string;
  viewCount?: number;
  commentCount?: number;
  rank?: number;
  keyInsights?: string[];
  whyItMatters?: string;
  readTime?: number;
  onInteraction?: (type: string) => void;
}

const ResearchStoryCard: React.FC<ResearchStoryCardProps> = ({
  id,
  title,
  abstract,
  authors,
  createdAt,
  field,
  viewCount,
  commentCount,
  rank,
  keyInsights,
  whyItMatters,
  readTime = 5,
  onInteraction,
}) => {
  // Extract key insight from abstract if not provided
  const defaultInsight = abstract ? ((abstract.split('.')[0] || '').substring(0, 120) + (abstract.length > 120 ? '...' : '')) : '';
  const displayInsight = keyInsights?.[0] || defaultInsight;

  // Generate "why this matters" if not provided
  const getDefaultWhyItMatters = (field?: string) => {
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

  const displayWhyMatters = whyItMatters || getDefaultWhyItMatters(field);

  const handleQuickAction = (action: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onInteraction?.(action);
  };

  return (
    <Link to={`/paper/${id}`} className="block group">
      <div className="bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-[1.02] relative overflow-hidden">
        
        {/* Header with badges */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs font-bold rounded-full">
              <Lightbulb className="w-3 h-3" />
              <span>Research Story</span>
            </div>
            {rank && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-gradient-to-r from-orange-400 to-red-500 text-white text-xs font-bold rounded-full">
                <TrendingUp className="w-3 h-3" />
                <span>#{rank}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-1 text-xs text-gray-500">
            <Clock className="w-3 h-3" />
            <span>{readTime} min read</span>
          </div>
        </div>

        {/* Field badge */}
        {field && (
          <div className="mb-4">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md">
              {field}
            </span>
          </div>
        )}

        {/* Story Title */}
        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 group-hover:text-indigo-600 transition-colors leading-tight">
          {title}
        </h3>

        {/* Key Insight */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-semibold text-gray-700">Key Breakthrough</span>
          </div>
          <div className="bg-yellow-50 p-3 rounded-lg border-l-4 border-yellow-300">
            <p className="text-gray-700 text-sm leading-relaxed">{displayInsight}</p>
          </div>
        </div>

        {/* Why This Matters */}
        <div className="mb-4">
          <div className="flex items-center space-x-2 mb-2">
            <Target className="w-4 h-4 text-green-500" />
            <span className="text-sm font-semibold text-gray-700">Real-World Impact</span>
          </div>
          <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-300">
            <p className="text-gray-600 text-sm leading-relaxed">{displayWhyMatters}</p>
          </div>
        </div>

        {/* Engagement metrics */}
        <div className="flex items-center justify-between mb-4 text-sm">
          <div className="flex items-center space-x-4 text-gray-500">
            {viewCount && (
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{viewCount}</span>
              </div>
            )}
            {commentCount && (
              <div className="flex items-center space-x-1">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
              </div>
            )}
          </div>
          
          {/* Quick actions */}
          <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleQuickAction('save', e)}
              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Save for later"
            >
              <Bookmark className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => handleQuickAction('share', e)}
              className="p-1 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Author & Date */}
        <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-2">
            <User className="w-4 h-4" />
            <span className="truncate">
              {authors?.slice(0, 2).join(", ") || "Unknown Author"}
              {authors && authors.length > 2 && " +more"}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Continue reading hint */}
        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center group-hover:bg-indigo-200 transition-colors">
            <span className="text-indigo-600 font-bold">→</span>
          </div>
        </div>

        {/* Hover gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default ResearchStoryCard;
