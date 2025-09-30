
import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, Lightbulb, Target, Zap, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';

const About: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Revolutionizing How We
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Discover Science</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We believe research should inspire, not intimidate. Our platform transforms complex academic papers 
            into engaging stories that connect ideas across fields and spark meaningful conversations.
          </p>
        </div>

        {/* Mission Section */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-12">
          <div className="text-center mb-8">
            <Target className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              To democratize access to scientific knowledge by making research discoveries accessible, 
              engaging, and connected for everyone - from curious minds to seasoned researchers.
            </p>
          </div>
        </div>

        {/* Vision Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Lightbulb className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Make Research Accessible</h3>
            <p className="text-gray-600">
              Transform complex academic language into clear, engaging stories that anyone can understand and appreciate.
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Users className="w-10 h-10 text-blue-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Foster Collaboration</h3>
            <p className="text-gray-600">
              Connect researchers, students, and curious minds through meaningful discussions and cross-field insights.
            </p>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <Zap className="w-10 h-10 text-purple-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-3">Accelerate Discovery</h3>
            <p className="text-gray-600">
              Help researchers discover connections between fields and build upon each other's work more effectively.
            </p>
          </div>
        </div>

        {/* Story Section */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">The Problem We're Solving</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-3">Traditional Research Publishing</h3>
                <ul className="space-y-2 text-indigo-100">
                  <li>• Complex academic jargon</li>
                  <li>• Isolated research silos</li>
                  <li>• Limited accessibility</li>
                  <li>• Slow knowledge transfer</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold mb-3">Our Approach</h3>
                <ul className="space-y-2 text-purple-100">
                  <li>• Clear, engaging narratives</li>
                  <li>• Cross-field connections</li>
                  <li>• Multi-level content for all audiences</li>
                  <li>• Real-time collaboration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'Openness', description: 'Knowledge should be open and accessible to all' },
              { title: 'Curiosity', description: 'We celebrate the joy of discovery and learning' },
              { title: 'Collaboration', description: 'Great breakthroughs happen when minds connect' },
              { title: 'Innovation', description: 'We reimagine how research is shared and consumed' }
            ].map((value, index) => (
              <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">{value.title}</h3>
                <p className="text-gray-600 text-sm">{value.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Explore?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join thousands of researchers, students, and curious minds discovering science in a whole new way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/library"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium"
            >
              <BookOpen className="w-5 h-5" />
              <span>Start Exploring</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all text-lg font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Join the Community</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
