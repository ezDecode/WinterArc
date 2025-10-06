'use client'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
}

export function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-surface border border-error/20 rounded-lg p-8">
          <svg
            className="w-16 h-16 mx-auto mb-4 text-error"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Something went wrong
          </h3>
          <p className="text-text-secondary mb-6">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="px-6 py-2 bg-accent text-background rounded-lg font-medium hover:bg-text-primary transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
