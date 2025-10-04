import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Clock, CheckCircle, Play } from 'lucide-react';

interface LearningPath {
  id: number;
  title: string;
  description: string;
  difficulty: string;
  estimatedHours: number;
  userProgress: number;
  steps: Array<{
    id: string;
    title: string;
    description: string;
    completed: boolean;
  }>;
}

export function LearningPaths() {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/learning-paths', {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLearningPaths(data);
      }
    } catch (error) {
      console.error('Failed to load learning paths:', error);
      // Mock data for development
      setLearningPaths([
        {
          id: 1,
          title: 'Introduction to Research Methods',
          description: 'Learn the fundamentals of scientific research methodology.',
          difficulty: 'Beginner',
          estimatedHours: 20,
          userProgress: 0,
          steps: [
            { id: 'step1', title: 'Understanding Research Questions', description: 'Learn how to formulate effective research questions', completed: false },
            { id: 'step2', title: 'Literature Review Techniques', description: 'Master the art of comprehensive literature reviews', completed: false },
            { id: 'step3', title: 'Data Collection Methods', description: 'Explore various data collection approaches', completed: false }
          ]
        },
        {
          id: 2,
          title: 'Advanced Statistical Analysis',
          description: 'Master statistical techniques for research data analysis.',
          difficulty: 'Advanced',
          estimatedHours: 40,
          userProgress: 25,
          steps: [
            { id: 'step1', title: 'Descriptive Statistics', description: 'Understanding data distribution and summary statistics', completed: true },
            { id: 'step2', title: 'Inferential Statistics', description: 'Hypothesis testing and confidence intervals', completed: false },
            { id: 'step3', title: 'Advanced Modeling', description: 'Regression analysis and machine learning basics', completed: false }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const completeStep = async (pathId: number, stepId: string) => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch(`/api/learning-paths/${pathId}/complete-step`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stepId })
      });

      if (response.ok) {
        setLearningPaths(prev => prev.map(path => {
          if (path.id === pathId) {
            const updatedSteps = path.steps.map(step => 
              step.id === stepId ? { ...step, completed: true } : step
            );
            const completedSteps = updatedSteps.filter(step => step.completed).length;
            const newProgress = Math.round((completedSteps / updatedSteps.length) * 100);

            return { ...path, steps: updatedSteps, userProgress: newProgress };
          }
          return path;
        }));
      }
    } catch (error) {
      console.error('Failed to complete step:', error);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Learning Paths</h1>
          <p className="text-lg text-gray-600">
            Structured learning journeys to master research skills and methodologies.
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-4">Loading learning paths...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {learningPaths.map(path => (
              <div key={path.id} className="bg-white rounded-lg shadow-md p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{path.title}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(path.difficulty)}`}>
                      {path.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{path.description}</p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500 mb-4">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{path.estimatedHours} hours</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <BookOpen className="w-4 h-4" />
                      <span>{path.steps.length} steps</span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-gray-600">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{path.userProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${path.userProgress}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Steps */}
                <div className="space-y-3">
                  {path.steps.map((step) => (
                    <div key={step.id} className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200">
                      <div className="flex-shrink-0 mt-1">
                        {step.completed ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <button
                            onClick={() => completeStep(path.id, step.id)}
                            className="w-5 h-5 border-2 border-gray-300 rounded-full hover:border-blue-500 transition-colors"
                          />
                        )}
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-gray-900">{step.title}</h4>
                        <p className="text-xs text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  className="w-full mt-4 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
                >
                  <Play className="w-4 h-4" />
                  <span>{path.userProgress > 0 ? 'Continue Learning' : 'Start Learning'}</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Ready to advance your research skills?
            </h2>
            <p className="text-gray-600 mb-6">
              Join thousands of researchers who have enhanced their skills through our structured learning paths.
            </p>
            <div className="flex justify-center space-x-8 text-sm">
              <div>
                <div className="text-2xl font-bold text-blue-600">500+</div>
                <div className="text-gray-600">Learners</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">15</div>
                <div className="text-gray-600">Learning Paths</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">95%</div>
                <div className="text-gray-600">Completion Rate</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}