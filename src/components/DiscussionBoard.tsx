import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  Plus,
  Search,
  Heart,
  MessageCircle,
  Clock,
  User,
  Pin,
  Tag,
  Filter,
  TrendingUp,
  Users,
} from "lucide-react";

interface DiscussionPost {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  category: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  likes: number;
  replies: number;
  isPinned: boolean;
  isLiked: boolean;
}

interface DiscussionBoardProps {
  onNavigate: (view: string, id?: string) => void;
  currentUser?: {
    id: string;
    name: string;
    avatar?: string;
  };
}

export default function DiscussionBoard({
  onNavigate,
  currentUser,
}: DiscussionBoardProps) {
  const [posts, setPosts] = useState<DiscussionPost[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recent" | "popular" | "trending">(
    "recent",
  );
  const [showNewPost, setShowNewPost] = useState(false);
  const [newPostTitle, setNewPostTitle] = useState("");
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostCategory, setNewPostCategory] = useState("general");
  const [newPostTags, setNewPostTags] = useState("");
  const [showComments, setShowComments] = useState<{ [key: string]: boolean }>(
    {},
  );
  const [comments, setComments] = useState<{ [key: string]: any[] }>({});
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({});
  const [newDiscussion, setNewDiscussion] = useState({
    title: "",
    content: "",
    category: "general",
  });
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [replies, setReplies] = useState<{ [key: string]: any[] }>({});

  const categories = [
    { id: "all", name: "All Discussions", icon: MessageSquare },
    { id: "research-methods", name: "Research Methods", icon: TrendingUp },
    { id: "literature-review", name: "Literature Review", icon: MessageSquare },
    { id: "data-analysis", name: "Data Analysis", icon: TrendingUp },
    { id: "collaboration", name: "Collaboration", icon: Users },
    { id: "tools-resources", name: "Tools & Resources", icon: MessageSquare },
    { id: "general", name: "General Discussion", icon: MessageCircle },
  ];

  // Mock data
  useEffect(() => {
    const mockPosts: DiscussionPost[] = [
      {
        id: "1",
        title: "Best practices for systematic literature reviews",
        content:
          "I'm starting a systematic literature review for my research on climate change adaptation. What are the most effective strategies for organizing and analyzing a large corpus of papers?",
        author: { id: "1", name: "Dr. Sarah Chen" },
        category: "literature-review",
        tags: ["systematic-review", "methodology", "climate-change"],
        createdAt: new Date(2024, 0, 15),
        updatedAt: new Date(2024, 0, 15),
        likes: 24,
        replies: 8,
        isPinned: true,
        isLiked: false,
      },
      {
        id: "2",
        title: "Collaborative research tools recommendations",
        content:
          "Our research team is distributed across different universities. What tools do you recommend for collaborative research, especially for document sharing and version control?",
        author: { id: "2", name: "Prof. Michael Rodriguez" },
        category: "collaboration",
        tags: ["collaboration", "tools", "remote-work"],
        createdAt: new Date(2024, 0, 14),
        updatedAt: new Date(2024, 0, 14),
        likes: 18,
        replies: 12,
        isPinned: false,
        isLiked: true,
      },
      {
        id: "3",
        title: "Statistical analysis software comparison",
        content:
          "I'm comparing R, Python, and SPSS for my quantitative research. What are the pros and cons of each for different types of statistical analysis?",
        author: { id: "3", name: "Alex Thompson" },
        category: "data-analysis",
        tags: ["statistics", "software", "quantitative-research"],
        createdAt: new Date(2024, 0, 13),
        updatedAt: new Date(2024, 0, 13),
        likes: 31,
        replies: 15,
        isPinned: false,
        isLiked: false,
      },
    ];
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesCategory =
      selectedCategory === "all" || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const sortedPosts = [...filteredPosts].sort((a, b) => {
    switch (sortBy) {
      case "popular":
        return b.likes - a.likes;
      case "trending":
        return b.likes + b.replies - (a.likes + a.replies);
      case "recent":
      default:
        return b.updatedAt.getTime() - a.updatedAt.getTime();
    }
  });

  const handleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60),
    );

    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const createNewPost = () => {
    if (!newPostTitle.trim() || !newPostContent.trim() || !currentUser) return;

    const newPost: DiscussionPost = {
      id: Date.now().toString(),
      title: newPostTitle,
      content: newPostContent,
      author: currentUser,
      category: newPostCategory,
      tags: newPostTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag),
      createdAt: new Date(),
      updatedAt: new Date(),
      likes: 0,
      replies: 0,
      isPinned: false,
      isLiked: false,
    };

    setPosts((prev) => [newPost, ...prev]);
    setNewPostTitle("");
    setNewPostContent("");
    setNewPostTags("");
    setShowNewPost(false);
  };

  const toggleComments = (postId: string) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));

    // Initialize comments for this post if not already done
    if (!comments[postId]) {
      setComments((prev) => ({ ...prev, [postId]: [] }));
    }
  };

  const addComment = (postId: string) => {
    const commentText = newComment[postId];
    if (!commentText?.trim() || !currentUser) return;

    const comment = {
      id: Date.now().toString(),
      content: commentText,
      author: currentUser,
      createdAt: new Date(),
      likes: 0,
      isLiked: false,
    };

    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), comment],
    }));

    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, replies: post.replies + 1 } : post,
      ),
    );

    setNewComment((prev) => ({ ...prev, [postId]: "" }));
  };

  const createDiscussion = () => {
    if (newDiscussion.title.trim() && newDiscussion.content.trim()) {
      const newPost = {
        id: Date.now().toString(),
        title: newDiscussion.title,
        content: newDiscussion.content,
        author: {
          id: currentUser?.id || "1",
          name: currentUser?.name || "Current User",
        },
        category: newDiscussion.category,
        tags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        likes: 0,
        replies: 0,
        isPinned: false,
        isLiked: false,
      };
      setPosts([newPost, ...posts]);
      setNewDiscussion({ title: "", content: "", category: "general" });
      setShowNewDiscussionModal(false);
    }
  };

  const submitReply = (postId: string) => {
    if (replyContent.trim()) {
      const newReply = {
        id: Date.now().toString(),
        content: replyContent,
        author: {
          id: currentUser?.id || "1",
          name: currentUser?.name || "Current User",
        },
        createdAt: new Date(),
        likes: 0,
        isLiked: false,
      };

      setReplies((prev) => ({
        ...prev,
        [postId]: [...(prev[postId] || []), newReply],
      }));

      // Update reply count
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, replies: post.replies + 1 } : post,
        ),
      );

      setReplyContent("");
      setReplyingTo(null);
    }
  };

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post,
      ),
    );
  };

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Research Community
            </h1>
            <p className="text-gray-600 mt-1">
              Connect, discuss, and collaborate with fellow researchers
            </p>
          </div>
          <button
            onClick={() => setShowNewPost(true)}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Discussion
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search discussions, topics, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="recent">Most Recent</option>
            <option value="popular">Most Liked</option>
            <option value="trending">Trending</option>
          </select>
        </div>
      </div>

      <div className="flex">
        {/* Categories Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
          <div className="space-y-1">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    selectedCategory === category.id
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{category.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Posts List */}
        <div className="flex-1 p-6">
          <div className="space-y-4">
            {sortedPosts.map((post) => (
              <div
                key={post.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {post.isPinned && (
                        <Pin className="w-4 h-4 text-green-600" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer">
                        {post.title}
                      </h3>
                    </div>

                    <p className="text-gray-600 mb-3 line-clamp-2">
                      {post.content}
                    </p>

                    <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                      <div className="flex items-center space-x-1">
                        <User className="w-4 h-4" />
                        <span>{post.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{getTimeAgo(post.createdAt)}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {post.tags.map((tag) => (
                          <span
                            key={tag}
                            className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                          >
                            <Tag className="w-3 h-3 mr-1" />
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleLike(post.id)}
                          className={`flex items-center space-x-1 text-sm transition-colors ${
                            post.isLiked
                              ? "text-red-600"
                              : "text-gray-500 hover:text-red-600"
                          }`}
                        >
                          <Heart
                            className={`w-4 h-4 ${post.isLiked ? "fill-current" : ""}`}
                          />
                          <span>{post.likes}</span>
                        </button>

                        <button
                          onClick={() => toggleComments(post.id)}
                          className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600"
                        >
                          <MessageCircle className="w-4 h-4" />
                          <span>{post.replies} replies</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {showComments[post.id] && (
                  <div className="mt-4 border-t pt-4">
                    <div className="space-y-3">
                      {comments[post.id]?.map((comment) => (
                        <div key={comment.id} className="flex space-x-3">
                          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                            <User className="w-4 h-4 text-gray-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-medium text-sm">
                                {comment.author.name}
                              </span>
                              <span className="text-xs text-gray-500">
                                {getTimeAgo(comment.createdAt)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mt-1">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Comment */}
                    {currentUser && (
                      <div className="mt-4 flex space-x-3">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            value={newComment[post.id] || ""}
                            onChange={(e) =>
                              setNewComment((prev) => ({
                                ...prev,
                                [post.id]: e.target.value,
                              }))
                            }
                            placeholder="Add a comment..."
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) =>
                              e.key === "Enter" && addComment(post.id)
                            }
                          />
                          <button
                            onClick={() => addComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* New Post Modal */}
      {showNewPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Start a New Discussion</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title
                </label>
                <input
                  type="text"
                  value={newPostTitle}
                  onChange={(e) => setNewPostTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter discussion title..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  value={newPostCategory}
                  onChange={(e) => setNewPostCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {categories
                    .filter((cat) => cat.id !== "all")
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What would you like to discuss?"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={newPostTags}
                  onChange={(e) => setNewPostTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="research, methodology, collaboration..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowNewPost(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={createNewPost}
                disabled={!newPostTitle.trim() || !newPostContent.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Post Discussion
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
