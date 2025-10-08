'use client'

import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  message?: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'inline' | 'overlay'
}

export function LoadingSpinner({ 
  message = "Loading...", 
  size = 'md',
  variant = 'default' 
}: LoadingSpinnerProps) {
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'w-6 h-6'
      case 'lg':
        return 'w-16 h-16'
      default:
        return 'w-12 h-12'
    }
  }

  const getTextSize = () => {
    switch (size) {
      case 'sm':
        return 'text-sm'
      case 'lg':
        return 'text-lg'
      default:
        return 'text-base'
    }
  }

  if (variant === 'inline') {
    return (
      <div className="flex items-center gap-2" role="status" aria-label={message}>
        <Loader2 className={`${getSizeClasses()} animate-spin text-purple-400`} aria-hidden="true" />
        <span className={`text-text-secondary ${getTextSize()}`}>{message}</span>
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div 
        className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50" 
        role="status" 
        aria-label={message}
      >
        <div className="flex flex-col items-center space-y-4 bg-surface border border-border rounded-xl p-6 shadow-lg">
          <div className="relative">
            <Loader2 className={`${getSizeClasses()} animate-spin text-purple-400`} aria-hidden="true" />
            <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping" />
          </div>
          <p className={`text-text-secondary ${getTextSize()} font-medium`}>
            {message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4" role="status" aria-label={message}>
      <div className="flex flex-col items-center space-y-4 animate-in">
        <div className="relative">
          <Loader2 className={`${getSizeClasses()} animate-spin text-purple-400`} aria-hidden="true" />
          <div className="absolute inset-0 bg-purple-400/10 rounded-full animate-pulse" />
        </div>
        <div className="text-center">
          <p className={`text-text-secondary ${getTextSize()} font-medium mb-1`}>
            {message}
          </p>
          <div className="flex items-center justify-center space-x-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      </div>
    </div>
  )
}
