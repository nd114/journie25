
import React, { useState } from 'react'
import { Check, ChevronRight, MapPin, User, Target, Heart, ArrowLeft } from 'lucide-react'

interface OnboardingFlowProps {
  onComplete: (data: OnboardingData) => void
  onBack?: () => void
}

interface OnboardingData {
  country: string
  role: string
  customRole?: string
  interests: string[]
  goals: string[]
}

const countries = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 
  'France', 'Japan', 'Brazil', 'India', 'China', 'South Africa', 'Nigeria',
  'Mexico', 'Italy', 'Spain', 'Netherlands', 'Sweden', 'Other'
]

const roles = [
  'Student', 'Professor', 'Theologian', 'Doctor', 'Researcher', 
  'Scientist', 'Engineer', 'Designer', 'Writer', 'Journalist',
  'Entrepreneur', 'Consultant', 'Analyst', 'Other'
]

const interests = [
  'Biology', 'Neurology', 'Artificial Intelligence', 'Design', 'Startups',
  'Psychology', 'Medicine', 'Technology', 'Literature', 'History',
  'Philosophy', 'Economics', 'Physics', 'Chemistry', 'Mathematics',
  'Sociology', 'Anthropology', 'Political Science', 'Environmental Science',
  'Data Science', 'Machine Learning', 'Blockchain', 'Sustainability'
]

export default function OnboardingFlow({ onComplete, onBack }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<OnboardingData>({
    country: '',
    role: '',
    customRole: '',
    interests: [],
    goals: []
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const steps = [
    { title: 'Location', icon: MapPin, description: 'Where are you located?' },
    { title: 'Role', icon: User, description: 'What\'s your professional role?' },
    { title: 'Interests', icon: Heart, description: 'What topics interest you?' },
    { title: 'Goals', icon: Target, description: 'What are your research goals?' }
  ]

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {}

    switch (step) {
      case 0:
        if (!data.country) newErrors.country = 'Please select your country'
        break
      case 1:
        if (!data.role) newErrors.role = 'Please select your role'
        if (data.role === 'Other' && !data.customRole) {
          newErrors.customRole = 'Please specify your role'
        }
        break
      case 2:
        if (data.interests.length === 0) {
          newErrors.interests = 'Please select at least one interest'
        }
        break
      case 3:
        if (data.goals.length === 0) {
          newErrors.goals = 'Please add at least one goal'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1)
      } else {
        onComplete(data)
      }
    }
  }

  const handleInterestToggle = (interest: string) => {
    setData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  const handleGoalAdd = (goal: string) => {
    if (goal.trim() && !data.goals.includes(goal.trim())) {
      setData(prev => ({
        ...prev,
        goals: [...prev.goals, goal.trim()]
      }))
    }
  }

  const handleGoalRemove = (goal: string) => {
    setData(prev => ({
      ...prev,
      goals: prev.goals.filter(g => g !== goal)
    }))
  }

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your country
            </label>
            <select
              value={data.country}
              onChange={(e) => setData(prev => ({ ...prev, country: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Choose a country...</option>
              {countries.map(country => (
                <option key={country} value={country}>{country}</option>
              ))}
            </select>
            {errors.country && (
              <p className="text-red-500 text-sm">{errors.country}</p>
            )}
          </div>
        )

      case 1:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What's your professional role?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {roles.map(role => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setData(prev => ({ ...prev, role }))}
                  className={`p-3 text-left border rounded-lg hover:bg-gray-50 ${
                    data.role === role ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
            {data.role === 'Other' && (
              <input
                type="text"
                placeholder="Please specify your role"
                value={data.customRole}
                onChange={(e) => setData(prev => ({ ...prev, customRole: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            )}
            {errors.role && (
              <p className="text-red-500 text-sm">{errors.role}</p>
            )}
            {errors.customRole && (
              <p className="text-red-500 text-sm">{errors.customRole}</p>
            )}
          </div>
        )

      case 2:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select your interests (choose multiple)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {interests.map(interest => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => handleInterestToggle(interest)}
                  className={`p-2 text-left border rounded-lg hover:bg-gray-50 ${
                    data.interests.includes(interest) ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
            {data.interests.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600 mb-2">Selected interests:</p>
                <div className="flex flex-wrap gap-2">
                  {data.interests.map(interest => (
                    <span
                      key={interest}
                      className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {errors.interests && (
              <p className="text-red-500 text-sm">{errors.interests}</p>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              What are your research goals?
            </label>
            <GoalInput onAdd={handleGoalAdd} />
            {data.goals.length > 0 && (
              <div className="space-y-2">
                {data.goals.map((goal, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
                  >
                    <span className="text-sm">{goal}</span>
                    <button
                      onClick={() => handleGoalRemove(goal)}
                      className="text-red-500 hover:text-red-700 text-sm"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
            {errors.goals && (
              <p className="text-red-500 text-sm">{errors.goals}</p>
            )}
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-6 left-6 flex items-center text-blue-600 hover:text-blue-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </button>
      )}
      
      <div className="max-w-2xl w-full">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep
              
              return (
                <div key={index} className="flex items-center">
                  <div className={`
                    flex items-center justify-center w-10 h-10 rounded-full border-2
                    ${isCompleted ? 'bg-blue-600 border-blue-600 text-white' : 
                      isCurrent ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}
                  `}>
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-16 h-1 mx-2 ${
                      isCompleted ? 'bg-blue-600' : 'bg-gray-300'
                    }`} />
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-4 text-center">
            <h2 className="text-2xl font-bold text-gray-900">{steps[currentStep].title}</h2>
            <p className="text-gray-600">{steps[currentStep].description}</p>
          </div>
        </div>

        {/* Step content */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6">
          {renderStep()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between">
          <button
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
          >
            {currentStep === steps.length - 1 ? 'Complete Setup' : 'Next'}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>
    </div>
  )
}

function GoalInput({ onAdd }: { onAdd: (goal: string) => void }) {
  const [goal, setGoal] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (goal.trim()) {
      onAdd(goal)
      setGoal('')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        value={goal}
        onChange={(e) => setGoal(e.target.value)}
        placeholder="Enter a research goal..."
        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
      />
      <button
        type="submit"
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Add
      </button>
    </form>
  )
}
