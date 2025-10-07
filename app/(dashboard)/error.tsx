'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to error reporting service
    console.error('Dashboard error:', error)
  }, [error])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Error</h1>
        <p className="text-text-secondary mt-1">
          Something went wrong while loading this page
        </p>
      </div>

      <div className="bg-surface border border-border rounded-lg p-8">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            Oops! An error occurred
          </h2>
          <p className="text-text-secondary mb-6">
            We encountered an unexpected error. Please try again.
          </p>
          
          {error.message && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4 mb-6 max-w-lg mx-auto">
              <p className="text-sm text-error font-mono text-left">{error.message}</p>
            </div>
          )}

          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={reset}
              className="px-6 py-3 bg-accent text-background font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Try Again
            </button>
            <Link
              href="/today"
              className="px-6 py-3 bg-surface border border-border text-text-primary font-semibold rounded-lg hover:bg-surface-hover transition-colors inline-block"
            >
              Go to Today
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-surface border border-border text-text-primary font-semibold rounded-lg hover:bg-surface-hover transition-colors inline-block"
            >
              Go Home
            </Link>
          </div>

          <div className="mt-8 pt-8 border-t border-border">
            <p className="text-sm text-text-tertiary">
              If this error persists, please{' '}
              <a
                href="https://github.com/yourusername/winter-arc-tracker/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                report it on GitHub
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
