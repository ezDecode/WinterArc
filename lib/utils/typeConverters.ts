import type { Database } from '@/types/database'
import type { StudyBlock, Reading, Pushups, Meditation, Notes, DailyEntry } from '@/types'

/**
 * Type-safe converters for database operations
 * Eliminates the need for 'as any' casts
 */

/**
 * Convert DailyEntry to database insert format
 */
export function toDatabaseDailyEntry(
  entry: Partial<DailyEntry>
): Database['public']['Tables']['daily_entries']['Insert'] {
  return {
    user_id: entry.user_id!,
    entry_date: entry.entry_date!,
    study_blocks: entry.study_blocks as unknown as Database['public']['Tables']['daily_entries']['Insert']['study_blocks'],
    reading: entry.reading as unknown as Database['public']['Tables']['daily_entries']['Insert']['reading'],
    pushups: entry.pushups as unknown as Database['public']['Tables']['daily_entries']['Insert']['pushups'],
    meditation: entry.meditation as unknown as Database['public']['Tables']['daily_entries']['Insert']['meditation'],
    water_bottles: entry.water_bottles,
    notes: entry.notes as unknown as Database['public']['Tables']['daily_entries']['Insert']['notes'],
    daily_score: entry.daily_score ?? 0,
    is_complete: entry.is_complete ?? false,
  }
}

/**
 * Convert database row to DailyEntry type
 */
export function fromDatabaseDailyEntry(
  entry: Database['public']['Tables']['daily_entries']['Row']
): DailyEntry {
  return {
    id: entry.id,
    user_id: entry.user_id,
    entry_date: entry.entry_date,
    study_blocks: entry.study_blocks as unknown as StudyBlock[],
    reading: entry.reading as unknown as Reading,
    pushups: entry.pushups as unknown as Pushups,
    meditation: entry.meditation as unknown as Meditation,
    water_bottles: entry.water_bottles,
    notes: entry.notes as unknown as Notes,
    daily_score: entry.daily_score,
    is_complete: entry.is_complete,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  }
}

/**
 * Convert profile data to database insert format
 */
export function toDatabaseProfile(
  profile: Partial<Database['public']['Tables']['profiles']['Row']>
): Database['public']['Tables']['profiles']['Insert'] {
  return {
    clerk_user_id: profile.clerk_user_id!,
    email: profile.email!,
    timezone: profile.timezone ?? 'Asia/Kolkata',
    arc_start_date: profile.arc_start_date ?? new Date().toISOString().split('T')[0],
  }
}

/**
 * Create default daily entry data
 */
export function createDefaultDailyEntry(
  userId: string,
  entryDate: string
): Database['public']['Tables']['daily_entries']['Insert'] {
  return {
    user_id: userId,
    entry_date: entryDate,
    study_blocks: [
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' },
    ] as unknown as Database['public']['Tables']['daily_entries']['Insert']['study_blocks'],
    reading: { checked: false, bookName: '', pages: 0 } as unknown as Database['public']['Tables']['daily_entries']['Insert']['reading'],
    pushups: { set1: false, set2: false, set3: false, extras: 0 } as unknown as Database['public']['Tables']['daily_entries']['Insert']['pushups'],
    meditation: { checked: false, method: '', duration: 0 } as unknown as Database['public']['Tables']['daily_entries']['Insert']['meditation'],
    water_bottles: [false, false, false, false, false, false, false, false],
    notes: { morning: '', evening: '', general: '' } as unknown as Database['public']['Tables']['daily_entries']['Insert']['notes'],
    daily_score: 0,
    is_complete: false,
  }
}

