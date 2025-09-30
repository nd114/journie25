import { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';

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