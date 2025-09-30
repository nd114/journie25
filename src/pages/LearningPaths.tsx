import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty: string; // Changed from 'level' to 'difficulty' to match new structure
  estimatedHours: number; // Changed from 'duration'
  enrolledCount: number; // New field
  rating: number; // New field
  instructor: string; // New field
  modules: { id: string; title: string; duration: string; completed: boolean }[]; // Changed from 'paperCount' related structure
  tags: string[]; // Changed from 'category'
  isEnrolled: boolean;
  progress: number;
}

export function LearningPaths() {
  const [selectedCategory, setSelectedCategory] = useState('all'); // This will likely be replaced by tag filtering
  const [selectedLevel, setSelectedLevel] = useState('all'); // This maps to 'difficulty'
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);

  useEffect(() => {
    loadLearningPaths();
  }, []);

  const loadLearningPaths = async () => {
    try {
      const response = await fetch('/api/learning-paths');
      if (response.ok) {
        const data = await response.json();
        const formattedPaths = data.map((path: any) => ({
          id: path.id.toString(),
          title: path.title,
          description: path.description,
          difficulty: path.difficulty,
          estimatedHours: path.estimatedHours,
          enrolledCount: Math.floor(Math.random() * 2000) + 500, // Mock enrollment count
          rating: 4.5 + Math.random() * 0.5, // Mock rating
          instructor: 'Research Platform', // Mock instructor
          modules: path.steps || [],
          tags: [path.difficulty, 'Research'], // Mock tags - categories will likely come from path.tags
          isEnrolled: false, // Would need to check user enrollment
          progress: 0 // Would need to calculate from user progress
        }));
        setLearningPaths(formattedPaths);
      }
    } catch (error) {
      console.error('Failed to load learning paths:', error);
    }
  };


  const categories = ['all', 'AI & Machine Learning', 'Climate Science', 'Quantum Physics', 'Biotechnology']; // These will likely be derived from fetched path.tags
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced']; // This maps to difficulty

  const filteredPaths = learningPaths.filter(path => {
    const categoryMatch = selectedCategory === 'all' || path.tags.includes(selectedCategory); // Assuming categories are part of tags now
    const levelMatch = selectedLevel === 'all' || path.difficulty === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const handleEnroll = async (pathId: string) => {
    // Mock enrollment - in real app, would call API to enroll user and update their progress
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/enroll`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setLearningPaths(prev => prev.map(path => 
          path.id === pathId ? { ...path, isEnrolled: true, enrolledCount: path.enrolledCount + 1 } : path
        ));
      } else {
        console.error('Failed to enroll in path');
      }
    } catch (error) {
      console.error('Error enrolling in path:', error);
    }
  };

  const handleCompleteModule = async (pathId: string, moduleId: string) => {
    try {
      const response = await fetch(`/api/learning-paths/${pathId}/complete-step`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ stepId: moduleId })
      });

      if (response.ok) {
        setLearningPaths(prev => prev.map(path => {
          if (path.id === pathId) {
            const updatedModules = path.modules.map(module => 
              module.id === moduleId ? { ...module, completed: true } : module
            );
            const completedCount = updatedModules.filter(m => m.completed).length;
            const newProgress = Math.round((completedCount / updatedModules.length) * 100);

            return {
              ...path,
              modules: updatedModules,
              progress: newProgress
            };
          }
          return path;
        }));
      } else {
        console.error('Failed to complete module');
      }
    } catch (error) {
      console.error('Failed to complete module:', error);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
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
            Structured learning journeys designed to guide you through complex research topics step by step.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category === 'all' ? 'All Categories' : category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {levels.map(level => (
                  <option key={level} value={level}>
                    {level === 'all' ? 'All Levels' : level}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Learning Paths Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredPaths.map(path => (
            <div key={path.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(path.difficulty)}`}>
                    {path.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">{path.estimatedHours} hours</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.title}</h3>
                <p className="text-gray-600 mb-4">{path.description}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{path.enrolledCount} enrolled</span> {/* Display enrolled count */}
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {path.tags.join(', ')} {/* Display tags */}
                  </span>
                </div>

                {path.isEnrolled && (
                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{path.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${path.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <button
                  onClick={() => path.isEnrolled ? {} : handleEnroll(path.id)} // Prevent re-enrollment by disabling button logic
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    path.isEnrolled
                      ? 'bg-gray-300 text-gray-700 cursor-not-allowed' // Disabled state for enrolled
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                  disabled={path.isEnrolled} // Button disabled if already enrolled
                >
                  {path.isEnrolled ? 'Continue Learning' : 'Start Learning Path'}
                </button>

                {/* Example of how to trigger module completion (for demonstration) */}
                {path.isEnrolled && path.progress < 100 && (
                  <button
                    onClick={() => {
                      const firstIncompleteModule = path.modules.find(m => !m.completed);
                      if (firstIncompleteModule) {
                        handleCompleteModule(path.id, firstIncompleteModule.id);
                      }
                    }}
                    className="w-full mt-2 py-2 px-4 rounded-md font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                  >
                    Complete Next Step
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Create Custom Path CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Create Your Own Learning Path</h2>
          <p className="text-purple-100 mb-6">
            Can't find the perfect learning path? Create a custom one tailored to your research interests.
          </p>
          <button className="bg-white text-purple-600 px-6 py-3 rounded-md font-medium hover:bg-gray-100 transition-colors">
            Create Custom Path
          </button>
        </div>
      </div>
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { BookOpen, Clock, CheckCircle, Play, Users } from 'lucide-react';

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
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);

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
                  {path.steps.map((step, index) => (
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
                  onClick={() => setSelectedPath(path)}
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