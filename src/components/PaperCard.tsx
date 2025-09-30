import React from "react";
import { Link } from "react-router-dom";
import { Calendar, User, Eye, MessageCircle, TrendingUp } from "lucide-react";

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
  return (
    <Link to={`/paper/${id}`} className="block group">
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-xl transition-all transform hover:scale-102 relative overflow-hidden">
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

        {/* Field Tag */}
        {field && (
          <div className="mb-3">
            <span className="inline-block px-2 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 rounded-md">
              {field}
            </span>
          </div>
        )}

        <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>

        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
          {abstract}
        </p>

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
                <span className="text-xs">comments</span>
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-sm text-gray-500">
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

        {/* Hover Effect Gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl pointer-events-none"></div>
      </div>
    </Link>
  );
};

export default PaperCard;
