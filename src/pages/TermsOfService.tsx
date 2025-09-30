import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Terms of Service</h1>
          </div>

          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Acceptance of Terms</h2>
              <p className="text-gray-600">
                By accessing and using this research platform, you accept and agree to be bound by 
                the terms and provision of this agreement.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Use License</h2>
              <p className="text-gray-600 mb-4">
                Permission is granted to temporarily use this platform for personal, non-commercial 
                research and educational purposes.
              </p>
              <p className="text-gray-600">This license shall not permit you to:</p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mt-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for commercial purposes</li>
                <li>Remove any copyright or proprietary notations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Content</h2>
              <p className="text-gray-600">
                Users are responsible for all content they submit to the platform, including research 
                papers, comments, and reviews. Content must be original or properly attributed.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Prohibited Uses</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Violating any applicable laws or regulations</li>
                <li>Uploading malicious code or harmful content</li>
                <li>Attempting to gain unauthorized access to the platform</li>
                <li>Harassment or abuse of other users</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Disclaimers</h2>
              <p className="text-gray-600">
                The information on this platform is provided on an 'as is' basis. We make no warranties, 
                expressed or implied, and hereby disclaim all other warranties.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-600">
                If you have any questions about these Terms of Service, please contact us:
              </p>
              <div className="flex items-center space-x-2 text-blue-600 mt-2">
                <Mail className="w-4 h-4" />
                <span>legal@researchplatform.com</span>
              </div>
            </section>
          </div>

          <div className="border-t border-gray-200 pt-6 mt-8">
            <Link 
              to="/" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}