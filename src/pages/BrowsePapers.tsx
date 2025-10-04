import React, { useState, useEffect } from "react";
import {
  Search,
  Filter,
  TrendingUp,
  Clock,
  Users,
  Eye,
  MessageCircle,
  Shuffle,
  Lightbulb,
} from "lucide-react";
import Navbar from "../components/Navbar";
import PaperCard from "../components/PaperCard";
import { apiClient } from "../services/apiClient";

interface Paper {
  id: number;
  title: string;
  abstract: string;
  authors?: string[];
  createdAt: string;
  status: string;
  field?: string;
  readCount?: number;
  commentCount?: number;
}

const BrowsePapers: React.FC = () => {
  const [papers, setPapers] = useState<Paper[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [sortBy, setSortBy] = useState<"latest" | "trending" | "discussed">(
    "trending",
  );
  const [showSurpriseMe, setShowSurpriseMe] = useState(false);

  useEffect(() => {
    loadPapers();
  }, [searchQuery, selectedField, sortBy]);

  const loadPapers = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getPapers({
        search: searchQuery,
        field: selectedField,
      });
      
      if (response.error) {
        console.error('Error loading papers:', response.error);
        setPapers([]);
        return;
      }
      
      if (response.data && Array.isArray(response.data)) {
        // Add mock engagement data and sort
        const enrichedPapers = response.data.map((paper) => ({
          ...paper,
          readCount: paper.readCount || Math.floor(Math.random() * 200) + 10,
          commentCount: paper.commentCount || Math.floor(Math.random() * 30) + 1,
        }));

        // Sort based on selected criteria
        let sortedPapers = [...enrichedPapers];
        switch (sortBy) {
          case "trending":
            sortedPapers.sort((a, b) => (b.readCount || 0) - (a.readCount || 0));
            break;
          case "discussed":
            sortedPapers.sort(
              (a, b) => (b.commentCount || 0) - (a.commentCount || 0),
            );
            break;
          case "latest":
          default:
            sortedPapers.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
            );
            break;
        }

        setPapers(sortedPapers);
      } else {
        setPapers([]);
      }
    } catch (error) {
      console.error('Exception loading papers:', error);
      setPapers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSurpriseMe = () => {
    setShowSurpriseMe(true);
    setSelectedField("");
    setSearchQuery("");
    setSortBy("trending");
    setTimeout(() => setShowSurpriseMe(false), 2000);
    loadPapers();
  };

  const researchFields = [
    "Computer Science",
    "Physics",
    "Biology",
    "Mathematics",
    "Chemistry",
    "Climate Science",
    "Neuroscience",
    "Psychology",
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header with Discovery Focus */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Discover Research Stories
          </h1>
          <p className="text-gray-600 text-base sm:text-lg">
            Every breakthrough has a story. What will inspire you today?
              </p>
              <div className="flex items-center space-x-2 mt-3 text-xs sm:text-sm text-indigo-600">
                <Lightbulb className="w-4 h-4 flex-shrink-0" />
                <span className="line-clamp-2">Each paper is presented as an engaging story with key insights and real-world impact</span>
              </div>
          </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 mb-6 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by keywords, topics, or questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-base min-h-[44px]"
              />
            </div>

            <div className="flex gap-3">
              <div className="relative flex-1 sm:flex-initial">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full sm:min-w-[160px] pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white text-base min-h-[44px]"
                >
                  <option value="">All Fields</option>
                  {researchFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </div>

              <button
                onClick={handleSurpriseMe}
                className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all sm:transform sm:hover:scale-105 min-h-[44px] whitespace-nowrap"
              >
                <Shuffle
                  className={`w-5 h-5 ${showSurpriseMe ? "animate-spin" : ""}`}
                />
                <span className="hidden sm:inline">Surprise Me!</span>
                <span className="sm:hidden">Surprise</span>
              </button>
            </div>
          </div>

          {/* Sort Options */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 mt-4 pt-4 border-t border-gray-100 gap-3 sm:gap-0">
            <span className="text-sm text-gray-600 font-medium">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              {[
                { key: "trending", label: "Trending", icon: TrendingUp },
                {
                  key: "discussed",
                  label: "Most Discussed",
                  icon: MessageCircle,
                },
                { key: "latest", label: "Latest", icon: Clock },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setSortBy(key as typeof sortBy)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all min-h-[44px] ${
                    sortBy === key
                      ? "bg-indigo-100 text-indigo-700 border border-indigo-200"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">
              Finding amazing research for you...
            </p>
          </div>
        ) : papers.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No papers found
            </h3>
            <p className="text-gray-500 mb-6">
              Try adjusting your search or explore different fields
            </p>
            <button
              onClick={handleSurpriseMe}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              <Shuffle className="w-5 h-5" />
              <span>Surprise Me with Random Research!</span>
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
                {searchQuery
                  ? `Results for "${searchQuery}"`
                  : selectedField
                    ? `${selectedField} Research`
                    : "All Research"}
                <span className="text-gray-500 font-normal ml-2 text-sm sm:text-base">
                  ({papers.length} papers)
                </span>
              </h2>

              {sortBy === "trending" && (
                <div className="flex items-center space-x-2 text-xs sm:text-sm text-indigo-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Hottest topics right now</span>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {papers.map((paper, index) => (
                <PaperCard
                  key={paper.id}
                  {...paper}
                  showEngagement={true}
                  rank={
                    sortBy === "trending" && index < 3 ? index + 1 : undefined
                  }
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default BrowsePapers;
