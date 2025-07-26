The code edits primarily focus on fixing the layout of the pricing page.
```

```replit_final_file
import React from 'react'
import { Check, ArrowLeft, Star, Zap, Crown, Rocket } from 'lucide-react'

interface PricingPageProps {
  onNavigate: (page: string) => void
}

export default function PricingPage({ onNavigate }: PricingPageProps) {
  const plans = [
    {
      name: 'Free',
      price: '$0',
      period: 'forever',
      icon: Star,
      color: 'blue',
      popular: false,
      description: 'Perfect for individual researchers getting started',
      features: [
        'Up to 100 notes',
        'Basic text editor',
        '1GB storage',
        'Basic search',
        'Community support',
        'Export to PDF'
      ]
    },
    {
      name: 'Pro',
      price: '$9',
      period: 'per month',
      icon: Zap,
      color: 'purple',
      popular: true,
      description: 'Ideal for serious researchers and academics',
      features: [
        'Unlimited notes',
        'Advanced rich text editor',
        '50GB storage',
        'AI-powered search',
        'Priority support',
        'Advanced citations',
        'Collaboration tools',
        'Version history',
        'Custom templates'
      ]
    },
    {
      name: 'Team',
      price: '$29',
      period: 'per month',
      icon: Crown,
      color: 'green',
      popular: false,
      description: 'Best for research teams and organizations',
      features: [
        'Everything in Pro',
        'Up to 10 team members',
        '500GB shared storage',
        'Real-time collaboration',
        'Admin dashboard',
        'Team analytics',
        'Custom integrations',
        'Advanced permissions',
        'Priority phone support'
      ]
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      period: 'contact us',
      icon: Rocket,
      color: 'orange',
      popular: false,
      description: 'For large institutions with specific needs',
      features: [
        'Everything in Team',
        'Unlimited team members',
        'Unlimited storage',
        'Custom deployment',
        'SSO integration',
        'Advanced security',
        'Dedicated support',
        'Custom training',
        'SLA guarantee'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Pricing Plans</h1>
            <p className="text-xl text-gray-600">Choose the perfect plan for your research needs</p>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </button>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Research Plan
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select the perfect plan for your research needs. Upgrade or downgrade at any time.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan) => {
            const IconComponent = plan.icon
            return (
              <div
                key={plan.name}
                className={`relative bg-white rounded-2xl shadow-lg border-2 ${
                  plan.popular ? 'border-purple-500' : 'border-gray-200'
                } hover:shadow-xl transition-shadow`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-purple-500 text-white px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Icon */}
                  <div className={`inline-flex p-3 rounded-lg mb-4 bg-${plan.color}-100`}>
                    <IconComponent className={`w-6 h-6 text-${plan.color}-600`} />
                  </div>

                  {/* Plan Name & Price */}
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.price !== 'Custom' && (
                      <span className="text-gray-600 ml-2">/{plan.period}</span>
                    )}
                  </div>
                  <p className="text-gray-600 mb-6">{plan.description}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${
                      plan.popular
                        ? 'bg-purple-600 text-white hover:bg-purple-700'
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    {plan.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* FAQ Section */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          <div className="grid md:grid-cols-2 gap-8 text-left max-w-4xl mx-auto">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">All paid plans come with a 14-day free trial. No credit card required to start.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">We accept all major credit cards, PayPal, and can arrange invoicing for Enterprise customers.</p>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">Yes, we use enterprise-grade encryption and security measures to protect your research data.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}