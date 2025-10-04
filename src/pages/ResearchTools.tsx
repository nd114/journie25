import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Search, Calculator, FileText, BarChart3, Zap, Lock } from 'lucide-react';
import { apiClient } from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';

interface ResearchTool {
  id: number;
  name: string;
  description: string;
  category: string;
  icon: string;
  isPremium: boolean;
}

export function ResearchTools() {
  const { user } = useAuth();
  const [tools, setTools] = useState<ResearchTool[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTool, setSelectedTool] = useState<ResearchTool | null>(null);
  const [toolInput, setToolInput] = useState('');
  const [toolOutput, setToolOutput] = useState<any>(null);
  const [processingTool, setProcessingTool] = useState(false);

  useEffect(() => {
    loadTools();
  }, []);

  const loadTools = async () => {
    setLoading(true);
    try {
      const response = await apiClient.getResearchTools();
      if (response.data && Array.isArray(response.data)) {
        setTools(response.data);
      } else {
        setTools([]);
      }
    } catch (error) {
      console.error('Failed to load research tools:', error);
      setTools([]);
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      search: Search,
      calculator: Calculator,
      fileText: FileText,
      barChart: BarChart3,
      zap: Zap,
    };
    return icons[iconName] || FileText;
  };

  const handleUseTool = async () => {
    if (!user) {
      window.location.href = '/auth';
      return;
    }

    if (!selectedTool || !toolInput.trim()) return;

    setProcessingTool(true);
    setToolOutput(null);

    try {
      const response = await apiClient.useResearchTool(selectedTool.id, { input: toolInput });
      if (response.data) {
        setToolOutput(response.data);
      }
    } catch (error) {
      console.error('Failed to use tool:', error);
      setToolOutput({ error: 'Failed to process. Please try again.' });
    } finally {
      setProcessingTool(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Research Tools</h1>
          <p className="text-lg text-gray-600">
            Powerful tools to accelerate your research workflow
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <p className="text-gray-500 mt-4">Loading tools...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools.map((tool) => {
              const IconComponent = getIconComponent(tool.icon);
              return (
                <div
                  key={tool.id}
                  onClick={() => setSelectedTool(tool)}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-indigo-600" />
                    </div>
                    {tool.isPremium && (
                      <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full flex items-center space-x-1">
                        <Lock className="w-3 h-3" />
                        <span>Premium</span>
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{tool.name}</h3>
                  <p className="text-gray-600 text-sm mb-2">{tool.description}</p>
                  <span className="text-xs text-gray-500">{tool.category}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Tool Usage Modal */}
        {selectedTool && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{selectedTool.name}</h2>
                <button
                  onClick={() => {
                    setSelectedTool(null);
                    setToolInput('');
                    setToolOutput(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <p className="text-gray-600 mb-4">{selectedTool.description}</p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Input
                </label>
                <textarea
                  value={toolInput}
                  onChange={(e) => setToolInput(e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Enter your data or query..."
                />
              </div>

              <button
                onClick={handleUseTool}
                disabled={processingTool || !toolInput.trim()}
                className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
              >
                {processingTool ? 'Processing...' : 'Run Tool'}
              </button>

              {toolOutput && (
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Output
                  </label>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <pre className="whitespace-pre-wrap text-sm">
                      {typeof toolOutput === 'string' ? toolOutput : JSON.stringify(toolOutput, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}