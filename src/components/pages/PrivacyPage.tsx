
import React from 'react'
import { ArrowLeft, Shield, Eye, Lock, Database } from 'lucide-react'

interface PrivacyPageProps {
  onNavigate: (page: string) => void
}

export default function PrivacyPage({ onNavigate }: PrivacyPageProps) {
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
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last updated: December 2024</p>
        </div>

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-700 mb-4">
              At Journie, we take your privacy seriously. This Privacy Policy explains how we collect, 
              use, disclose, and safeguard your information when you use our research platform and services.
            </p>
            <p className="text-gray-700">
              By using Journie, you consent to the data practices described in this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <Eye className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Information You Provide</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Account information (name, email address, password)</li>
                <li>• Research content (notes, documents, projects, citations)</li>
                <li>• Profile information and preferences</li>
                <li>• Communication data when you contact support</li>
              </ul>
            </div>

            <div className="bg-gray-50 rounded-lg p-6 mb-6">
              <div className="flex items-center mb-3">
                <Database className="w-5 h-5 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Information We Collect Automatically</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Usage data (how you interact with our platform)</li>
                <li>• Device information (browser type, operating system)</li>
                <li>• Log data (IP address, access times, pages viewed)</li>
                <li>• Cookies and similar tracking technologies</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-700 mb-4">We use the information we collect to:</p>
            <ul className="space-y-2 text-gray-700 list-disc ml-6">
              <li>Provide, maintain, and improve our services</li>
              <li>Process transactions and send related information</li>
              <li>Send technical notices, updates, and security alerts</li>
              <li>Respond to your comments, questions, and customer service requests</li>
              <li>Develop new features and functionality</li>
              <li>Monitor usage patterns and prevent abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex items-center mb-3">
                <Lock className="w-5 h-5 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Our Security Measures</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• End-to-end encryption for sensitive research data</li>
                <li>• Secure data centers with 24/7 monitoring</li>
                <li>• Regular security audits and penetration testing</li>
                <li>• Employee access controls and background checks</li>
                <li>• Incident response and data breach notification procedures</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Sharing and Disclosure</h2>
            <p className="text-gray-700 mb-4">
              We do not sell, trade, or rent your personal information to third parties. 
              We may share your information only in the following circumstances:
            </p>
            <ul className="space-y-2 text-gray-700 list-disc ml-6">
              <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Service providers:</strong> Third-party vendors who assist in providing our services</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-700 mb-4">You have the following rights regarding your personal information:</p>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Access and Portability</h3>
                <p className="text-sm text-gray-600">
                  Request a copy of your personal data in a structured, machine-readable format.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Correction</h3>
                <p className="text-sm text-gray-600">
                  Update or correct inaccurate or incomplete personal information.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Deletion</h3>
                <p className="text-sm text-gray-600">
                  Request deletion of your personal data, subject to certain legal limitations.
                </p>
              </div>
              <div className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Opt-out</h3>
                <p className="text-sm text-gray-600">
                  Unsubscribe from marketing communications at any time.
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookies and Tracking</h2>
            <p className="text-gray-700 mb-4">
              We use cookies and similar technologies to enhance your experience, analyze usage, 
              and provide personalized content. You can control cookie preferences through your browser settings.
            </p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Disabling certain cookies may limit your ability to use some features of our platform.
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">International Data Transfers</h2>
            <p className="text-gray-700">
              Your information may be transferred to and processed in countries other than your own. 
              We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-700">
              We may update this Privacy Policy periodically. We will notify you of any material changes 
              by posting the new policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 mb-4">
              If you have questions about this Privacy Policy or our data practices, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-gray-700"><strong>Email:</strong> privacy@journie.app</p>
              <p className="text-gray-700"><strong>Address:</strong> 123 Research Drive, Innovation City, CA 94000</p>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Have Questions?</h3>
          <p className="text-gray-600 mb-4">Our support team is here to help with any privacy concerns.</p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Contact Support
          </button>
        </div>
      </div>
    </div>
  )
}
