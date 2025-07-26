
import React, { useState, useEffect } from 'react'
import { Brain, ExternalLink, BookOpen, Users, TrendingUp } from 'lucide-react'

interface SmartRecommendationsProps {
  user: any
  pages: any[]
  projects: any[]
}

export default function SmartRecommendations({ user, pages, projects }: SmartRecommendationsProps) {
  const [recommendations, setRecommendations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    generateRecommendations()
  }, [pages, projects])

  const generateRecommendations = async () => {
    setLoading(true)
    
    // Simulate AI-powered recommendations based on user activity
    const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}')
    const interests = userProfile.profile?.interests || []
    
    // Mock recommendations based on user's work and interests
    const mockRecommendations = [
      {
        type: 'paper',
        title: 'Recent breakthrough in ' + (interests[0] || 'artificial intelligence'),
        description: 'This paper presents novel findings that align with your research interests.',
        confidence: 0.92,
        source: 'Nature',
        url: '#',
        reason: 'Based on your recent notes about machine learning applications'
      },
      {
        type: 'collaboration',
        title: 'Potential collaboration opportunity',
        description: 'Dr. Sarah Chen is working on similar projects in your area.',
        confidence: 0.85,
        source: 'Academic Network',
        url: '#',
        reason: 'Based on shared research interests and recent publications'
      },
      {
        type: 'trend',
        title: 'Emerging trend in ' + (interests[1] || 'data science'),
        description: 'This research area is gaining momentum and could impact your work.',
        confidence: 0.78,
        source: 'Research Trends',
        url: '#',
        reason: 'Based on publication patterns and citation growth'
      },
      {
        type: 'resource',
        title: 'Relevant dataset for your research',
        description: 'New open dataset that could enhance your current project.',
        confidence: 0.88,
        source: 'Open Data Portal',
        url: '#',
        reason: 'Based on your project keywords and methodology'
      }
    ]

    // Simulate API delay
    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setLoading(false)
    }, 1500)
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'paper': return BookOpen
      case 'collaboration': return Users
      case 'trend': return TrendingUp
      case 'resource': return ExternalLink
      default: return Brain
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'paper': return 'bg-blue-100 text-blue-800'
      case 'collaboration': return 'bg-green-100 text-green-800'
      case 'trend': return 'bg-purple-100 text-purple-800'
      case 'resource': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Brain className="w-5 h-5 text-purple-600 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">AI Recommendations</h3>
        </div>
        <button
          onClick={generateRecommendations}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Refresh
        </button>
      </div>

      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const Icon = getIcon(rec.type)
          return (
            <div key={index} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center">
                  <Icon className="w-4 h-4 text-gray-600 mr-2 mt-0.5" />
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(rec.type)}`}>
                    {rec.type}
                  </span>
                </div>
                <div className="flex items-center text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-1"></div>
                  {Math.round(rec.confidence * 100)}% match
                </div>
              </div>
              
              <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{rec.description}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Source: {rec.source}</span>
                <button className="text-blue-600 hover:text-blue-700 flex items-center">
                  View <ExternalLink className="w-3 h-3 ml-1" />
                </button>
              </div>
              
              <div className="mt-2 p-2 bg-blue-50 rounded text-xs text-blue-700">
                💡 {rec.reason}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 text-center">
        <button className="text-sm text-gray-500 hover:text-gray-700">
          See all recommendations
        </button>
      </div>
    </div>
  )
}
