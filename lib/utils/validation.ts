import { z } from 'zod'

/**
 * Common validation schemas for API endpoints
 */

// Date validation (YYYY-MM-DD format)
export const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format')

// Email validation
export const emailSchema = z.string().email('Invalid email format')

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format')

// Score validation (0-5 range)
export const scoreSchema = z.number().min(0).max(5)

// Week number validation (1-13)
export const weekNumberSchema = z.number().min(1).max(13)

// Timezone validation (basic check)
export const timezoneSchema = z.string().min(1).max(50)

// Daily entry validation
export const dailyEntrySchema = z.object({
  entry_date: dateSchema,
  study_blocks: z.array(z.object({
    checked: z.boolean(),
    topic: z.string().max(100)
  })).optional(),
  reading: z.object({
    checked: z.boolean(),
    bookName: z.string().max(100),
    pages: z.number().min(0).max(1000)
  }).optional(),
  pushups: z.object({
    set1: z.boolean(),
    set2: z.boolean(),
    set3: z.boolean(),
    extras: z.number().min(0).max(100)
  }).optional(),
  meditation: z.object({
    checked: z.boolean(),
    method: z.string().max(50),
    duration: z.number().min(0).max(120)
  }).optional(),
  water_bottles: z.array(z.boolean()).optional(),
  notes: z.object({
    morning: z.string().max(500).optional(),
    evening: z.string().max(500).optional(),
    general: z.string().max(1000).optional()
  }).optional(),
  daily_score: scoreSchema.optional(),
  is_complete: z.boolean().optional()
})

// Profile update validation
export const profileUpdateSchema = z.object({
  timezone: timezoneSchema.optional(),
  arc_start_date: dateSchema.optional(),
  metadata: z.record(z.string(), z.any()).optional()
})

// Weekly review validation
export const weeklyReviewSchema = z.object({
  week_number: weekNumberSchema,
  review_date: dateSchema,
  days_hit_all: z.number().min(0).max(7),
  what_helped: z.string().max(1000).optional(),
  what_blocked: z.string().max(1000).optional(),
  next_week_change: z.string().max(1000).optional()
})

// Checkpoint notes validation
export const checkpointNotesSchema = z.object({
  week_number: weekNumberSchema,
  notes: z.string().max(2000).optional()
})

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  return input
    .replace(/[<>]/g, '') // Remove < and > characters
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
}

/**
 * Validate and sanitize user input
 */
export function validateAndSanitize<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  
  if (!result.success) {
    throw new Error(`Validation error: ${result.error.issues.map(e => e.message).join(', ')}`)
  }
  
  return result.data
}

/**
 * Rate limiting configuration
 */
export const RATE_LIMITS = {
  API: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  },
  EMAIL: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // limit each user to 5 emails per hour
  },
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 auth attempts per windowMs
  }
} as const
