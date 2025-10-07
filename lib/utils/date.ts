/**
 * Date utility functions for Winter Arc Tracker
 */

/**
 * Format date to YYYY-MM-DD string
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Get today's date in user's timezone
 */
export function getTodayDate(timezone: string = 'Asia/Kolkata'): string {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }
  const parts = new Intl.DateTimeFormat('en-CA', options).format(date)
  return parts // Returns in YYYY-MM-DD format
}

/**
 * Get user's local date in their timezone (alias for getTodayDate for clarity)
 */
export function getUserTodayLocalDate(timezone: string): string {
  return getTodayDate(timezone)
}

/**
 * Check if current time is user's local 4 AM (within 1 hour window)
 * Used for determining when to create new daily entries
 */
export function isUserLocalFourAM(now: Date, timezone: string): boolean {
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }
  const userHour = parseInt(new Intl.DateTimeFormat('en-US', options).format(now))
  return userHour === 4
}

/**
 * Get current hour in user's timezone
 */
export function getUserLocalHour(timezone: string): number {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
  }
  return parseInt(new Intl.DateTimeFormat('en-US', options).format(now))
}

/**
 * Get current time in user's timezone as Date object
 */
export function getUserLocalTime(timezone: string): Date {
  const now = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }
  const formatter = new Intl.DateTimeFormat('en-US', options)
  const parts = formatter.formatToParts(now)
  
  const year = parseInt(parts.find(p => p.type === 'year')?.value || '0')
  const month = parseInt(parts.find(p => p.type === 'month')?.value || '0') - 1
  const day = parseInt(parts.find(p => p.type === 'day')?.value || '0')
  const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0')
  const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0')
  const second = parseInt(parts.find(p => p.type === 'second')?.value || '0')
  
  return new Date(year, month, day, hour, minute, second)
}

/**
 * Calculate week number within the 90-day arc (1-13)
 */
export function getWeekNumber(startDate: Date, currentDate: Date): number {
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.min(Math.ceil(diffDays / 7), 13)
}

/**
 * Calculate day number within the 90-day arc (1-90)
 */
export function getDayNumber(startDate: Date, currentDate: Date): number {
  const diffTime = Math.abs(currentDate.getTime() - startDate.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.min(diffDays, 90)
}

/**
 * Get date range for a specific week
 */
export function getWeekDateRange(startDate: Date, weekNumber: number): { start: Date; end: Date } {
  const start = new Date(startDate)
  start.setDate(start.getDate() + (weekNumber - 1) * 7)
  
  const end = new Date(start)
  end.setDate(end.getDate() + 6)
  
  return { start, end }
}

/**
 * Check if date is in the future
 */
export function isFutureDate(date: string | Date): boolean {
  const checkDate = typeof date === 'string' ? new Date(date) : date
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  checkDate.setHours(0, 0, 0, 0)
  return checkDate > today
}

/**
 * Parse YYYY-MM-DD string to Date object
 */
export function parseDate(dateString: string): Date {
  return new Date(dateString + 'T00:00:00')
}

/**
 * Get all dates in a range
 */
export function getDateRange(startDate: Date, endDate: Date): Date[] {
  const dates: Date[] = []
  const currentDate = new Date(startDate)
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate))
    currentDate.setDate(currentDate.getDate() + 1)
  }
  
  return dates
}
