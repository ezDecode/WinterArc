/**
 * Application Error Classes
 * Provides structured error handling with status codes and error codes
 */

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public field?: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        field: this.field,
        details: this.details,
        timestamp: new Date().toISOString(),
      },
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', field, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'DB_ERROR', undefined, details)
    this.name = 'DatabaseError'
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests. Please try again later.', 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}

export class ConfigurationError extends AppError {
  constructor(message: string) {
    super(message, 500, 'CONFIG_ERROR')
    this.name = 'ConfigurationError'
  }
}
