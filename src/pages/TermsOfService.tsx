
import { Navbar } from '../components/Navbar';

export function TermsOfService() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8">Last updated: January 2024</p>

          <div className="prose max-w-none">
            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using our research platform, you accept and agree to be bound by the terms 
              and provision of this agreement.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Our platform provides tools for researchers to publish, share, review, and collaborate on 
              research papers and academic content. We offer both free and premium features.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 mb-4">
              To access certain features, you must create an account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Providing accurate and up-to-date information</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">4. Content Guidelines</h2>
            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Acceptable Use</h3>
            <p className="text-gray-700 mb-4">You may only submit content that:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Is original or properly attributed research work</li>
              <li>Complies with academic integrity standards</li>
              <li>Does not infringe on intellectual property rights</li>
              <li>Is respectful and professional in tone</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-3">Prohibited Content</h3>
            <p className="text-gray-700 mb-4">You may not submit content that:</p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Contains plagiarized or fraudulent research</li>
              <li>Violates ethical research standards</li>
              <li>Is defamatory, abusive, or discriminatory</li>
              <li>Contains malicious code or spam</li>
              <li>Violates any applicable laws or regulations</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">5. Intellectual Property</h2>
            <p className="text-gray-700 mb-4">
              You retain ownership of your research content. By submitting content to our platform, 
              you grant us a license to host, display, and distribute your content according to your 
              chosen visibility settings.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">6. Peer Review Process</h2>
            <p className="text-gray-700 mb-4">
              Our peer review system is designed to maintain quality and promote constructive feedback. 
              Reviewers must:
            </p>
            <ul className="list-disc pl-6 text-gray-700 mb-4">
              <li>Provide honest, constructive feedback</li>
              <li>Maintain confidentiality of unpublished work</li>
              <li>Disclose any conflicts of interest</li>
              <li>Follow ethical review guidelines</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">7. Premium Services</h2>
            <p className="text-gray-700 mb-4">
              Some features require a premium subscription. Premium services are billed in advance 
              and are non-refundable except as required by law.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">8. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Please review our Privacy Policy to understand how 
              we collect, use, and protect your information.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">9. Termination</h2>
            <p className="text-gray-700 mb-4">
              We may terminate or suspend your account if you violate these terms. You may also 
              terminate your account at any time by contacting us.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">10. Limitation of Liability</h2>
            <p className="text-gray-700 mb-4">
              Our platform is provided "as is" without warranties. We are not liable for any indirect, 
              incidental, or consequential damages arising from your use of our service.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700 mb-4">
              We may update these terms from time to time. Continued use of our platform after 
              changes constitutes acceptance of the new terms.
            </p>

            <h2 className="text-2xl font-semibold text-gray-900 mt-8 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="bg-gray-50 p-4 rounded-md">
              <p className="text-gray-700">
                Email: legal@researchplatform.com<br />
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
