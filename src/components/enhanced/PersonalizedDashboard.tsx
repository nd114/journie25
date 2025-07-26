
import React from 'react'
import { TrendingUp, BookOpen, Target, Users, Clock, Zap } from 'lucide-react'

interface PersonalizedDashboardProps {
  user: any
}

export default function PersonalizedDashboard({ user }: PersonalizedDashboardProps) {
  // Get user profile from localStorage for demo
  const userProfile = JSON.parse(localStorage.getItem('user_profile') || '{}')
  const profile = userProfile.profile || {}

  const getPersonalizedContent = () => {
    const interests = profile.interests || []
    const role = profile.role || 'Researcher'
    
    return {
      suggestedTopics: interests.slice(0, 3),
      roleSpecificFeatures: getRoleFeatures(role),
      personalizedTips: getPersonalizedTips(interests, role)
    }
  }

  const getRoleFeatures = (role: string) => {
    const features = {
      'Student': [
        { title: 'Assignment Tracker', description: 'Keep track of research assignments and deadlines' },
        { title: 'Study Groups', description: 'Connect with classmates for collaborative learning' },
        { title: 'Citation Helper', description: 'Get help with academic citation formats' }
      ],
      'Professor': [
        { title: 'Lecture Planning', description: 'Organize research materials for teaching' },
        { title: 'Grant Applications', description: 'Track funding opportunities and applications' },
        { title: 'Student Progress', description: 'Monitor advisee research progress' }
      ],
      'Doctor': [
        { title: 'Medical Literature', description: 'Access latest medical research and studies' },
        { title: 'Case Studies', description: 'Document and analyze patient cases' },
        { title: 'Clinical Trials', description: 'Track ongoing and relevant clinical trials' }
      ],
      'default': [
        { title: 'Research Organization', description: 'Organize your research materials efficiently' },
        { title: 'Collaboration Tools', description: 'Work with teams and share findings' },
        { title: 'Citation Management', description: 'Manage and format citations properly' }
      ]
    }
    
    return features[role] || features.default
  }

  const getPersonalizedTips = (interests: string[], role: string) => {
    const tips = [
      `As a ${role}, consider using our citation management tools for better organization.`,
      `Based on your interest in ${interests[0] || 'research'}, we recommend exploring our advanced search features.`,
      'Pro tip: Use tags to categorize your research notes for easy retrieval.',
      'Set up project templates for recurring research workflows.'
    ]
    
    return tips.slice(0, 2)
  }

  const content = getPersonalizedContent()

  if (!profile.onboardingCompleted) {
    return null
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back{profile.role ? `, ${profile.role}` : ''}!
        </h2>
        <p className="text-blue-100">
          Ready to continue your research in {content.suggestedTopics.join(', ') || 'your field'}?
        </p>
      </div>

      {/* Personalized Suggestions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Role-specific Features */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Zap className="w-5 h-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Recommended for You</h3>
          </div>
          <div className="space-y-3">
            {content.roleSpecificFeatures.map((feature, index) => (
              <div key={index} className="border-l-2 border-blue-200 pl-3">
                <h4 className="font-medium text-gray-900">{feature.title}</h4>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Goals Progress */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <Target className="w-5 h-5 text-green-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>
          </div>
          <div className="space-y-3">
            {(profile.goals || []).slice(0, 3).map((goal: string, index: number) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm text-gray-700">{goal}</span>
                <div className="w-16 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${Math.random() * 60 + 20}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Personalized Tips */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
        <div className="flex items-center mb-2">
          <BookOpen className="w-5 h-5 text-yellow-600 mr-2" />
          <h3 className="font-semibold text-gray-900">Personalized Tips</h3>
        </div>
        <ul className="space-y-1">
          {content.personalizedTips.map((tip, index) => (
            <li key={index} className="text-sm text-gray-700">• {tip}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
