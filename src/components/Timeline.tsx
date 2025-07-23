
import React, { useState, useEffect } from 'react'
import { 
  Heart,
  MessageCircle,
  Share,
  Bookmark,
  User,
  Clock,
  FileText,
  BookOpen,
  Quote,
  Lightbulb,
  TrendingUp,
  Users,
  Globe
} from 'lucide-react'

interface TimelineItem {
  id: string
  type: 'discussion' | 'research' | 'paper' | 'note' | 'collaboration'
  author: {
    id: string
    name: string
    avatar?: string
    isFollowing?: boolean
  }
  content: {
    title: string
    description: string
    tags?: string[]
    attachments?: any[]
  }
  engagement: {
    likes: number
    comments: number
    shares: number
    isLiked: boolean
    isBookmarked: boolean
  }
  createdAt: Date
  category?: string
}

interface TimelineProps {
  onNavigate: (view: string, id?: string) => void
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export default function Timeline({ onNavigate, currentUser }: TimelineProps) {
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [filter, setFilter] = useState<'all' | 'following' | 'trending' | 'research'>('all')

  useEffect(() => {
    // Mock timeline data
    const mockItems: TimelineItem[] = [
      {
        id: '1',
        type: 'research',
        author: { id: '1', name: 'Dr. Sarah Chen', isFollowing: true },
        content: {
          title: 'Climate Change Adaptation Strategies in Urban Planning',
          description: 'New research findings on sustainable urban development and climate resilience...',
          tags: ['climate-change', 'urban-planning', 'sustainability']
        },
        engagement: { likes: 24, comments: 8, shares: 5, isLiked: false, isBookmarked: true },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        category: 'Environmental Science'
      },
      {
        id: '2',
        type: 'discussion',
        author: { id: '2', name: 'Prof. Michael Rodriguez', isFollowing: true },
        content: {
          title: 'Seeking collaboration on machine learning project',
          description: 'Looking for researchers with expertise in deep learning for healthcare applications...',
          tags: ['machine-learning', 'healthcare', 'collaboration']
        },
        engagement: { likes: 18, comments: 12, shares: 3, isLiked: true, isBookmarked: false },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        category: 'Computer Science'
      },
      {
        id: '3',
        type: 'paper',
        author: { id: '3', name: 'Dr. Emily Watson', isFollowing: false },
        content: {
          title: 'Published: Neural Networks in Medical Diagnosis',
          description: 'Our latest paper on improving diagnostic accuracy using AI has been published in Nature Medicine...',
          tags: ['neural-networks', 'medical-diagnosis', 'AI']
        },
        engagement: { likes: 45, comments: 15, shares: 22, isLiked: false, isBookmarked: false },
        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
        category: 'Medical Research'
      },
      {
        id: '4',
        type: 'note',
        author: { id: '4', name: 'Alex Thompson', isFollowing: true },
        content: {
          title: 'Research methodology insights',
          description: 'Sharing some key learnings from my systematic literature review process...',
          tags: ['methodology', 'literature-review', 'tips']
        },
        engagement: { likes: 12, comments: 6, shares: 2, isLiked: false, isBookmarked: true },
        createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
        category: 'Research Methods'
      }
    ]
    setTimelineItems(mockItems)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'research': return <Lightbulb className="w-5 h-5 text-yellow-500" />
      case 'discussion': return <MessageCircle className="w-5 h-5 text-blue-500" />
      case 'paper': return <FileText className="w-5 h-5 text-green-500" />
      case 'note': return <BookOpen className="w-5 h-5 text-purple-500" />
      case 'collaboration': return <Users className="w-5 h-5 text-orange-500" />
      default: return <Globe className="w-5 h-5 text-gray-500" />
    }
  }

  const handleLike = (itemId: string) => {
    setTimelineItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            engagement: {
              ...item.engagement,
              isLiked: !item.engagement.isLiked,
              likes: item.engagement.isLiked 
                ? item.engagement.likes - 1 
                : item.engagement.likes + 1
            }
          }
        : item
    ))
  }

  const handleBookmark = (itemId: string) => {
    setTimelineItems(prev => prev.map(item => 
      item.id === itemId 
        ? {
            ...item,
            engagement: {
              ...item.engagement,
              isBookmarked: !item.engagement.isBookmarked
            }
          }
        : item
    ))
  }

  const getTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`
    return date.toLocaleDateString()
  }

  const filteredItems = timelineItems.filter(item => {
    switch (filter) {
      case 'following': return item.author.isFollowing
      case 'trending': return item.engagement.likes > 20
      case 'research': return item.type === 'research' || item.type === 'paper'
      default: return true
    }
  })

  return (
    <div className="flex-1 bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Research Community</h1>
          <button
            onClick={() => onNavigate('work')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Work
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-4">
          {[
            { id: 'all', label: 'All Updates', icon: Globe },
            { id: 'following', label: 'Following', icon: Users },
            { id: 'trending', label: 'Trending', icon: TrendingUp },
            { id: 'research', label: 'Research', icon: Lightbulb }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setFilter(tab.id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                  filter === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto p-6">
        <div className="space-y-6">
          {filteredItems.map((item) => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-6">
              {/* Header */}
              <div className="flex items-start space-x-3 mb-4">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-gray-900">{item.author.name}</span>
                    {item.author.isFollowing && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Following</span>
                    )}
                    {getTypeIcon(item.type)}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    <span className="text-sm text-gray-500">{getTimeAgo(item.createdAt)}</span>
                    {item.category && (
                      <>
                        <span className="text-gray-300">•</span>
                        <span className="text-sm text-gray-500">{item.category}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.content.title}</h3>
                <p className="text-gray-700">{item.content.description}</p>
                
                {/* Tags */}
                {item.content.tags && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {item.content.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Engagement */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-6">
                  <button
                    onClick={() => handleLike(item.id)}
                    className={`flex items-center space-x-2 text-sm transition-colors ${
                      item.engagement.isLiked ? 'text-red-600' : 'text-gray-500 hover:text-red-600'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${item.engagement.isLiked ? 'fill-current' : ''}`} />
                    <span>{item.engagement.likes}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600">
                    <MessageCircle className="w-5 h-5" />
                    <span>{item.engagement.comments}</span>
                  </button>
                  
                  <button className="flex items-center space-x-2 text-sm text-gray-500 hover:text-green-600">
                    <Share className="w-5 h-5" />
                    <span>{item.engagement.shares}</span>
                  </button>
                </div>

                <button
                  onClick={() => handleBookmark(item.id)}
                  className={`p-2 rounded-lg transition-colors ${
                    item.engagement.isBookmarked 
                      ? 'text-yellow-600 bg-yellow-100' 
                      : 'text-gray-400 hover:text-yellow-600 hover:bg-yellow-100'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${item.engagement.isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
