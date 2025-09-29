import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Search, Users, Sparkles } from 'lucide-react';
import Navbar from '../components/Navbar';

const LibraryLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Discover Research, Share Knowledge
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore cutting-edge research papers, engage with the academic community, and publish your own findings on our collaborative platform.
          </p>
          <Link
            to="/library"
            className="inline-flex items-center space-x-2 px-8 py-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium"
          >
            <Search className="w-5 h-5" />
            <span>Browse Papers</span>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <BookOpen className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Extensive Library</h3>
            <p className="text-gray-600">
              Access a vast collection of research papers across multiple fields and disciplines.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Collaborative Community</h3>
            <p className="text-gray-600">
              Engage in discussions, provide feedback, and connect with researchers worldwide.
            </p>
          </div>

          <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm">
            <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Publish Your Work</h3>
            <p className="text-gray-600">
              Share your research with the world and get valuable feedback from peers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LibraryLanding;
