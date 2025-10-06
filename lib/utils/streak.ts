import type { DailyEntry } from '@/types'

/**
 * Calculate current and longest streak from daily entries
 * A streak is consecutive days with a score of 5/5
 */
export function calculateStreaks(entries: DailyEntry[]): {
  currentStreak: number
  longestStreak: number
} {
  if (entries.length === 0) {
    return { currentStreak: 0, longestStreak: 0 }
  }

  // Sort entries by date (most recent first)
  const sortedEntries = [...entries].sort((a, b) => 
    new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
  )

  let currentStreak = 0
  let longestStreak = 0
  let tempStreak = 0

  // Calculate current streak (from most recent perfect day)
  for (const entry of sortedEntries) {
    if (entry.daily_score === 5) {
      currentStreak++
    } else {
      break
    }
  }

  // Calculate longest streak
  for (const entry of sortedEntries.reverse()) {
    if (entry.daily_score === 5) {
      tempStreak++
      longestStreak = Math.max(longestStreak, tempStreak)
    } else {
      tempStreak = 0
    }
  }

  return {
    currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
  }
}

/**
 * Get streak color based on length
 */
export function getStreakColor(streak: number): string {
  if (streak === 0) return 'text-text-tertiary'
  if (streak < 7) return 'text-warning'
  return 'text-success'
}
