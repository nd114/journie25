
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  BookOpen, 
  Users, 
  Lightbulb, 
  Target, 
  Zap, 
  ArrowRight,
  Search,
  MessageCircle,
  Star,
  Layers,
  Eye,
  Share2
} from 'lucide-react';
import Navbar from '../components/Navbar';

const HowItWorks: React.FC = () => {
  const features = [
    {
      icon: Lightbulb,
      title: 'Research Stories',
      description: 'Every paper becomes an engaging story with key insights, real-world impact, and why it matters.',
      benefits: ['Clear summaries for all audiences', 'Visual abstracts and infographics', 'Real-world applications highlighted']
    },
    {
      icon: Layers,
      title: 'Multi-Level Content',
      description: 'Choose your reading level - from general audience to expert technical detail.',
      benefits: ['Accessible for everyone', 'Customizable depth', 'Progressive learning paths']
    },
    {
      icon: Target,
      title: 'Cross-Field Discovery',
      description: 'Discover unexpected connections between different research areas and disciplines.',
      benefits: ['Interdisciplinary insights', 'Breakthrough opportunities', 'Broader perspective']
    },
    {
      icon: Users,
      title: 'Community Discussions',
      description: 'Join meaningful conversations with researchers and curious minds worldwide.',
      benefits: ['Expert interactions', 'Peer learning', 'Global research community']
    },
    {
      icon: Star,
      title: 'Knowledge Quests',
      description: 'Gamified learning journeys that reward exploration and engagement.',
      benefits: ['Achievement system', 'Learning motivation', 'Progress tracking']
    },
    {
      icon: Search,
      title: 'Smart Discovery',
      description: 'AI-powered recommendations help you find research that matches your interests.',
      benefits: ['Personalized feeds', 'Trending topics', 'Serendipitous discoveries']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            How Our Platform
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600"> Transforms Research</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Discover how we're revolutionizing the way research is shared, understood, and connected 
            across disciplines and audiences.
          </p>
        </div>

        {/* Step-by-Step Process */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Your Research Journey</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              {
                step: '1',
                title: 'Discover',
                description: 'Browse research stories by field, trending topics, or personalized recommendations',
                icon: Search
              },
              {
                step: '2',
                title: 'Understand',
                description: 'Read at your level with multi-layered content from basic to expert',
                icon: Eye
              },
              {
                step: '3',
                title: 'Engage',
                description: 'Join discussions, ask questions, and share insights with the community',
                icon: MessageCircle
              },
              {
                step: '4',
                title: 'Share',
                description: 'Spread knowledge and inspire others through social sharing and collaboration',
                icon: Share2
              }
            ].map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="text-center">
                  <div className="relative mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                      {step.step}
                    </div>
                    <Icon className="w-8 h-8 text-indigo-600 mx-auto" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Platform Features</h2>
          <div className="grid lg:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-lg transition-all">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <ul className="space-y-2">
                        {feature.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                            <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full"></div>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* For Different Audiences */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Built for Everyone</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'Researchers',
                description: 'Discover new perspectives, collaborate across fields, and share your work with broader audiences.',
                features: ['Cross-field insights', 'Collaboration tools', 'Impact tracking', 'Visual abstract creation']
              },
              {
                title: 'Students',
                description: 'Learn from the latest research with content adapted to your level and learning style.',
                features: ['Multi-level explanations', 'Learning quests', 'Study groups', 'Progress tracking']
              },
              {
                title: 'Curious Minds',
                description: 'Explore fascinating discoveries and understand how research impacts your world.',
                features: ['Accessible stories', 'Real-world connections', 'Expert discussions', 'Trending discoveries']
              }
            ].map((audience, index) => (
              <div key={index} className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-3">{audience.title}</h3>
                <p className="text-gray-600 mb-4">{audience.description}</p>
                <ul className="space-y-2">
                  {audience.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm text-gray-700">
                      <Zap className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Technology Behind */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">Powered by Innovation</h2>
            <p className="text-xl opacity-90">
              Our platform combines cutting-edge technology with human insight to transform research communication.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: 'AI-Powered Summaries', description: 'Intelligent content adaptation for different audiences' },
              { title: 'Cross-Reference Engine', description: 'Discovers connections between research fields' },
              { title: 'Real-time Collaboration', description: 'Live discussions and shared annotations' },
              { title: 'Impact Analytics', description: 'Tracks research influence and engagement' }
            ].map((tech, index) => (
              <div key={index} className="text-center">
                <h3 className="font-bold mb-2">{tech.title}</h3>
                <p className="text-sm opacity-80">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Transform Your Research Experience?</h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community and discover research in a whole new way.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/library"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:shadow-lg transition-all text-lg font-medium"
            >
              <BookOpen className="w-5 h-5" />
              <span>Explore Research</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center space-x-2 px-8 py-4 bg-white text-indigo-600 border-2 border-indigo-200 rounded-xl hover:bg-indigo-50 transition-all text-lg font-medium"
            >
              <Users className="w-5 h-5" />
              <span>Join Community</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
