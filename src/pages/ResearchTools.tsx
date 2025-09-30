
import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  icon: string;
}

export function ResearchTools() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const tools: Tool[] = [
    {
      id: '1',
      name: 'Citation Generator',
      description: 'Automatically generate citations in APA, MLA, Chicago, and other formats.',
      category: 'Writing',
      isPremium: false,
      icon: '📚'
    },
    {
      id: '2',
      name: 'Research Planner',
      description: 'Plan and track your research projects with timeline management.',
      category: 'Planning',
      isPremium: true,
      icon: '📅'
    },
    {
      id: '3',
      name: 'Statistical Calculator',
      description: 'Perform statistical analysis with our comprehensive calculator suite.',
      category: 'Analysis',
      isPremium: false,
      icon: '📊'
    },
    {
      id: '4',
      name: 'Literature Matrix',
      description: 'Organize and compare research papers in a structured matrix format.',
      category: 'Organization',
      isPremium: true,
      icon: '📋'
    },
    {
      id: '5',
      name: 'Methodology Builder',
      description: 'Step-by-step guide to building robust research methodologies.',
      category: 'Planning',
      isPremium: false,
      icon: '🔬'
    },
    {
      id: '6',
      name: 'Data Visualizer',
      description: 'Create compelling visualizations for your research data.',
      category: 'Analysis',
      isPremium: true,
      icon: '📈'
    }
  ];

  const categories = ['all', 'Writing', 'Planning', 'Analysis', 'Organization'];

  const filteredTools = selectedCategory === 'all' 
    ? tools 
    : tools.filter(tool => tool.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Research Tools</h1>
          <p className="text-lg text-gray-600">
            Powerful tools to streamline your research workflow and boost productivity.
          </p>
        </div>

        {/* Category Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                }`}
              >
                {category === 'all' ? 'All Tools' : category}
              </button>
            ))}
          </div>
        </div>

        {/* Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredTools.map(tool => (
            <div key={tool.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="text-4xl">{tool.icon}</div>
                {tool.isPremium && (
                  <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-medium">
                    Premium
                  </span>
                )}
              </div>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
              <p className="text-gray-600 mb-4">{tool.description}</p>
              
              <div className="flex items-center justify-between">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                  {tool.category}
                </span>
                <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors">
                  {tool.isPremium ? 'Try Premium' : 'Use Tool'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Featured Tool Section */}
        <div className="bg-gradient-to-r from-green-500 to-blue-600 rounded-lg p-8 text-white mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h2 className="text-3xl font-bold mb-4">AI Research Assistant</h2>
              <p className="text-green-100 mb-6">
                Our most advanced tool uses AI to help you find relevant papers, summarize content, and generate insights from your research.
              </p>
              <button className="bg-white text-green-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
                Try AI Assistant
              </button>
            </div>
            <div className="text-center">
              <div className="text-8xl mb-4">🤖</div>
              <p className="text-green-100">Powered by GPT-4</p>
            </div>
          </div>
        </div>

        {/* Tool Categories Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { name: 'Writing Tools', count: 8, icon: '✍️', color: 'bg-purple-100 text-purple-800' },
            { name: 'Analysis Tools', count: 6, icon: '📊', color: 'bg-blue-100 text-blue-800' },
            { name: 'Planning Tools', count: 5, icon: '📋', color: 'bg-green-100 text-green-800' },
            { name: 'Organization', count: 4, icon: '📂', color: 'bg-orange-100 text-orange-800' }
          ].map(category => (
            <div key={category.name} className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="text-3xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-gray-900 mb-2">{category.name}</h3>
              <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${category.color}`}>
                {category.count} tools
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
