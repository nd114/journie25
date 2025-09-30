
import { useState } from 'react';
import { Navbar } from '../components/Navbar';

interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  paperCount: number;
  category: string;
  progress?: number;
  isEnrolled?: boolean;
}

export function LearningPaths() {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const learningPaths: LearningPath[] = [
    {
      id: '1',
      title: 'Introduction to Machine Learning',
      description: 'Start your journey in machine learning with fundamental concepts and practical applications.',
      level: 'Beginner',
      duration: '4 weeks',
      paperCount: 12,
      category: 'AI & Machine Learning',
      progress: 30,
      isEnrolled: true
    },
    {
      id: '2',
      title: 'Deep Learning Architectures',
      description: 'Explore advanced neural network architectures and their applications in modern AI.',
      level: 'Advanced',
      duration: '8 weeks',
      paperCount: 25,
      category: 'AI & Machine Learning',
      progress: 0,
      isEnrolled: false
    },
    {
      id: '3',
      title: 'Climate Science Fundamentals',
      description: 'Understand the science behind climate change and environmental research.',
      level: 'Beginner',
      duration: '6 weeks',
      paperCount: 18,
      category: 'Climate Science',
      progress: 75,
      isEnrolled: true
    },
    {
      id: '4',
      title: 'Quantum Computing Principles',
      description: 'Dive into the fascinating world of quantum mechanics and quantum computation.',
      level: 'Intermediate',
      duration: '10 weeks',
      paperCount: 30,
      category: 'Quantum Physics',
      progress: 0,
      isEnrolled: false
    }
  ];

  const categories = ['all', 'AI & Machine Learning', 'Climate Science', 'Quantum Physics', 'Biotechnology'];
  const levels = ['all', 'Beginner', 'Intermediate', 'Advanced'];

  const filteredPaths = learningPaths.filter(path => {
    const categoryMatch = selectedCategory === 'all' || path.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || path.level === selectedLevel;
    return categoryMatch && levelMatch;
  });

  const handleEnroll = (pathId: string) => {
    // In real app, make API call to enroll user
    console.log('Enrolling in path:', pathId);
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
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(path.level)}`}>
                    {path.level}
                  </span>
                  <span className="text-sm text-gray-500">{path.duration}</span>
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{path.title}</h3>
                <p className="text-gray-600 mb-4">{path.description}</p>
                
                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>{path.paperCount} papers</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                    {path.category}
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
                  onClick={() => handleEnroll(path.id)}
                  className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
                    path.isEnrolled
                      ? 'bg-green-100 text-green-800 hover:bg-green-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {path.isEnrolled ? 'Continue Learning' : 'Start Learning Path'}
                </button>
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
