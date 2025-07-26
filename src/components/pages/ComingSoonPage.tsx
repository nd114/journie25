
import React from 'react'
import { ArrowLeft, Zap, Brain, Globe, Users, Smartphone, Cloud, Shield, Sparkles } from 'lucide-react'

interface ComingSoonPageProps {
  onNavigate: (page: string) => void
}

export default function ComingSoonPage({ onNavigate }: ComingSoonPageProps) {
  const features = [
    {
      icon: Brain,
      title: 'Advanced AI Research Assistant',
      description: 'AI that can read, understand, and synthesize research papers to provide intelligent insights and connections.',
      timeline: 'Q2 2024',
      priority: 'high'
    },
    {
      icon: Globe,
      title: 'Multi-language Support',
      description: 'Research and collaborate in over 50 languages with real-time translation and localization.',
      timeline: 'Q3 2024',
      priority: 'medium'
    },
    {
      icon: Smartphone,
      title: 'Mobile Apps',
      description: 'Native iOS and Android apps for research on the go with offline sync capabilities.',
      timeline: 'Q3 2024',
      priority: 'high'
    },
    {
      icon: Users,
      title: 'Academic Institution Integration',
      description: 'Direct integration with university systems, library databases, and institutional repositories.',
      timeline: 'Q4 2024',
      priority: 'high'
    },
    {
      icon: Zap,
      title: 'Smart Literature Review',
      description: 'Automated literature review generation using AI to identify key papers and research gaps.',
      timeline: 'Q1 2025',
      priority: 'high'
    },
    {
      icon: Cloud,
      title: 'Advanced Analytics Dashboard',
      description: 'Research impact metrics, collaboration analytics, and productivity insights with beautiful visualizations.',
      timeline: 'Q2 2025',
      priority: 'medium'
    },
    {
      icon: Shield,
      title: 'Blockchain Research Verification',
      description: 'Immutable research timestamping and verification system for academic integrity.',
      timeline: 'Q3 2025',
      priority: 'low'
    },
    {
      icon: Sparkles,
      title: 'Virtual Reality Research Spaces',
      description: '3D collaborative research environments for immersive data exploration and team meetings.',
      timeline: 'Q4 2025',
      priority: 'low'
    },
    {
      icon: Brain,
      title: 'Predictive Research Trends',
      description: 'AI-powered predictions of emerging research trends and potential breakthrough areas.',
      timeline: 'Q1 2026',
      priority: 'medium'
    }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Coming Soon</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're constantly working to bring you the most advanced research tools. 
              Here's what's coming to the Journie platform in the near future.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Timeline Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Feature Roadmap</h2>
          <p className="text-gray-600">
            Our development timeline for upcoming features and enhancements
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(feature.priority)}`}>
                    {feature.priority.charAt(0).toUpperCase() + feature.priority.slice(1)} Priority
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                
                <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                  {feature.description}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-600">
                    Expected: {feature.timeline}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Newsletter Signup */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Stay Updated
          </h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Be the first to know when new features are released. Join our newsletter for 
            exclusive updates, beta access, and research productivity tips.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-50 transition-colors">
              Subscribe
            </button>
          </div>
        </div>

        {/* Development Philosophy */}
        <div className="mt-16 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Our Development Philosophy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">User-Driven</h4>
              <p className="text-gray-600 text-sm">
                Every feature is built based on real user feedback and research needs.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Innovation First</h4>
              <p className="text-gray-600 text-sm">
                We leverage cutting-edge technology to solve real research challenges.
              </p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-orange-600" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Privacy & Security</h4>
              <p className="text-gray-600 text-sm">
                Your research data is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
