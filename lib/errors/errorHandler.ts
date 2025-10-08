import { NextResponse } from 'next/server'
import { AppError } from './AppError'
import { ZodError } from 'zod'

/**
 * Centralized error handler for API routes
 * Converts various error types into consistent NextResponse objects
 */
export function handleApiError(error: unknown): NextResponse {
  // Log error for monitoring (in production, send to error tracking service like Sentry)
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.reduce((acc, issue) => {
      acc[issue.path.join('.')] = issue.message
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          fields: fieldErrors,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    )
  }

  // Handle our custom AppError instances
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Handle generic Error instances
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }

  // Handle unknown error types
  return NextResponse.json(
    {
      error: {
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}
