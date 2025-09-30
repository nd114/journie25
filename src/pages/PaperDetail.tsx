
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Lightbulb, 
  Target, 
  Zap, 
  BookOpen, 
  Users, 
  Share2,
  Clock
} from "lucide-react";
import Navbar from "../components/Navbar";
import CommentThread from "../components/CommentThread";
import { apiClient } from "../services/apiClient";
import { useAuth } from "../contexts/AuthContext";

interface Paper {
  id: number;
  title: string;
  abstract: string;
  content: string;
  authors?: string[];
  createdAt: string;
  field?: string;
}

interface Comment {
  id: number;
  content: string;
  authorName: string;
  createdAt: string;
  parentId?: number;
}

const PaperDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [paper, setPaper] = useState<Paper | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPaper();
    loadComments();
  }, [id]);

  const loadPaper = async () => {
    if (!id) return;
    const response = await apiClient.getPaper(parseInt(id));
    if (response.data) {
      setPaper(response.data);
    }
    setLoading(false);
  };

  const loadComments = async () => {
    if (!id) return;
    const response = await apiClient.getComments(parseInt(id));
    if (response.data) {
      setComments(response.data);
    }
  };

  const handleAddComment = async (content: string, parentId?: number) => {
    if (!id || !user) {
      navigate("/auth");
      return;
    }

    const response = await apiClient.createComment(
      parseInt(id),
      content,
      parentId,
    );
    if (response.data) {
      loadComments();
    }
  };

  // Extract key insights and real-world applications
  const getKeyInsights = (abstract: string) => {
    const sentences = abstract.split('.').filter(s => s.trim().length > 20);
    return sentences.slice(0, 2).map(s => s.trim());
  };

  const getRealWorldImpact = (field?: string) => {
    const impacts = {
      'Computer Science': 'This research could improve software we use daily, making technology more efficient and user-friendly.',
      'AI & Machine Learning': 'These findings might enhance AI systems in healthcare, education, and automation.',
      'Climate Science': 'This work could inform policy decisions and help develop solutions for climate change.',
      'Neuroscience': 'These insights may lead to better treatments for neurological disorders and mental health.',
      'Physics': 'This research could advance our understanding of the universe and enable new technologies.',
      'Biology': 'These discoveries might lead to new medical treatments and drug development.',
      'Space Exploration': 'This work could support future space missions and our understanding of the cosmos.',
      'Biotechnology': 'These findings may revolutionize medicine, agriculture, and environmental solutions.',
      'Quantum Physics': 'This research could enable quantum computers and secure communication systems.'
    };
    return impacts[field as keyof typeof impacts] || 'This research opens new possibilities for scientific advancement and practical applications.';
  };

  const estimatedReadTime = paper ? Math.max(5, Math.ceil(paper.content.length / 1000)) : 5;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">Loading research story...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!paper) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <p className="text-center text-gray-500">Research not found</p>
        </div>
      </div>
    );
  }

  const keyInsights = getKeyInsights(paper.abstract);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/library")}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Discovery</span>
        </button>

        {/* Story Header */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6 relative overflow-hidden">
          {/* Story Badge */}
          <div className="flex items-center space-x-2 mb-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-sm font-bold rounded-full">
              <Lightbulb className="w-4 h-4" />
              <span>Research Story</span>
            </div>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{estimatedReadTime} min read</span>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6 leading-tight">
            {paper.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-8">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{paper.authors?.join(", ") || "Unknown Author"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
            </div>
            {paper.field && (
              <span className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md font-medium">
                {paper.field}
              </span>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 mb-8">
            <button className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              <BookOpen className="w-4 h-4" />
              <span>Save for Later</span>
            </button>
          </div>

          {/* Key Insights Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Zap className="w-5 h-5 text-yellow-500" />
              <h2 className="text-xl font-bold text-gray-900">Key Insights</h2>
            </div>
            <div className="space-y-3">
              {keyInsights.map((insight, index) => (
                <div key={index} className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-300">
                  <p className="text-gray-700 leading-relaxed">{insight}.</p>
                </div>
              ))}
            </div>
          </div>

          {/* Why This Matters Section */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 mb-4">
              <Target className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-bold text-gray-900">Why This Matters</h2>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-300">
              <p className="text-gray-700 leading-relaxed">
                {getRealWorldImpact(paper.field)}
              </p>
            </div>
          </div>

          {/* Abstract Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">The Research Story</h2>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-gray-700 leading-relaxed text-lg">{paper.abstract}</p>
            </div>
          </div>
        </div>

        {/* Full Content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-6">
          <div className="flex items-center space-x-2 mb-6">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Deep Dive</h2>
            <span className="text-sm text-gray-500">({estimatedReadTime} min read)</span>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
            <div className="whitespace-pre-wrap">
              {paper.content}
            </div>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-6">
            <Users className="w-5 h-5 text-purple-600" />
            <h2 className="text-2xl font-bold text-gray-900">Join the Discussion</h2>
            <span className="text-sm text-gray-500">({comments.length} comments)</span>
          </div>

          <CommentThread comments={comments} onAddComment={handleAddComment} />
        </div>
      </div>
    </div>
  );
    </div>
  );
};

export default PaperDetail;
