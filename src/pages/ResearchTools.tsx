import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface Tool {
  id: string;
  name: string;
  description: string;
  category: string;
  isPremium: boolean;
  icon: string;
}

interface ToolResult {
  result: string | object;
}

export function ResearchTools() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [toolInput, setToolInput] = useState('');
  const [toolResult, setToolResult] = useState<ToolResult | null>(null);
  const [processingTool, setProcessingTool] = useState(false);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    // Simulate fetching tools
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleUseTool = async (tool: Tool) => {
    setProcessingTool(true);
    setToolResult(null); // Clear previous results
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      let result: ToolResult['result'];
      if (tool.id === '1') { // Citation Generator
        result = `Generated citation: ${toolInput} (Format: APA)`; // Placeholder
      } else if (tool.id === '3') { // Statistical Calculator
        result = {
          mean: 10.5,
          median: 10,
          mode: 9,
          stdDev: 2.1
        }; // Placeholder
      } else if (tool.id === '6') { // Data Visualizer
        result = `Visualization for: ${toolInput}`; // Placeholder
      }
      else {
        result = `Successfully used ${tool.name} with input: ${toolInput}`; // Generic response
      }

      setToolResult({ result });
    } catch (error) {
      console.error("Error using tool:", error);
      setToolResult({ result: "An error occurred while using the tool." });
    } finally {
      setProcessingTool(false);
    }
  };

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

        {/* Research Tools Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading tools...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.filter(tool => selectedCategory === 'all' || tool.category === selectedCategory).map(tool => (
              <div key={tool.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-3xl">🔧</div>
                  <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs">
                    {tool.category}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>

                <button 
                  onClick={() => {
                    setSelectedTool(tool);
                    setToolInput(''); // Clear input when a new tool is selected
                    setToolResult(null); // Clear results when a new tool is selected
                  }}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Use Tool
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tool Usage Modal */}
        {selectedTool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-semibold">{selectedTool.name}</h3>
                  <button 
                    onClick={() => {
                      setSelectedTool(null);
                      setToolInput('');
                      setToolResult(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Input
                    </label>
                    <textarea
                      value={toolInput}
                      onChange={(e) => setToolInput(e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={4}
                      placeholder={`Enter input for ${selectedTool.name}...`}
                    />
                  </div>

                  <button
                    onClick={() => handleUseTool(selectedTool)}
                    disabled={!toolInput.trim() || processingTool}
                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {processingTool ? 'Processing...' : 'Generate Result'}
                  </button>

                  {toolResult && (
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Result
                      </label>
                      <div className="p-4 bg-gray-50 rounded-md">
                        <pre className="whitespace-pre-wrap text-sm">
                          {typeof toolResult.result === 'string' ? toolResult.result : JSON.stringify(toolResult.result, null, 2)}
                        </pre>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

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