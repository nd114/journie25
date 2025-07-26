import React from 'react'
import { ArrowLeft, Users, Target, Award, Zap } from 'lucide-react'

interface AboutPageProps {
  onNavigate: (page: string) => void
}

export default function AboutPage({ onNavigate }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-4xl font-bold text-gray-900 text-center">About Journie</h1>
        </div>
      </div>

    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
       

        {/* Header */}
        <div className="text-center mb-16">
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We're building the future of research collaboration and knowledge management, 
            empowering researchers to discover, organize, and share insights more effectively.
          </p>
        </div>

        {/* Mission Section */}
        <section className="mb-16">
          <div className="bg-blue-50 rounded-2xl p-8 md:p-12">
            <div className="text-center">
              <Target className="w-12 h-12 text-blue-600 mx-auto mb-6" />
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Mission</h2>
              <p className="text-lg text-gray-700 max-w-2xl mx-auto">
                To democratize research by providing intelligent tools that help researchers 
                collaborate, discover insights, and advance human knowledge. We believe that 
                great research should be accessible, organized, and shareable.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Users className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Collaboration</h3>
              <p className="text-gray-600">
                We believe research is better when minds work together. Our platform fosters 
                meaningful collaboration between researchers worldwide.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Zap className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Innovation</h3>
              <p className="text-gray-600">
                We're constantly pushing the boundaries of what's possible in research technology, 
                leveraging AI and modern tools to enhance discovery.
              </p>
            </div>

            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                <Award className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Excellence</h3>
              <p className="text-gray-600">
                We strive for excellence in everything we do, from our product design to 
                customer support, ensuring researchers have the best tools available.
              </p>
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Our Story</h2>
          <div className="prose prose-lg max-w-none text-gray-700">
            <p className="mb-6">
              Journie was born from the frustration of researchers who struggled with 
              fragmented tools and inefficient workflows. Our founders, experienced 
              researchers themselves, recognized that the academic world needed a unified 
              platform that could handle the complexity of modern research.
            </p>
            <p className="mb-6">
              Starting in 2024, we set out to build more than just another note-taking app. 
              We envisioned a comprehensive research ecosystem that would grow with researchers 
              throughout their careers, from graduate students to senior academics and 
              industry professionals.
            </p>
            <p className="mb-6">
              Today, Journie serves thousands of researchers across universities, research 
              institutions, and companies worldwide. We're proud to be part of their journey 
              toward breakthrough discoveries and meaningful contributions to human knowledge.
            </p>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">Leadership Team</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Dr. Sarah Chen</h3>
              <p className="text-blue-600 mb-2">CEO & Co-founder</p>
              <p className="text-gray-600 text-sm">
                Former research scientist at MIT with 10+ years in academic research and 
                technology development.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mx-auto mb-4"></div>
              <h3 className="text-xl font-semibold text-gray-900">Dr. Michael Rodriguez</h3>
              <p className="text-blue-600 mb-2">CTO & Co-founder</p>
              <p className="text-gray-600 text-sm">
                Former senior engineer at Google with expertise in AI/ML and large-scale 
                distributed systems.
              </p>
            </div>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="text-center bg-gray-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Want to Learn More?</h2>
          <p className="text-gray-600 mb-6">
            We'd love to hear from you. Reach out to us with any questions or feedback.
          </p>
          <button
            onClick={() => onNavigate('contact')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Contact Us
          </button>
        </section>
      </div>
    </div>
  )
}