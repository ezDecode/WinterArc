'use client'

import { useState, useEffect, useCallback, memo } from 'react'
import { X, Sparkles } from 'lucide-react'
import type { MotivationMessage } from '@/lib/utils/motivation'
import { isHighImpactMessage } from '@/lib/utils/motivation'

interface MotivationNotificationProps {
  message: MotivationMessage | null
  onClose?: () => void
  autoHideDelay?: number
  showCloseButton?: boolean
  compact?: boolean
  className?: string
}

export const MotivationNotification = memo(function MotivationNotification({
  message,
  onClose,
  autoHideDelay = 4000,
  showCloseButton = true,
  compact = false,
  className = ''
}: MotivationNotificationProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const handleClose = useCallback(() => {
    setIsAnimating(false)
    setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, 300) // Match animation duration
  }, [onClose])

  useEffect(() => {
    if (message) {
      setIsVisible(true)
      setIsAnimating(true)
      
      // Auto hide after delay
      if (autoHideDelay > 0) {
        const hideTimer = setTimeout(() => {
          handleClose()
        }, autoHideDelay)
        
        return () => clearTimeout(hideTimer)
      }
    }
  }, [message, autoHideDelay, handleClose])


  if (!message || !isVisible) {
    return null
  }

  const getIntensityStyles = () => {
    switch (message.intensity) {
      case 'celebration':
        return {
          container: 'bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 border-purple-400/50 shadow-2xl shadow-purple-500/20',
          text: 'text-purple-100 font-bold',
          emoji: 'text-3xl animate-bounce',
          particle: true
        }
      case 'high':
        return {
          container: 'bg-gradient-to-r from-green-500/15 to-emerald-500/15 border-green-400/40 shadow-lg shadow-green-500/10',
          text: 'text-green-100 font-semibold',
          emoji: 'text-2xl',
          particle: true
        }
      case 'medium':
        return {
          container: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/30 shadow-md shadow-blue-500/10',
          text: 'text-blue-100 font-medium',
          emoji: 'text-xl',
          particle: false
        }
      case 'low':
        return {
          container: 'bg-gradient-to-r from-gray-500/10 to-slate-500/10 border-gray-400/20',
          text: 'text-gray-200',
          emoji: 'text-lg',
          particle: false
        }
    }
  }

  const getTypeIcon = () => {
    switch (message.type) {
      case 'completion':
        return '✅'
      case 'progress':
        return '📈'
      case 'encouragement':
        return '💪'
      case 'celebration':
        return '🎉'
      default:
        return '⭐'
    }
  }

  const styles = getIntensityStyles()
  const isHighImpact = isHighImpactMessage(message)

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`
          relative overflow-hidden rounded-xl border backdrop-blur-sm transition-all duration-300 max-w-sm
          ${styles.container}
          ${isAnimating ? 'animate-in slide-in-from-right-full' : 'animate-out slide-out-to-right-full'}
          ${compact ? 'p-3' : 'p-4'}
          ${isHighImpact ? 'animate-pulse' : ''}
        `}
        role="alert"
        aria-live={isHighImpact ? 'assertive' : 'polite'}
      >
        {/* Particle Effect for High Impact Messages */}
        {styles.particle && (
          <div className="absolute inset-0 pointer-events-none">
            <Sparkles className="absolute top-2 left-2 w-4 h-4 text-yellow-400 animate-pulse" />
            <Sparkles className="absolute top-3 right-6 w-3 h-3 text-pink-400 animate-pulse delay-100" />
            <Sparkles className="absolute bottom-2 left-4 w-3 h-3 text-blue-400 animate-pulse delay-200" />
          </div>
        )}

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-2 right-2 p-1 rounded-lg bg-black/20 hover:bg-black/40 text-white/60 hover:text-white transition-all duration-200 z-10"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div className={`flex items-start gap-3 ${showCloseButton ? 'pr-8' : ''}`}>
          {/* Message Icon/Emoji */}
          <div className="flex-shrink-0 flex items-center justify-center">
            <div className={`${styles.emoji} ${message.intensity === 'celebration' ? 'animate-spin' : ''}`}>
              {message.emoji}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Message Text */}
            <div className={`${styles.text} ${compact ? 'text-sm' : 'text-base'} leading-tight`}>
              {message.message}
            </div>

            {/* Type Badge */}
            {!compact && (
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs opacity-75 flex items-center gap-1">
                  <span>{getTypeIcon()}</span>
                  <span className="capitalize">{message.type}</span>
                </span>
                {message.intensity === 'celebration' && (
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce delay-200"></div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Progress Bar for Auto Hide */}
        {autoHideDelay > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div
              className="h-full bg-gradient-to-r from-white/40 to-white/20"
              style={{
                animation: `shrink-width ${autoHideDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }

        .animate-in {
          animation: slideInFromRight 300ms ease-out forwards;
        }

        .animate-out {
          animation: slideOutToRight 300ms ease-in forwards;
        }

        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes slideOutToRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  )
})

// Hook for managing motivation notifications
export function useMotivationNotification() {
  const [currentMessage, setCurrentMessage] = useState<MotivationMessage | null>(null)

  const showMessage = (message: MotivationMessage) => {
    setCurrentMessage(message)
  }

  const clearMessage = () => {
    setCurrentMessage(null)
  }

  return {
    currentMessage,
    showMessage,
    clearMessage
  }
}

// Quick notification variants
interface QuickNotificationProps {
  message: MotivationMessage
  onClose?: () => void
}

export const TaskCompletionNotification = memo(function TaskCompletionNotification({
  message,
  onClose
}: QuickNotificationProps) {
  return (
    <MotivationNotification
      message={message}
      onClose={onClose}
      autoHideDelay={3000}
      compact={false}
      className="animate-bounce-once"
    />
  )
})

export const ProgressNotification = memo(function ProgressNotification({
  message,
  onClose
}: QuickNotificationProps) {
  return (
    <MotivationNotification
      message={message}
      onClose={onClose}
      autoHideDelay={2500}
      compact={true}
    />
  )
})

export const CelebrationNotification = memo(function CelebrationNotification({
  message,
  onClose
}: QuickNotificationProps) {
  return (
    <MotivationNotification
      message={message}
      onClose={onClose}
      autoHideDelay={6000}
      compact={false}
      showCloseButton={false}
      className="celebration-entrance"
    />
  )
})