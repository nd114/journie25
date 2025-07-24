
import React from 'react'
import { ArrowLeft, FileText, AlertTriangle, Users, CreditCard } from 'lucide-react'

interface TermsPageProps {
  onNavigate: (page: string) => void
}

export default function TermsPage({ onNavigate }: TermsPageProps) {
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 mb-4">
              By accessing and using Journie ("the Service"), you accept and agree to be bound by 
              the terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>Important:</strong> These terms constitute a legally binding agreement between you and Journie.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 mb-4">
              Journie is a research collaboration and knowledge management platform that allows users to:
            </p>
            <ul className="space-y-2 text-gray-700 list-disc ml-6">
              <li>Create, organize, and manage research notes and documents</li>
              <li>Collaborate with other researchers and team members</li>
              <li>Access citation management and bibliography tools</li>
              <li>Utilize AI-powered research assistance features</li>
              <li>Store and sync research data across devices</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts and Registration</h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Users className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Account Requirements</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• You must be at least 13 years old to create an account</li>
                <li>• You must provide accurate and complete registration information</li>
                <li>• You are responsible for maintaining account security</li>
                <li>• You may not share your account credentials with others</li>
                <li>• One person may not maintain more than one account</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
            <p className="text-gray-700 mb-4">You agree NOT to use the Service to:</p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Prohibited Activities</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Upload, post, or transmit any unlawful, harmful, or inappropriate content</li>
                <li>• Violate any intellectual property rights</li>
                <li>• Attempt to gain unauthorized access to our systems</li>
                <li>• Use the service for any commercial purpose without written consent</li>
                <li>• Harass, abuse, or harm other users</li>
                <li>• Distribute malware, viruses, or other harmful code</li>
                <li>• Interfere with the proper functioning of the service</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Intellectual Property Rights</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Your Content</h3>
                <p className="text-sm text-gray-600">
                  You retain ownership of all research content you create. By using our service, 
                  you grant us a limited license to store, process, and display your content.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Our Platform</h3>
                <p className="text-sm text-gray-600">
                  Journie and all related trademarks, logos, and intellectual property remain 
                  our exclusive property.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Payment Terms</h2>
            <div className="bg-green-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <CreditCard className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Billing and Subscriptions</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Free accounts have limited features and storage</li>
                <li>• Paid subscriptions are billed monthly or annually</li>
                <li>• All fees are non-refundable unless required by law</li>
                <li>• You may cancel your subscription at any time</li>
                <li>• Price changes will be communicated 30 days in advance</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Privacy and Data Protection</h2>
            <p className="text-gray-700 mb-4">
              Your privacy is important to us. Our data collection and use practices are 
              described in detail in our Privacy Policy, which is incorporated into these terms by reference.
            </p>
            <button
              onClick={() => onNavigate('privacy')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Read our Privacy Policy →
            </button>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Service Availability</h2>
            <p className="text-gray-700 mb-4">
              While we strive to provide continuous service, we do not guarantee uninterrupted access. 
              The Service may be temporarily unavailable due to:
            </p>
            <ul className="space-y-2 text-gray-700 list-disc ml-6">
              <li>Scheduled maintenance and updates</li>
              <li>Technical difficulties or server issues</li>
              <li>Circumstances beyond our reasonable control</li>
              <li>Compliance with legal requirements</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Limitation of Liability</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Important Legal Notice:</strong> Please read this section carefully as it limits our liability.
              </p>
            </div>
            <p className="text-gray-700">
              To the fullest extent permitted by law, Journie shall not be liable for any indirect, 
              incidental, special, consequential, or punitive damages, or any loss of profits or revenues, 
              whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
            <p className="text-gray-700 mb-4">
              Either party may terminate this agreement at any time. Upon termination:
            </p>
            <ul className="space-y-2 text-gray-700 list-disc ml-6">
              <li>Your access to the Service will be immediately suspended</li>
              <li>You may export your data for 30 days after termination</li>
              <li>We may delete your account and data after the grace period</li>
              <li>All provisions that should survive termination will remain in effect</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Changes to Terms</h2>
            <p className="text-gray-700">
              We reserve the right to modify these terms at any time. Material changes will be 
              communicated via email or through the Service. Continued use after changes constitutes 
              acceptance of the new terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Governing Law</h2>
            <p className="text-gray-700">
              These terms shall be governed by and construed in accordance with the laws of the 
              State of California, United States, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Information</h2>
            <p className="text-gray-700 mb-4">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> legal@journie.app</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Research Drive, Innovation City, CA 94000</p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-6 bg-purple-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Clarification?</h3>
          <p className="text-gray-600 mb-4">Our support team can help explain any part of these terms.</p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-purple-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
