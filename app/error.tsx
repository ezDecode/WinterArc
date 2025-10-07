'use client'

import { useEffect } from 'react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Global error:', error)
  }, [error])

  return (
    <html>
      <body>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-surface border border-border rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-text-primary mb-2">
              Something went wrong
            </h1>
            <p className="text-text-secondary mb-6">
              An unexpected error occurred. We apologize for the inconvenience.
            </p>
            {error.message && (
              <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6">
                <p className="text-sm text-error font-mono">{error.message}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={reset}
                className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
              >
                Try Again
              </button>
              <a
                href="/"
                className="px-6 py-3 bg-surface border border-border text-text-primary font-semibold rounded-lg hover:bg-surface-hover transition-colors"
              >
                Go Home
              </a>
            </div>
          </div>
        </div>
      </body>
    </html>
  )
}
