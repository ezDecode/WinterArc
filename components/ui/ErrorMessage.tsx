'use client'

import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  title?: string
  variant?: 'error' | 'warning' | 'info'
}

export function ErrorMessage({ 
  message, 
  onRetry, 
  title = "Something went wrong",
  variant = 'error' 
}: ErrorMessageProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return {
          border: 'border-warning/20',
          background: 'bg-warning/5',
          icon: 'text-warning',
          iconBg: 'bg-warning/10'
        }
      case 'info':
        return {
          border: 'border-blue-500/20',
          background: 'bg-blue-500/5',
          icon: 'text-blue-400',
          iconBg: 'bg-blue-500/10'
        }
      default:
        return {
          border: 'border-error/20',
          background: 'bg-error/5',
          icon: 'text-error',
          iconBg: 'bg-error/10'
        }
    }
  }

  const styles = getVariantStyles()

  return (
    <div className="flex items-center justify-center min-h-[400px] p-4">
      <div className="max-w-md mx-auto text-center animate-in">
        <div className={`bg-surface ${styles.border} ${styles.background} rounded-xl p-6 sm:p-8 shadow-sm`}>
          <div className={`w-16 h-16 mx-auto mb-4 ${styles.iconBg} rounded-full flex items-center justify-center`}>
            <AlertTriangle className={`w-8 h-8 ${styles.icon}`} aria-hidden="true" />
          </div>
          
          <h3 
            className="text-lg sm:text-xl font-semibold text-text-primary mb-2"
            id="error-title"
          >
            {title}
          </h3>
          
          <p 
            className="text-text-secondary mb-6 leading-relaxed text-sm sm:text-base"
            id="error-message"
          >
            {message}
          </p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 focus:outline-none     transition-all duration-200"
              aria-describedby="error-title error-message"
            >
              <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
              Try Again
            </button>
          )}
          
          <div className="mt-4 text-xs text-text-tertiary">
            If the problem persists, please refresh the page
          </div>
        </div>
      </div>
    </div>
  )
}
