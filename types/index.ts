export interface StudyBlock {
  checked: boolean
  topic: string
}

export interface Reading {
  checked: boolean
  bookName: string
  pages: number
}

export interface Pushups {
  set1: boolean // 20 pushups
  set2: boolean // 15 pushups
  set3: boolean // 15 pushups
  extras: number // additional pushups beyond 50
}

export interface Meditation {
  checked: boolean
  method: string
  duration: number // in minutes
}

export interface Notes {
  morning?: string
  evening?: string
  general?: string
}

export interface DailyEntry {
  id: string
  user_id: string
  entry_date: string
  study_blocks: StudyBlock[]
  reading: Reading
  pushups: Pushups
  meditation: Meditation
  water_bottles: boolean[]
  notes: Notes
  daily_score: number
  is_complete: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  clerk_user_id: string
  email: string
  timezone: string
  arc_start_date: string
  created_at: string
  updated_at: string
}

export interface WeeklyReview {
  id: string
  user_id: string
  week_number: number
  review_date: string
  days_hit_all: number
  what_helped: string | null
  what_blocked: string | null
  next_week_change: string | null
  created_at: string
}

export interface CheckpointNote {
  id: string
  user_id: string
  week_number: number
  notes: string | null
  created_at: string
  updated_at: string
}

// Utility types for API responses
export interface StreakData {
  currentStreak: number
  longestStreak: number
}

export interface DashboardStats {
  totalDays: number
  completedDays: number
  completionPercentage: number
  currentStreak: number
  longestStreak: number
  targetCompletionRates: {
    study: number
    reading: number
    pushups: number
    meditation: number
    water: number
  }
  weeklyAverageScore: number
}

export interface ScorecardData {
  weeks: {
    weekNumber: number
    days: {
      date: string
      score: number
      isFuture: boolean
      isEmpty?: boolean // For padding days before/after the 90-day arc
    }[]
    weekTotal: number
  }[]
}
