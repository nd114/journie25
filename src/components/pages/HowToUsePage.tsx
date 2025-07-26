import React, { useState } from 'react'
import { ArrowLeft, Play, BookOpen, Users, Zap, Search, Quote, FileText, CheckCircle } from 'lucide-react'

interface HowToUsePageProps {
  onNavigate: (page: string) => void
}

export default function HowToUsePage({ onNavigate }: HowToUsePageProps) {
  const [activeStep, setActiveStep] = useState(0)

  const steps = [
    {
      id: 0,
      title: 'Getting Started',
      icon: BookOpen,
      description: 'Create your account and set up your workspace',
      content: {
        overview: 'Begin your research journey by setting up your Journie account and customizing your workspace.',
        steps: [
          'Sign up for a free Journie account',
          'Complete your profile and research interests',
          'Choose your preferred theme and layout',
          'Connect with your institution (optional)',
          'Import existing research materials'
        ],
        tip: 'Take advantage of our onboarding tutorial to get familiar with the interface quickly.'
      }
    },
    {
      id: 1,
      title: 'Creating Projects',
      icon: FileText,
      description: 'Organize your research into structured projects',
      content: {
        overview: 'Projects help you organize related research topics, collaborate with teams, and track progress.',
        steps: [
          'Click "New Project" from your dashboard',
          'Choose a project template or start from scratch',
          'Set project goals, timeline, and collaborators',
          'Create folders to organize your research',
          'Add team members and set permissions'
        ],
        tip: 'Use project templates for common research types like literature reviews or experimental studies.'
      }
    },
    {
      id: 2,
      title: 'Smart Note-Taking',
      icon: Zap,
      description: 'Capture and organize your research insights',
      content: {
        overview: 'Our rich text editor with AI assistance helps you create, link, and organize your research notes.',
        steps: [
          'Create new notes with our rich text editor',
          'Use tags and categories to organize content',
          'Link related notes and concepts together',
          'Add images, files, and web clippings',
          'Use AI suggestions for improved writing'
        ],
        tip: 'Use @ mentions to reference other notes and create automatic backlinks.'
      }
    },
    {
      id: 3,
      title: 'Citation Management',
      icon: Quote,
      description: 'Automatically format and manage your citations',
      content: {
        overview: 'Seamlessly manage citations, generate bibliographies, and ensure proper academic formatting.',
        steps: [
          'Import citations from DOI, ISBN, or URLs',
          'Organize citations into collections',
          'Generate bibliographies in any format',
          'Insert in-text citations while writing',
          'Sync with reference managers like Zotero'
        ],
        tip: 'Use our browser extension to save citations directly from academic websites.'
      }
    },
    {
      id: 4,
      title: 'Team Collaboration',
      icon: Users,
      description: 'Work together with your research team',
      content: {
        overview: 'Collaborate in real-time with colleagues, share findings, and build on each other\'s work.',
        steps: [
          'Invite team members to your projects',
          'Set appropriate permission levels',
          'Use real-time editing and comments',
          'Share specific notes or entire projects',
          'Track changes and version history'
        ],
        tip: 'Use the discussion board feature to have threaded conversations about specific research topics.'
      }
    },
    {
      id: 5,
      title: 'Advanced Search',
      icon: Search,
      description: 'Find exactly what you need across all your research',
      content: {
        overview: 'Use powerful search capabilities to discover connections and find information quickly.',
        steps: [
          'Use natural language search queries',
          'Filter by project, date, or content type',
          'Search within documents and PDFs',
          'Use advanced operators for precise results',
          'Save frequently used search queries'
        ],
        tip: 'Try semantic search to find conceptually related content even if exact keywords don\'t match.'
      }
    }
  ]

  const features = [
    {
      icon: BookOpen,
      title: 'Rich Text Editor',
      description: 'Write with formatting, equations, and multimedia support'
    },
    {
      icon: Users,
      title: 'Real-time Collaboration',
      description: 'Work simultaneously with your research team'
    },
    {
      icon: Quote,
      title: 'Citation Management',
      description: 'Automatic formatting in 9000+ citation styles'
    },
    {
      icon: Search,
      title: 'AI-Powered Search',
      description: 'Find information using natural language queries'
    },
    {
      icon: FileText,
      title: 'Document Analysis',
      description: 'Extract insights from PDFs and research papers'
    },
    {
      icon: Zap,
      title: 'Smart Suggestions',
      description: 'Get AI recommendations for related research'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">How to Use Journie</h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Master your research workflow with our comprehensive guide to Journie's features and capabilities.
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center text-blue-600 hover:text-blue-700 mb-8"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </button>

        {/* Header */}
        <div className="text-center mb-16">
          <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-6">How to Use Journie</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Master the art of research with our comprehensive guide. From setup to advanced features, 
            learn how to maximize your productivity with Journie.
          </p>
        </div>

        {/* Quick Start Guide */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Quick Start Guide</h2>

          {/* Step Navigation */}
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {steps.map((step, index) => {
              const Icon = step.icon
              return (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(index)}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeStep === index
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {step.title}
                </button>
              )
            })}
          </div>

          {/* Step Content */}
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <div className="flex items-center mb-6">
              <div className="bg-blue-100 p-3 rounded-lg mr-4">
                {React.createElement(steps[activeStep].icon, { className: "w-6 h-6 text-blue-600" })}
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{steps[activeStep].title}</h3>
                <p className="text-gray-600">{steps[activeStep].description}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-6">{steps[activeStep].content.overview}</p>

            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Step-by-step instructions:</h4>
                <ol className="space-y-3">
                  {steps[activeStep].content.steps.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
                    <Zap className="w-4 h-4 mr-2" />
                    Pro Tip
                  </h4>
                  <p className="text-yellow-700 text-sm">{steps[activeStep].content.tip}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
                disabled={activeStep === 0}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              <button
                onClick={() => setActiveStep(Math.min(steps.length - 1, activeStep + 1))}
                disabled={activeStep === steps.length - 1}
                className="px-4 py-2 text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                Next →
              </button>
            </div>
          </div>
        </section>

        {/* Key Features */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div key={index} className="bg-white border border-gray-200 rounded-lg p-6">
                  <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </section>

        {/* Best Practices */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Best Practices</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Organization Tips</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Use consistent naming conventions for projects and notes</li>
                <li>• Create templates for recurring research formats</li>
                <li>• Regularly tag and categorize your content</li>
                <li>• Set up folder structures before starting large projects</li>
                <li>• Use the favorites feature for frequently accessed items</li>
              </ul>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center mb-4">
                <Users className="w-6 h-6 text-blue-600 mr-2" />
                <h3 className="text-lg font-semibold text-gray-900">Collaboration Guidelines</h3>
              </div>
              <ul className="space-y-2 text-gray-700">
                <li>• Establish clear roles and permissions for team members</li>
                <li>• Use comments for feedback rather than direct edits</li>
                <li>• Regular sync meetings to review shared research</li>
                <li>• Create shared style guides for consistent formatting</li>
                <li>• Use version control for important documents</li>
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How do I import my existing research?</h3>
              <p className="text-gray-600">
                You can import documents, notes, and citations through our import wizard. We support 
                formats from most major research tools including Word documents, PDFs, and citation files.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I work offline?</h3>
              <p className="text-gray-600">
                Yes! Our desktop and mobile apps support offline editing. Your changes will sync 
                automatically when you reconnect to the internet.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">How secure is my research data?</h3>
              <p className="text-gray-600">
                We use enterprise-grade encryption and security measures. Your data is encrypted 
                in transit and at rest, and we comply with academic data protection standards.
              </p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-2">Can I export my data?</h3>
              <p className="text-gray-600">
                Absolutely! You can export your research in various formats including Word, PDF, 
                LaTeX, and standard citation formats. You own your data completely.
              </p>
            </div>
          </div>
        </section>

        {/* Getting Help */}
        <section className="text-center bg-blue-50 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Need More Help?</h2>
          <p className="text-gray-600 mb-6">
            Our support team and community are here to help you succeed with your research.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => onNavigate('contact')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Contact Support
            </button>
            <button
              onClick={() => onNavigate('home')}
              className="border border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Join Community
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}