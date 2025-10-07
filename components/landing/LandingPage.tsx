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
  ArrowRight,
  Star,
  Users,
  Clock,
  Sparkles,
  Trophy,
  Shield,
  Flame,
  ChevronRight,
  Check,
  X
} from 'lucide-react'

const MODAL_DELAY = 5000 // 5 seconds

export function LandingPage() {
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeTab, setActiveTab] = useState(0)

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

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTab((prev) => (prev + 1) % 3)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  const features = [
    { 
      icon: BookOpen, 
      title: 'Study Tracking', 
      desc: 'Track unlimited study hours with topic notes',
      color: 'from-purple-500 to-purple-600'
    },
    { 
      icon: Dumbbell, 
      title: 'Fitness Goals', 
      desc: '50 pushups daily split into 3 sets + extras',
      color: 'from-orange-500 to-red-600'
    },
    { 
      icon: Droplets, 
      title: 'Hydration', 
      desc: 'Monitor 8 bottles (4L) water intake daily',
      color: 'from-blue-500 to-cyan-600'
    },
    { 
      icon: Brain, 
      title: 'Meditation', 
      desc: 'Track mindfulness sessions and methods',
      color: 'from-indigo-500 to-blue-600'
    },
    { 
      icon: BookOpen, 
      title: 'Reading', 
      desc: 'Log books and pages read daily',
      color: 'from-green-500 to-emerald-600'
    },
    { 
      icon: BarChart3, 
      title: 'Analytics', 
      desc: 'Detailed progress charts and insights',
      color: 'from-pink-500 to-rose-600'
    },
  ]

  const steps = [
    {
      number: '01',
      title: 'Sign Up Free',
      desc: 'Create your account in seconds. No credit card required.',
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

  const testimonials = [
    {
      name: 'Alex Johnson',
      role: 'Software Engineer',
      image: '👨‍💻',
      quote: 'Winter Arc helped me maintain consistency for 90 days straight. The daily tracking is so simple yet powerful!',
      rating: 5
    },
    {
      name: 'Sarah Chen',
      role: 'Medical Student',
      image: '👩‍⚕️',
      quote: 'Perfect for tracking study hours and maintaining healthy habits during intense study periods. Game changer!',
      rating: 5
    },
    {
      name: 'Mike Rodriguez',
      role: 'Fitness Coach',
      image: '🏋️',
      quote: 'The habit tracking system is incredible. My clients love using it for their transformation journeys.',
      rating: 5
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
      a: 'A 90-day intensive personal development challenge focused on building 5 key daily habits: study, reading, exercise, meditation, and hydration.'
    },
    {
      q: 'Is it really free?',
      a: 'Yes! Winter Arc is completely free with no hidden costs. We believe everyone deserves access to powerful habit tracking tools.'
    },
    {
      q: 'Can I track more than the minimum requirements?',
      a: 'Absolutely! You can add unlimited study hours, extra pushups, and additional water bottles to track beyond the baseline goals.'
    },
    {
      q: 'What happens after 90 days?',
      a: 'You can continue using the tracker indefinitely! Many users complete multiple 90-day cycles to maintain their habits.'
    },
    {
      q: 'Do I need any special equipment?',
      a: 'No! Just yourself and your commitment. All activities can be done at home with minimal to no equipment required.'
    },
  ]

  return (
    <>
      <div className="min-h-screen bg-black overflow-x-hidden">
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          {/* Animated background */}
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-pink-500/10" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-purple-900/20 via-black to-black" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            {/* Badge */}
            <div className="text-center mb-8 animate-in">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full backdrop-blur-sm">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Transform in 90 Days</span>
                <Sparkles className="w-4 h-4 text-purple-400" />
              </div>
            </div>
            
            {/* Heading */}
            <h1 className="text-center text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-6 animate-in leading-tight">
              Your Journey to
              <span className="block mt-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 animate-gradient">
                Greatness Starts Here
              </span>
            </h1>
            
            {/* Subheading */}
            <p className="text-center text-xl text-text-secondary max-w-3xl mx-auto mb-12 animate-in leading-relaxed">
              Join the <span className="text-purple-400 font-semibold">Winter Arc</span> challenge. Build unbreakable habits, track your progress, and achieve your most ambitious goals in just 90 days.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 animate-in">
              <button
                onClick={() => router.push('/sign-up')}
                className="group px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2"
              >
                Start Your Arc Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => router.push('/sign-in')}
                className="px-10 py-5 bg-surface/50 backdrop-blur-sm border-2 border-border text-text-primary font-bold text-lg rounded-xl hover:bg-surface hover:border-purple-500/50 transition-all duration-300"
              >
                Sign In
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto animate-in">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-sm text-text-secondary font-medium">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-24 bg-gradient-to-b from-black to-surface/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                <Zap className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Powerful Features</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Everything You Need to Succeed
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Comprehensive tracking tools designed to keep you motivated and on track every single day.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="group bg-surface border border-border rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-text-primary mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-text-secondary leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="relative py-24 bg-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Simple Process</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Get Started in Minutes
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                Four simple steps to begin your transformation journey.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-purple-500/50 to-transparent -translate-x-8" />
                  )}
                  <div className="bg-surface border border-border rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 h-full">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-6 shadow-lg">
                      <step.icon className="w-7 h-7 text-white" />
                    </div>
                    <div className="text-5xl font-black text-purple-500/20 mb-4">
                      {step.number}
                    </div>
                    <h3 className="text-xl font-bold text-text-primary mb-3">
                      {step.title}
                    </h3>
                    <p className="text-text-secondary">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative py-24 bg-gradient-to-b from-surface/20 to-black">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                <Users className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Success Stories</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Loved by Thousands
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                See what our community has achieved with Winter Arc.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className={`bg-surface border border-border rounded-2xl p-8 transition-all duration-500 ${
                    activeTab === index ? 'scale-105 border-purple-500/50 shadow-2xl shadow-purple-500/20' : 'hover:border-purple-500/30'
                  }`}
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-text-primary mb-6 leading-relaxed italic">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="text-4xl">{testimonial.image}</div>
                    <div>
                      <div className="font-bold text-text-primary">{testimonial.name}</div>
                      <div className="text-sm text-text-secondary">{testimonial.role}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="relative py-24 bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-4">
                <Shield className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-purple-300 font-medium">Simple Pricing</span>
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Free Forever
              </h2>
              <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                No tricks, no trials. Everything you need to succeed is 100% free.
              </p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-2 border-purple-500/50 rounded-3xl p-12 text-center backdrop-blur-sm shadow-2xl shadow-purple-500/20">
              <div className="text-6xl font-black text-white mb-4">$0</div>
              <div className="text-2xl font-bold text-text-primary mb-8">Forever Free</div>
              
              <ul className="space-y-4 mb-10 text-left max-w-md mx-auto">
                {[
                  'Unlimited habit tracking',
                  'Real-time auto-save',
                  'Advanced analytics & charts',
                  '90-day challenge framework',
                  'Mobile & desktop access',
                  'No ads, ever',
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-success" />
                    </div>
                    <span className="text-text-primary font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => router.push('/sign-up')}
                className="w-full max-w-md px-10 py-5 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-105"
              >
                Start Your Journey Free
              </button>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="relative py-24 bg-gradient-to-b from-black to-surface/20">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl sm:text-5xl font-black text-white mb-6">
                Frequently Asked Questions
              </h2>
              <p className="text-xl text-text-secondary">
                Everything you need to know about Winter Arc.
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group bg-surface border border-border rounded-xl p-6 hover:border-purple-500/50 transition-all duration-300"
                >
                  <summary className="flex items-center justify-between cursor-pointer font-bold text-text-primary text-lg">
                    {faq.q}
                    <ChevronRight className="w-5 h-5 text-text-secondary group-open:rotate-90 transition-transform" />
                  </summary>
                  <p className="mt-4 text-text-secondary leading-relaxed">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative py-32 bg-black overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-black to-pink-500/10" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-3xl" />
          </div>
          
          <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-full mb-8">
              <Flame className="w-4 h-4 text-purple-400" />
              <span className="text-sm text-purple-300 font-medium">Start Today</span>
            </div>
            
            <h2 className="text-5xl sm:text-6xl font-black text-white mb-6">
              Ready to Transform
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Your Life?
              </span>
            </h2>
            
            <p className="text-xl text-text-secondary mb-12 max-w-2xl mx-auto leading-relaxed">
              Join thousands of users who are already building better habits and achieving their goals. Your 90-day journey starts now.
            </p>

            <button
              onClick={() => router.push('/sign-up')}
              className="group px-12 py-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-xl rounded-xl hover:shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 hover:scale-110 flex items-center gap-3 mx-auto"
            >
              Start Your Arc Free
              <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>

            <p className="text-sm text-text-tertiary mt-8">
              No credit card required • Get started in 30 seconds
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className="relative py-12 bg-surface border-t border-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4">
                Winter Arc Tracker
              </div>
              <p className="text-text-secondary text-sm">
                Transform your life in 90 days. © 2025 All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>

      {/* Auth Prompt Modal */}
      <AuthPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  )
}