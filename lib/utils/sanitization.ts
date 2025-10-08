import { z } from 'zod'

/**
 * Text sanitization utilities
 * Prevents XSS attacks and ensures data quality
 */

/**
 * Sanitize text by removing HTML tags and limiting length
 * @param text - Text to sanitize
 * @param maxLength - Maximum length (default: 5000)
 * @returns Sanitized text
 */
export const sanitizeText = (text: string, maxLength: number = 5000): string => {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
}

/**
 * Zod schema for optional sanitized text
 */
export const sanitizedTextSchema = (maxLength: number = 5000) =>
  z
    .string()
    .max(maxLength)
    .transform((val) => sanitizeText(val, maxLength))
    .optional()
    .nullable()

/**
 * Zod schema for required sanitized text
 */
export const sanitizedRequiredTextSchema = (maxLength: number = 5000) =>
  z
    .string()
    .min(1)
    .max(maxLength)
    .transform((val) => sanitizeText(val, maxLength))

/**
 * Sanitize notes object
 */
export const notesSchema = z.object({
  morning: sanitizedTextSchema(2000),
  evening: sanitizedTextSchema(2000),
  general: sanitizedTextSchema(2000),
})

/**
 * Sanitize weekly review fields
 */
export const weeklyReviewSchema = z.object({
  week_number: z.number().int().min(1).max(13),
  review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days_hit_all: z.number().int().min(0).max(7),
  what_helped: sanitizedTextSchema(5000),
  what_blocked: sanitizedTextSchema(5000),
  next_week_change: sanitizedTextSchema(5000),
})
