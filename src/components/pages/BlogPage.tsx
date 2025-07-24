
import React, { useState } from 'react'
import { ArrowLeft, Calendar, User, Tag, ArrowRight, Search } from 'lucide-react'

interface BlogPageProps {
  onNavigate: (page: string) => void
}

export default function BlogPage({ onNavigate }: BlogPageProps) {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const categories = ['all', 'research-tips', 'product-updates', 'academic-insights', 'tutorials']
  
  const posts = [
    {
      id: '1',
      title: '10 Essential Research Organization Tips for Academic Success',
      excerpt: 'Discover proven strategies to organize your research workflow and boost productivity with these expert-recommended techniques.',
      author: 'Dr. Sarah Chen',
      date: '2024-01-15',
      category: 'research-tips',
      readTime: '5 min read',
      image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=200&fit=crop'
    },
    {
      id: '2',
      title: 'Introducing AI-Powered Citation Management',
      excerpt: 'We\'re excited to announce our new AI-powered citation tool that automatically formats references in over 10,000 citation styles.',
      author: 'Journie Team',
      date: '2024-01-10',
      category: 'product-updates',
      readTime: '3 min read',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=200&fit=crop'
    },
    {
      id: '3',
      title: 'The Future of Collaborative Research: Trends for 2024',
      excerpt: 'Explore the latest trends in collaborative research and how digital tools are transforming academic partnerships worldwide.',
      author: 'Prof. Michael Rodriguez',
      date: '2024-01-08',
      category: 'academic-insights',
      readTime: '7 min read',
      image: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=200&fit=crop'
    },
    {
      id: '4',
      title: 'Getting Started with Journie: A Complete Beginner\'s Guide',
      excerpt: 'New to Journie? This comprehensive guide will walk you through setting up your research workspace and optimizing your workflow.',
      author: 'Alex Thompson',
      date: '2024-01-05',
      category: 'tutorials',
      readTime: '10 min read',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop'
    },
    {
      id: '5',
      title: 'Best Practices for Digital Note-Taking in Academic Research',
      excerpt: 'Learn how to leverage digital tools for more effective note-taking, including tagging strategies and linking techniques.',
      author: 'Dr. Emma Wilson',
      date: '2024-01-03',
      category: 'research-tips',
      readTime: '6 min read',
      image: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=400&h=200&fit=crop'
    },
    {
      id: '6',
      title: 'Version 2.0 Release: Enhanced Collaboration Features',
      excerpt: 'Discover the new real-time collaboration tools, improved sharing options, and enhanced project management features in our latest update.',
      author: 'Journie Team',
      date: '2024-01-01',
      category: 'product-updates',
      readTime: '4 min read',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=200&fit=crop'
    }
  ]

  const filteredPosts = posts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const formatCategory = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-12">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Journie Blog</h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest research tips, product updates, and academic insights
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>
        </div>

        {/* Blog Posts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={post.image}
                  alt={post.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-4 text-sm text-gray-500 mb-3">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {new Date(post.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <User className="w-4 h-4 mr-1" />
                    {post.author}
                  </div>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    <Tag className="w-3 h-3 mr-1" />
                    {formatCategory(post.category)}
                  </span>
                  <span className="text-sm text-gray-500">{post.readTime}</span>
                </div>

                <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                  {post.title}
                </h2>
                
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {post.excerpt}
                </p>

                <button className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium">
                  Read More
                  <ArrowRight className="w-4 h-4 ml-2" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No articles found matching your criteria.</p>
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Stay Updated</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Subscribe to our newsletter to get the latest research tips, product updates, and academic insights delivered to your inbox.
          </p>
          <div className="flex max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-l-lg text-gray-900 focus:outline-none"
            />
            <button className="bg-blue-800 hover:bg-blue-900 px-6 py-2 rounded-r-lg font-medium transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
