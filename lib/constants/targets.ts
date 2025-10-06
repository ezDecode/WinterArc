/**
 * Core habit targets for the Winter Arc
 */

export const TARGETS = {
  STUDY: {
    name: 'Study',
    description: '4 × 1-hour focused study blocks',
    requirement: '4 blocks',
    points: 1,
    icon: '📚',
  },
  READING: {
    name: 'Reading',
    description: 'Read at least 10 pages',
    requirement: '10+ pages',
    points: 1,
    icon: '📖',
  },
  PUSHUPS: {
    name: 'Pushups',
    description: '50+ pushups (20+15+15+extras)',
    requirement: '50+ total',
    points: 1,
    icon: '💪',
  },
  MEDITATION: {
    name: 'Meditation',
    description: '10-20 minutes of meditation',
    requirement: '10-20 min',
    points: 1,
    icon: '🧘',
  },
  WATER: {
    name: 'Water Intake',
    description: 'Drink 4L of water (8 × 500ml)',
    requirement: '8 bottles',
    points: 1,
    icon: '💧',
  },
} as const

export const TOTAL_DAYS = 90
export const TOTAL_WEEKS = 13
export const DAILY_MAX_SCORE = 5

export const DEFAULT_TIMEZONE = 'Asia/Kolkata'

export const WATER_BOTTLES_COUNT = 8
export const STUDY_BLOCKS_COUNT = 4

export const SCORE_COLORS = {
  PERFECT: '#10b981', // green (5/5)
  GOOD: '#f59e0b',    // amber (3-4/5)
  LOW: '#ef4444',     // red (0-2/5)
  FUTURE: '#6b7280',  // gray (future dates)
} as const
