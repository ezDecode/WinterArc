/**
 * Utility to ensure today's entry exists for a user
 * Used when user logs in, signs up, or visits /today for first time
 */

import { supabaseAdmin } from '@/lib/supabase/server'
import { getUserTodayLocalDate } from '@/lib/utils/date'
import { createDefaultDailyEntry } from '@/lib/utils/typeConverters'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Ensure today's daily entry exists for the user
 * Creates one if it doesn't exist
 * 
 * @param userId - Internal user ID (profile.id, not clerk_user_id)
 * @param timezone - User's timezone
 * @returns true if entry was created, false if already existed
 */
export async function ensureTodayEntry(
  userId: string,
  timezone: string
): Promise<boolean> {
  try {
    // Get today's date in user's timezone
    const todayDate = getUserTodayLocalDate(timezone)

    // Check if entry exists
    const { data: existingEntry } = await supabaseAdmin
      .from('daily_entries')
      .select('id')
      .eq('user_id', userId)
      .eq('entry_date', todayDate)
      .maybeSingle()

    // If entry exists, nothing to do
    if (existingEntry) {
      console.log(`[ensureTodayEntry] Entry already exists for user ${userId} on ${todayDate}`)
      return false
    }

    // Create new entry
    const entryData = createDefaultDailyEntry(userId, todayDate)

    const { error: insertError } = await (supabaseAdmin
      .from('daily_entries') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .insert(entryData)

    if (insertError) {
      // If error is duplicate key (entry was created concurrently), that's OK
      if (insertError.code === '23505') {
        console.log(`[ensureTodayEntry] Entry was created concurrently for user ${userId}`)
        return false
      }
      
      console.error(`[ensureTodayEntry] Failed to create entry:`, insertError)
      throw insertError
    }

    console.log(`[ensureTodayEntry] Created new entry for user ${userId} on ${todayDate}`)
    return true
  } catch (error) {
    console.error('[ensureTodayEntry] Error:', error)
    // Don't throw - we don't want to break the user experience
    // if this fails
    return false
  }
}

/**
 * Ensure today's entry exists for a user by their Clerk ID
 * Looks up the profile first, then creates entry
 * 
 * @param clerkUserId - Clerk user ID
 * @returns true if entry was created, false if already existed or error
 */
export async function ensureTodayEntryByClerkId(
  clerkUserId: string
): Promise<boolean> {
  try {
    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, timezone')
      .eq('clerk_user_id', clerkUserId)
      .is('deleted_at', null)
      .single()

    if (profileError || !profile) {
      console.log(`[ensureTodayEntryByClerkId] No profile found for clerk user ${clerkUserId}`)
      return false
    }

    const typedProfile = profile as Profile
    return ensureTodayEntry(typedProfile.id, typedProfile.timezone)
  } catch (error) {
    console.error('[ensureTodayEntryByClerkId] Error:', error)
    return false
  }
}
