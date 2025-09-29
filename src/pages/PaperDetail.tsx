
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, User } from "lucide-react";
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
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
          <p className="text-center text-gray-500">Paper not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate("/library")}
          className="flex items-center space-x-2 text-indigo-600 hover:text-indigo-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Library</span>
        </button>

        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {paper.title}
          </h1>

          <div className="flex items-center space-x-6 text-sm text-gray-500 mb-6">
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>{paper.authors?.join(", ") || "Unknown Author"}</span>
            </div>
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>{new Date(paper.createdAt).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Abstract
            </h2>
            <p className="text-gray-700 leading-relaxed">{paper.abstract}</p>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Content
            </h2>
            <div className="prose max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
              {paper.content}
            </div>
          </div>
        </div>

        <CommentThread comments={comments} onAddComment={handleAddComment} />
      </div>
    </div>
  );
};

export default PaperDetail;
