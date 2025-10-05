
import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Search, BookOpen, Users, Shield, Zap } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

const FAQ: React.FC = () => {
  const [openItems, setOpenItems] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const faqItems: FAQItem[] = [
    {
      id: '1',
      category: 'general',
      question: 'What is Mars\' Hill?',
      answer: 'Mars\' Hill is a revolutionary way to discover, understand, and engage with scientific research. We transform complex academic papers into interactive stories that make research accessible to everyone, from students to experts.'
    },
    {
      id: '2',
      category: 'general',
      question: 'How do research stories work?',
      answer: 'Research stories are multi-level explanations of scientific papers. Each story adapts the content for different audiences - from elementary explanations to expert-level details. This makes research accessible to everyone regardless of their background.'
    },
    {
      id: '3',
      category: 'features',
      question: 'What are Knowledge Quests?',
      answer: 'Knowledge Quests are gamified learning experiences that guide you through research topics. You earn XP, unlock achievements, and level up as you explore different fields and engage with content.'
    },
    {
      id: '4',
      category: 'features',
      question: 'Can I create visual abstracts?',
      answer: 'Yes! Our Visual Abstract Builder lets you create engaging visual summaries of research papers using drag-and-drop elements, diagrams, and interactive components.'
    },
    {
      id: '5',
      category: 'account',
      question: 'How do I create an account?',
      answer: 'Click the "Join Community" button and provide your email, password, and name. You can start exploring research immediately after registration.'
    },
    {
      id: '6',
      category: 'account',
      question: 'Can I publish my own research?',
      answer: 'Absolutely! Once you have an account, you can use our workspace to write, edit, and publish your research papers. Our tools help you create both traditional papers and interactive research stories.'
    },
    {
      id: '7',
      category: 'collaboration',
      question: 'How does peer review work?',
      answer: 'Our platform supports both traditional peer review and open community review. Authors can choose their preferred review process, and reviewers can provide detailed feedback through our commenting and annotation system.'
    },
    {
      id: '8',
      category: 'collaboration',
      question: 'Can I collaborate with other researchers?',
      answer: 'Yes! Our platform includes collaboration tools for real-time editing, discussions, and shared workspaces. You can invite colleagues to collaborate on papers and research projects.'
    },
    {
      id: '9',
      category: 'technical',
      question: 'Is the platform free to use?',
      answer: 'Yes, our core features are free for all users. This includes reading research stories, basic commenting, and creating an account. Premium features for advanced analytics and collaboration tools are available for researchers and institutions.'
    },
    {
      id: '10',
      category: 'technical',
      question: 'How do you ensure research quality?',
      answer: 'We maintain research quality through peer review, community moderation, and verification processes. All published research goes through our quality assurance pipeline before being made available to the community.'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Questions', icon: BookOpen },
    { id: 'general', name: 'General', icon: Users },
    { id: 'features', name: 'Features', icon: Zap },
    { id: 'account', name: 'Account', icon: Shield },
    { id: 'collaboration', name: 'Collaboration', icon: Users },
    { id: 'technical', name: 'Technical', icon: BookOpen }
  ];

  const toggleItem = (id: string) => {
    const newOpenItems = new Set(openItems);
    if (newOpenItems.has(id)) {
      newOpenItems.delete(id);
    } else {
      newOpenItems.add(id);
    }
    setOpenItems(newOpenItems);
  };

  const filteredItems = faqItems.filter(item => {
    const matchesSearch = item.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Navbar />
      
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find answers to common questions about our research platform and features.
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {categories.map(category => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                  selectedCategory === category.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{category.name}</span>
              </button>
            );
          })}
        </div>

        {/* FAQ Items */}
        <div className="max-w-4xl mx-auto">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No questions found matching your search.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map(item => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-all"
                  >
                    <h3 className="font-medium text-gray-900 pr-4">{item.question}</h3>
                    {openItems.has(item.id) ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  
                  {openItems.has(item.id) && (
                    <div className="px-6 pb-4">
                      <div className="border-t border-gray-100 pt-4">
                        <p className="text-gray-600 leading-relaxed">{item.answer}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-4">Still have questions?</h2>
            <p className="text-lg opacity-90 mb-6">
              Can't find what you're looking for? Our team is here to help.
            </p>
            <a
              href="/contact"
              className="inline-block bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all"
            >
              Contact Support
            </a>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FAQ;
