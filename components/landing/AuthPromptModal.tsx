'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap, TrendingUp, Calendar } from 'lucide-react'

interface AuthPromptModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AuthPromptModal({ isOpen, onClose }: AuthPromptModalProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Small delay for animation
      setTimeout(() => setIsVisible(true), 10)
      
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
      
      // Add ESC key listener
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose()
      }
      window.addEventListener('keydown', handleEsc)
      
      return () => {
        document.body.style.overflow = ''
        window.removeEventListener('keydown', handleEsc)
      }
    } else {
      setIsVisible(false)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div
        className={`relative bg-surface border border-border rounded-2xl p-8 max-w-md w-full shadow-2xl transition-all duration-300 ${
          isVisible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'
        }`}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-background hover:bg-border transition-colors flex items-center justify-center"
          aria-label="Close"
        >
          <X className="w-5 h-5 text-text-secondary" />
        </button>

        {/* Content */}
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/50">
              <Zap className="w-8 h-8 text-white" />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-text-primary mb-3">
            Ready to Start Your Journey?
          </h2>

          {/* Description */}
          <p className="text-text-secondary mb-6">
            Join thousands of users tracking their 90-day Winter Arc challenge. Build better habits, stay consistent, and achieve your goals.
          </p>

          {/* Features */}
          <div className="space-y-3 mb-8 text-left">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-purple-400" />
              </div>
              <span className="text-sm text-text-secondary">Track daily habits & progress</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-4 h-4 text-blue-400" />
              </div>
              <span className="text-sm text-text-secondary">90-day challenge framework</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                <Zap className="w-4 h-4 text-green-400" />
              </div>
              <span className="text-sm text-text-secondary">Real-time auto-save & sync</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => router.push('/sign-up')}
              className="w-full py-3 px-6 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-200"
            >
              Create Free Account
            </button>
            <button
              onClick={() => router.push('/sign-in')}
              className="w-full py-3 px-6 bg-background border border-border text-text-primary font-semibold rounded-xl hover:bg-surface transition-colors"
            >
              Sign In
            </button>
          </div>

          {/* Footer text */}
          <p className="text-xs text-text-tertiary mt-6">
            No credit card required • Start tracking in seconds
          </p>
        </div>
      </div>
    </div>
  )
}
