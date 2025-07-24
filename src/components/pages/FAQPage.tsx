
import React, { useState } from 'react'
import { ArrowLeft, ChevronDown, ChevronUp, Search, HelpCircle } from 'lucide-react'

interface FAQPageProps {
  onNavigate: (page: string) => void
}

export default function FAQPage({ onNavigate }: FAQPageProps) {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('all')

  const categories = ['all', 'getting-started', 'features', 'billing', 'collaboration', 'technical']

  const faqs = [
    {
      id: '1',
      category: 'getting-started',
      question: 'How do I get started with Journie?',
      answer: 'Getting started with Journie is easy! Simply sign up for a free account, complete your profile, and start creating your first research project. You can import existing notes and documents, or start fresh with our intuitive editor.'
    },
    {
      id: '2',
      category: 'getting-started',
      question: 'Is there a mobile app available?',
      answer: 'Currently, Journie is optimized for web browsers on desktop and mobile devices. We\'re working on dedicated mobile apps for iOS and Android, which will be available in the coming months.'
    },
    {
      id: '3',
      category: 'features',
      question: 'How does the AI-powered search work?',
      answer: 'Our AI-powered search uses natural language processing to understand your queries and find relevant content across all your research. It can find conceptually related content even when exact keywords don\'t match, making it easier to discover connections in your research.'
    },
    {
      id: '4',
      category: 'features',
      question: 'Can I export my data from Journie?',
      answer: 'Yes! You can export your data in multiple formats including PDF, Word, plain text, and structured formats like JSON. We believe in data portability and ensure you always have access to your research.'
    },
    {
      id: '5',
      category: 'features',
      question: 'How many citation styles does Journie support?',
      answer: 'Journie supports over 10,000 citation styles including APA, MLA, Chicago, Harvard, and many journal-specific formats. Our citation engine is powered by the Citation Style Language (CSL) standard.'
    },
    {
      id: '6',
      category: 'billing',
      question: 'Can I change my plan at any time?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Plan changes take effect immediately, and we\'ll prorate any charges or credits to your account.'
    },
    {
      id: '7',
      category: 'billing',
      question: 'Is there a free trial for paid plans?',
      answer: 'Yes, all paid plans come with a 14-day free trial. You can explore all premium features without any commitment. No credit card is required to start your trial.'
    },
    {
      id: '8',
      category: 'billing',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and for Enterprise customers, we can arrange invoicing and bank transfers.'
    },
    {
      id: '9',
      category: 'collaboration',
      question: 'How does team collaboration work?',
      answer: 'Team collaboration in Journie allows you to invite colleagues to projects, share notes and documents, collaborate in real-time, and manage permissions. You can leave comments, track changes, and maintain version history.'
    },
    {
      id: '10',
      category: 'collaboration',
      question: 'Can I control who sees what in my research?',
      answer: 'Yes, Journie has granular permission controls. You can set different access levels for team members, share specific projects or notes, and control whether collaborators can view, comment, or edit your research.'
    },
    {
      id: '11',
      category: 'technical',
      question: 'Is my data secure and private?',
      answer: 'Security and privacy are our top priorities. We use enterprise-grade encryption for data in transit and at rest, regular security audits, and comply with GDPR and other privacy regulations. Your research data is never shared with third parties.'
    },
    {
      id: '12',
      category: 'technical',
      question: 'How do you handle data backups?',
      answer: 'We automatically backup all your data multiple times per day across geographically distributed servers. We also maintain version history for your documents, so you can recover previous versions if needed.'
    },
    {
      id: '13',
      category: 'technical',
      question: 'What file formats can I upload?',
      answer: 'You can upload a wide variety of file formats including PDF, Word documents, PowerPoint presentations, images (JPG, PNG, GIF), plain text files, and more. We\'re continuously adding support for additional formats.'
    },
    {
      id: '14',
      category: 'features',
      question: 'Can I integrate Journie with other tools?',
      answer: 'Yes! Journie integrates with popular tools like Zotero, Mendeley, Google Drive, Dropbox, and many academic databases. We also offer API access for custom integrations in our Enterprise plans.'
    },
    {
      id: '15',
      category: 'getting-started',
      question: 'How do I import my existing research?',
      answer: 'You can import research from various sources using our import tools. We support importing from reference managers like Zotero and Mendeley, cloud storage services, and direct file uploads. We also provide migration assistance for Enterprise customers.'
    }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems)
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id)
    } else {
      newOpenItems.add(id)
    }
    setOpenItems(newOpenItems)
  }

  const formatCategory = (category: string) => {
    return category.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
            <div className="flex justify-center mb-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <HelpCircle className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-gray-600">
              Find answers to common questions about Journie
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="mb-8">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search FAQs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                {formatCategory(category)}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
              <button
                onClick={() => toggleItem(faq.id)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-medium text-gray-900 pr-4">{faq.question}</span>
                {openItems.has(faq.id) ? (
                  <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                )}
              </button>
              
              {openItems.has(faq.id) && (
                <div className="px-6 pb-4">
                  <div className="pt-2 border-t border-gray-100">
                    <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredFAQs.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No FAQs found matching your search.</p>
          </div>
        )}

        {/* Contact Section */}
        <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
          <p className="mb-6 max-w-2xl mx-auto">
            Can't find the answer you're looking for? Our support team is here to help you get the most out of Journie.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
