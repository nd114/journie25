
import Navbar from '../components/Navbar';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, submit research papers, 
              leave comments, or contact us for support.
            </p>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Account Information</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Name and email address</li>
              <li>Institutional affiliation</li>
              <li>ORCID ID (optional)</li>
              <li>Professional bio and research interests</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Research Content</h3>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Research papers and abstracts you submit</li>
              <li>Comments and reviews you post</li>
              <li>Citations and references you create</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide and maintain our research platform</li>
              <li>Process and display your research contributions</li>
              <li>Enable collaboration with other researchers</li>
              <li>Send you updates about platform features and research trends</li>
              <li>Improve our services through analytics</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. Information Sharing</h2>
            <p className="text-gray-700 mb-4">
              We do not sell your personal information. We may share your information in the following circumstances:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li><strong>Public Research Content:</strong> Papers, comments, and reviews you choose to make public</li>
              <li><strong>With Your Consent:</strong> When you explicitly agree to sharing</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Data Security</h2>
            <p className="text-gray-700 mb-4">
              We implement appropriate security measures to protect your information against unauthorized access, 
              alteration, disclosure, or destruction. However, no internet transmission is 100% secure.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 mb-4">You have the right to:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Control the visibility of your research content</li>
              <li>Opt out of non-essential communications</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and provide personalized content. You can control cookie settings through your browser.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. International Data Transfers</h2>
            <p className="text-gray-700 mb-4">
              Your information may be processed in countries other than your own. We ensure appropriate 
              safeguards are in place for international data transfers.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy, please contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">
                Email: privacy@researchplatform.com<br />
                Address: 123 Research Ave, Academic City, AC 12345
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Mail } from 'lucide-react';
import Navbar from '../components/Navbar';

export function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-center space-x-3 mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Privacy Policy</h1>
          </div>
          
          <div className="prose max-w-none">
            <p className="text-gray-600 mb-6">
              Last updated: {new Date().toLocaleDateString()}
            </p>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <p className="text-gray-600 mb-4">
                We collect information you provide directly to us, such as when you create an account, 
                submit research papers, or communicate with us.
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Account information (name, email, affiliation)</li>
                <li>Research papers and associated metadata</li>
                <li>Comments and reviews on research papers</li>
                <li>Usage data and analytics</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">How We Use Your Information</h2>
              <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>To provide and maintain our research platform</li>
                <li>To facilitate research collaboration and discovery</li>
                <li>To send you technical notices and support messages</li>
                <li>To improve our services and develop new features</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Information Sharing</h2>
              <p className="text-gray-600 mb-4">
                We do not sell, trade, or otherwise transfer your personal information to third parties 
                without your consent, except as described in this policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Security</h2>
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information against 
                unauthorized access, alteration, disclosure, or destruction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-600">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="flex items-center space-x-2 text-blue-600 mt-2">
                <Mail className="w-4 h-4" />
                <span>privacy@researchplatform.com</span>
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
