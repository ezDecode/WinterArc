'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AuthPromptModal } from './AuthPromptModal'
import { 
  Zap, 
  Calendar, 
  Target, 
  BarChart3,
  BookOpen,
  Dumbbell,
  Droplets,
  Brain,
  ArrowRight,
  Users,
  Clock,
  Sparkles,
  Trophy,
  Shield,
  Flame,
  ChevronRight,
  Check,
} from 'lucide-react'

const MODAL_DELAY = 5000 // 5 seconds

export function LandingPage() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    const visited = localStorage.getItem('winter-arc-visited')
    if (!visited) {
      const timer = setTimeout(() => {
        setShowAuthModal(true)
        localStorage.setItem('winter-arc-visited', 'true')
      }, MODAL_DELAY)
      return () => clearTimeout(timer)
    }
  }, [])

  const features = [
    { 
      icon: BookOpen, 
      title: 'Study Tracking', 
      desc: 'Track unlimited study hours with topic notes',
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: Dumbbell, 
      title: 'Fitness Goals', 
      desc: '50 pushups daily split into 3 sets + extras',
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: Droplets, 
      title: 'Hydration', 
      desc: 'Monitor 8 bottles (4L) water intake daily',
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: Brain, 
      title: 'Meditation', 
      desc: 'Track mindfulness sessions and methods',
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: BookOpen, 
      title: 'Reading', 
      desc: 'Log books and pages read daily',
      color: 'from-purple-600 to-purple-700'
    },
    { 
      icon: BarChart3, 
      title: 'Analytics', 
      desc: 'Detailed progress charts and insights',
      color: 'from-purple-600 to-purple-700'
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Sign Up',
      desc: 'Create your account in seconds.',
      icon: Users
    },
    {
      number: '02',
      title: 'Set Your Goals',
      desc: 'Start tracking 5 daily habits for your 90-day journey.',
      icon: Target
    },
    {
      number: '03',
      title: 'Track Daily',
      desc: 'Log your progress each day with our intuitive interface.',
      icon: Calendar
    },
    {
      number: '04',
      title: 'Achieve Results',
      desc: 'Build streaks, earn points, and transform in 90 days.',
      icon: Trophy
    },
  ]

  const stats = [
    { number: '10K+', label: 'Active Users' },
    { number: '500K+', label: 'Days Tracked' },
    { number: '98%', label: 'Success Rate' },
    { number: '4.9★', label: 'User Rating' },
  ]

  const faqs = [
    {
      q: 'What is the Winter Arc challenge?',
      a: 'A focused 90-day program to build 5 daily habits: study, reading, exercise, meditation, and hydration.'
    },
    {
      q: 'How does the $1.99 plan work?',
      a: 'One simple plan unlocks all features—no tiers, no hidden fees.'
    },
    {
      q: 'Can I track beyond the minimum?',
      a: 'Yes. Add extra study hours, pushups, and water bottles beyond the baseline goals.'
    },
  ]

  return (
    <>
      <section className="min-h-screen bg-black overflow-x-hidden" aria-label="Landing Page">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated background */}
          {/* <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-purple-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          </div> */}

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 pb-16 sm:pb-20">
            {/* Badge */}
            <div className="text-center mb-6 sm:mb-8 animate-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm transition-all duration-300 ease-out shadow-lg shadow-purple-500/10">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-xs sm:text-sm text-purple-300 font-medium">Transform in 90 Days</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-center text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium text-white mb-6 sm:mb-8 animate-in leading-tight">
              Your Journey to
              <span className="block mt-1 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300 animate-gradient">
                Greatness Starts Here
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-center text-base sm:text-lg text-text-secondary max-w-2xl mx-auto mb-8 sm:mb-10 animate-in leading-relaxed px-4">
              Join the <span className="text-purple-400 font-medium">Winter Arc</span> challenge. Build unbreakable habits, track your progress, and achieve your goals in 90 days.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-10 sm:mb-14 animate-in px-4">
              <button
                onClick={() => router.push('/sign-up')}
                className="group px-8 sm:px-10 py-4 sm:py-5 bg-purple-600 text-white font-medium text-base sm:text-lg rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 ease-out focus:outline-none   focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black flex items-center gap-2 w-full sm:w-auto justify-center min-h-[52px] sm:min-h-[56px] relative overflow-hidden shadow-lg"
                aria-label="Get started with Winter Arc for $1.99"
              >
                <span className="relative z-10">Get Started — $1.99</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-purple-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </button>
              <button
                onClick={() => router.push('/sign-in')}
                className="px-8 sm:px-10 py-4 sm:py-5 bg-surface/50 backdrop-blur-sm border border-border text-text-primary font-medium text-base sm:text-lg rounded-xl hover:bg-surface hover:border-purple-500/50 hover:shadow-lg transition-all duration-300 ease-out focus:outline-none   focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black w-full sm:w-auto justify-center min-h-[52px] sm:min-h-[56px] shadow-md"
                aria-label="Sign in to your Winter Arc account"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 max-w-4xl mx-auto animate-in px-4">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl sm:text-3xl font-medium text-purple-300 mb-1 transition-colors">
                    {stat.number}
                  </div>
                  <div className="text-xs sm:text-sm text-text-secondary font-normal">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-16 bg-gradient-to-b from-black to-surface/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-3 transition-all duration-300 ease-out">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Powerful Features</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                Everything You Need to Succeed
              </h2>
              <p className="text-base text-text-secondary max-w-xl mx-auto">
                Comprehensive tracking tools designed to keep you motivated and on track every single day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-surface border border-border rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 ease-out hover:shadow-xl hover:shadow-purple-500/10"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-12 h-12 rounded-xl bg-purple-600/90 flex items-center justify-center mb-5 shadow-md transition-transform duration-300`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed text-sm">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative py-16 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-3">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Simple Process</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                Get Started in Minutes
              </h2>
              <p className="text-base text-text-secondary max-w-xl mx-auto">
                Four simple steps to begin your transformation journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-14 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/40 to-transparent -translate-x-8" />
                  )}
                  <div className="bg-surface border border-border rounded-2xl p-6 hover:border-purple-500/50 transition-all duration-300 ease-out h-full">
                    <div className="w-12 h-12 rounded-xl bg-purple-600 flex items-center justify-center mb-5 shadow-md">
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-4xl font-medium text-purple-500/30 mb-3">
                      {step.number}
                    </div>
                    <h3 className="text-lg font-medium text-text-primary mb-2">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary text-sm">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative py-16 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-3">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Simple Pricing</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                $1.99 Plan
              </h2>
              <p className="text-base text-text-secondary max-w-xl mx-auto">
                Simple, affordable access to everything you need to succeed.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-purple-700/10 border border-purple-500/40 rounded-3xl p-10 text-center backdrop-blur-sm shadow-xl shadow-purple-500/10 transition-all duration-300 ease-out">
              <div className="text-5xl font-medium text-white mb-2">$1.99</div>
              <div className="text-lg font-medium text-text-primary mb-6">One Simple Plan</div>
              
              <ul className="space-y-3 mb-8 text-left max-w-md mx-auto">
                {[
                  'Unlimited habit tracking',
                  'Real-time auto-save',
                  'Advanced analytics & charts',
                  '90-day challenge framework',
                  'Mobile & desktop access',
                  'No ads, ever',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-purple-400" />
                    </div>
                    <span className="text-text-primary font-medium text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/sign-up')}
                className="w-full max-w-md px-8 py-4 bg-purple-600 text-white font-medium text-base rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 ease-out"
              >
                Get Started — $1.99
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-16 bg-gradient-to-b from-black to-surface/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl sm:text-4xl font-medium text-white mb-4">
                Frequently Asked Questions
              </h2>
              <p className="text-base text-text-secondary">
                Everything you need to know about Winter Arc.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-surface border border-border rounded-xl p-5 hover:border-purple-500/50 transition-all duration-300 ease-out"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-medium text-text-primary text-base">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-text-secondary group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-3 text-text-secondary leading-relaxed text-sm">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-20 bg-black overflow-hidden">
          {/* <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-purple-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl" />
          </div> */}
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-full mb-6">
              <Flame className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Start Today</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-medium text-white mb-4">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-400">
                Your Life?
              </span>
            </h2>
            
            <p className="text-base text-text-secondary mb-8 max-w-2xl mx-auto leading-relaxed">
              Join thousands who are already building better habits. Your 90-day journey starts now.
            </p>

            <button
              onClick={() => router.push('/sign-up')}
              className="group px-10 py-5 bg-purple-600 text-white font-medium text-base rounded-xl hover:shadow-xl hover:shadow-purple-500/40 transition-all duration-300 ease-out flex items-center gap-3 mx-auto"
            >
              Start for $1.99
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            <p className="text-sm text-text-tertiary mt-6">
              Secure checkout • Get started in 30 seconds
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-2xl font-medium text-transparent bg-clip-text bg-gradient-to-r from-purple-300 to-purple-400 mb-3">
                Winter Arc
              </div>
              <p className="text-text-secondary text-sm">
                Transform your life in 90 days. © 2025 All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </section>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}
