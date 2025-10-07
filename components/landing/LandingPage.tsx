'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPromptModal } from './AuthPromptModal'
import { 
  Zap, 
  TrendingUp, 
  Calendar, 
  Target, 
  Award, 
  BarChart3,
  BookOpen,
  Dumbbell,
  Droplets,
  Brain,
  CheckCircle2,
  ArrowRight
} from 'lucide-react'

const MODAL_DELAY = 5000 // 5 seconds

export function LandingPage() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [hasVisited, setHasVisited] = useState(false)

  useEffect(() => {
    // Check if user has already seen the modal
    const visited = localStorage.getItem('winter-arc-visited')
    if (visited) {
      setHasVisited(true)
      return
    }

    // Show modal after 5 seconds
    const timer = setTimeout(() => {
      setShowAuthModal(true)
      localStorage.setItem('winter-arc-visited', 'true')
    }, MODAL_DELAY)

    return () => clearTimeout(timer)
  }, [])

  const features = [
    { icon: BookOpen, title: 'Study Tracking', desc: 'Track your learning hours' },
    { icon: Dumbbell, title: 'Fitness Goals', desc: 'Daily pushup challenges' },
    { icon: Droplets, title: 'Hydration', desc: 'Monitor water intake' },
    { icon: Brain, title: 'Meditation', desc: 'Mindfulness tracking' },
  ]

  const benefits = [
    { icon: Target, text: '90-day structured challenge' },
    { icon: TrendingUp, text: 'Track 5 daily habits' },
    { icon: Award, text: 'Build lasting streaks' },
    { icon: BarChart3, text: 'Visualize your progress' },
  ]

  return (
    <>
      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-pink-500/10" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />

          {/* Content */}
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
            {/* Header */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6 animate-in">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">The Ultimate 90-Day Challenge</span>
              </div>
              
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 animate-in">
                Winter Arc
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  Tracker
                </span>
              </h1>
              
              <p className="text-xl text-text-secondary max-w-2xl mx-auto mb-10 animate-in">
                Transform your life in 90 days. Track habits, build streaks, and achieve your goals with our comprehensive tracking system.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in">
                <button
                  onClick={() => router.push('/sign-up')}
                  className="group px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105 flex items-center gap-2"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => router.push('/sign-in')}
                  className="px-8 py-4 bg-background border border-border text-text-primary font-semibold rounded-xl hover:bg-surface transition-colors"
                >
                  Sign In
                </button>
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="bg-surface border border-border rounded-xl p-6 hover:border-purple-500/50 transition-all duration-200 hover:scale-105 animate-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30">
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-text-secondary">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Benefits Section */}
            <div className="bg-surface border border-border rounded-2xl p-8 lg:p-12 animate-in">
              <div className="text-center mb-10">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
                  Why Winter Arc?
                </h2>
                <p className="text-text-secondary max-w-2xl mx-auto">
                  A comprehensive system designed to help you build lasting habits and track your transformation journey.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 bg-background rounded-xl hover:bg-border/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-5 h-5 text-purple-400" />
                    </div>
                    <span className="text-text-primary font-medium">{benefit.text}</span>
                    <CheckCircle2 className="w-5 h-5 text-success ml-auto" />
                  </div>
                ))}
              </div>
            </div>

            {/* Final CTA */}
            <div className="text-center mt-20">
              <p className="text-text-secondary mb-6">
                Join thousands of users already on their journey
              </p>
              <button
                onClick={() => router.push('/sign-up')}
                className="px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200 hover:scale-105"
              >
                Get Started Now - It's Free
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}