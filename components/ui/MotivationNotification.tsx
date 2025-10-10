'use client'

import { useState, useEffect, useRef, memo } from 'react'
import { X } from 'lucide-react'
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
  const [isExiting, setIsExiting] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const isInitialMount = useRef(true)

  const handleClose = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsExiting(true)
    setTimeout(() => {
      onClose?.()
    }, 250) // Match exit animation duration
  }

  useEffect(() => {
    if (message && !isExiting) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }

      // Set up auto-hide timer
      if (autoHideDelay > 0) {
        timeoutRef.current = setTimeout(() => {
          if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          setIsExiting(true)
          setTimeout(() => {
            onClose?.()
          }, 250)
        }, autoHideDelay)
      }

      // Mark as not initial mount after first render
      if (isInitialMount.current) {
        isInitialMount.current = false
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [message, autoHideDelay, isExiting, onClose])

  // Reset exit state when message changes
  useEffect(() => {
    if (message) {
      setIsExiting(false)
    }
  }, [message])

  if (!message) {
    return null
  }

  const getIntensityStyles = () => {
    switch (message.intensity) {
      case 'celebration':
        return {
          container: 'bg-surface border-purple-500/30 shadow-xl shadow-purple-500/5',
          accent: 'border-l-4 border-l-purple-500',
          text: 'text-text-primary font-semibold',
          emoji: 'text-2xl',
          glow: 'shadow-lg shadow-purple-500/10'
        }
      case 'high':
        return {
          container: 'bg-surface border-success/30 shadow-lg shadow-success/5',
          accent: 'border-l-4 border-l-success',
          text: 'text-text-primary font-medium',
          emoji: 'text-xl',
          glow: 'shadow-md shadow-success/8'
        }
      case 'medium':
        return {
          container: 'bg-surface border-blue-500/25 shadow-md shadow-blue-500/5',
          accent: 'border-l-4 border-l-blue-500',
          text: 'text-text-primary font-medium',
          emoji: 'text-lg',
          glow: 'shadow-sm shadow-blue-500/5'
        }
      case 'low':
        return {
          container: 'bg-surface border-border',
          accent: 'border-l-4 border-l-text-tertiary',
          text: 'text-text-secondary',
          emoji: 'text-base',
          glow: ''
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
  const isEntering = !isInitialMount.current

  return (
    <div className={`fixed top-4 right-4 z-50 ${className}`}>
      <div
        className={`
          relative rounded-xl border backdrop-blur-sm max-w-sm transition-all duration-250
          ${styles.container}
          ${styles.accent}
          ${styles.glow}
          ${compact ? 'p-3' : 'p-4'}
          ${isExiting 
            ? 'transform translate-x-full opacity-0 scale-95' 
            : isEntering 
              ? 'transform translate-x-0 opacity-100 scale-100 animate-in' 
              : 'transform translate-x-0 opacity-100 scale-100'
          }
        `}
        role="alert"
        aria-live={isHighImpact ? 'assertive' : 'polite'}
      >

        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-3 right-3 p-1.5 rounded-lg bg-background/80 hover:bg-background text-text-tertiary hover:text-text-primary transition-colors duration-200 z-10"
            aria-label="Close notification"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Content */}
        <div className={`flex items-start gap-3 ${showCloseButton ? 'pr-10' : ''}`}>
          {/* Message Icon/Emoji */}
          <div className="flex-shrink-0 flex items-center justify-center pt-0.5">
            <div className={`${styles.emoji} transition-all duration-200 ${message.intensity === 'celebration' ? 'animate-pulse' : ''}`}>
              {message.emoji}
            </div>
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            {/* Message Text */}
            <div className={`${styles.text} ${compact ? 'text-sm' : 'text-base'} leading-relaxed`}>
              {message.message}
            </div>

            {/* Type Badge */}
            {!compact && (
              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-xs text-text-tertiary flex items-center gap-1.5 bg-background/50 px-2 py-1 rounded-md">
                  <span>{getTypeIcon()}</span>
                  <span className="capitalize font-medium">{message.type}</span>
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Subtle Progress Indicator */}
        {autoHideDelay > 0 && !isExiting && (
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-border/30 overflow-hidden">
            <div 
              className="h-full bg-text-tertiary/60 transition-all linear"
              style={{
                width: '100%',
                animation: `progress-shrink ${autoHideDelay}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>

      {/* Minimal CSS for progress animation */}
      <style jsx>{`
        @keyframes progress-shrink {
          from { width: 100%; }
          to { width: 0%; }
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
      autoHideDelay={3500}
      compact={false}
      showCloseButton={true}
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
      showCloseButton={false}
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
      autoHideDelay={8000}
      compact={false}
      showCloseButton={true}
    />
  )
})
