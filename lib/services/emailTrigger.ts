/**
 * Email Trigger Service
 * 
 * Handles on-demand email triggers when users visit /today page
 * Non-blocking fire-and-forget implementation to prevent page load delays
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { DailyEntry } from '@/types'
import { sendTaskReminderEmail } from './email'
import { getIncompleteTasks, hasIncompleteTasks, shouldSkipReminder } from '@/lib/utils/taskCompletion'
import { getUserTodayLocalDate } from '@/lib/utils/date'

// Create Supabase admin client for service operations
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

/**
 * Get user profile and today's entry for email analysis
 */
async function getUserDataForEmailCheck(userId: string): Promise<{
  profile: Record<string, any> // eslint-disable-line @typescript-eslint/no-explicit-any
  todayEntry: DailyEntry | null
} | null> {
  try {
    const supabase = getSupabaseServiceClient()

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .is('deleted_at', null)
      .single()

    if (profileError) {
      console.error('Error fetching user profile:', profileError)
      return null
    }

    if (!profile) {
      console.log('No profile found for user:', userId)
      return null
    }

    // Get today's entry
    const todayDate = getUserTodayLocalDate((profile as any).timezone || 'America/New_York') // eslint-disable-line @typescript-eslint/no-explicit-any
    
    const { data: todayEntry, error: entryError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', (profile as any).id) // eslint-disable-line @typescript-eslint/no-explicit-any
      .eq('entry_date', todayDate)
      .single()

    if (entryError && entryError.code !== 'PGRST116') {
      console.error('Error fetching today entry:', entryError)
      return null
    }

    return {
      profile,
      todayEntry: todayEntry || null
    }
  } catch (error) {
    console.error('Error in getUserDataForEmailCheck:', error)
    return null
  }
}

/**
 * Extract user's first name from email or clerk data
 */
function extractUserName(profile: Record<string, any>): string { // eslint-disable-line @typescript-eslint/no-explicit-any
  // Try to get name from email (everything before @)
  if (profile.email) {
    const emailName = profile.email.split('@')[0]
    // Capitalize first letter and replace dots/underscores with spaces
    return emailName
      .replace(/[._]/g, ' ')
      .replace(/\b\w/g, (l: string) => l.toUpperCase())
  }

  // Fallback to "there" if no name can be extracted
  return 'there'
}

/**
 * Process email reminder trigger (non-blocking)
 */
async function processEmailReminderTrigger(userId: string): Promise<void> {
  try {
    const userData = await getUserDataForEmailCheck(userId)
    if (!userData) {
      console.log('No user data found for email trigger:', userId)
      return
    }

    const { profile, todayEntry } = userData

    // If no entry exists, user hasn't started today - send reminder
    if (!todayEntry) {
      console.log('No today entry found, sending full reminder to:', userId)
      
      // Send reminder for all 5 tasks
      const allTasks = [
        { name: 'Study Blocks', details: '4 study blocks need to be completed' },
        { name: 'Reading', details: 'Daily reading session not completed' },
        { name: 'Pushups', details: '3 pushup sets need to be completed' },
        { name: 'Meditation', details: 'Daily meditation session not completed' },
        { name: 'Water Intake', details: '8 water bottles need to be consumed' }
      ]

      await sendTaskReminderEmail({
        userId: (profile as any).id, // eslint-disable-line @typescript-eslint/no-explicit-any
        email: (profile as any).email, // eslint-disable-line @typescript-eslint/no-explicit-any
        userName: extractUserName(profile),
        incompleteTasks: allTasks,
        triggerType: 'on_demand',
        timezone: (profile as any).timezone || 'America/New_York' // eslint-disable-line @typescript-eslint/no-explicit-any
      })
      return
    }

    // Check if entry has incomplete tasks
    if (!hasIncompleteTasks(todayEntry)) {
      console.log('All tasks completed, no reminder needed for:', userId)
      return
    }

    // Check if we should skip reminder due to high completion rate
    if (shouldSkipReminder(todayEntry, 0.8)) {
      console.log('High completion rate, skipping reminder for:', userId)
      return
    }

    // Get incomplete tasks and send reminder
    const incompleteTasks = getIncompleteTasks(todayEntry)
    console.log(`Sending reminder for ${incompleteTasks.length} incomplete tasks to:`, userId)

    await sendTaskReminderEmail({
      userId: (profile as any).id, // eslint-disable-line @typescript-eslint/no-explicit-any
      email: (profile as any).email, // eslint-disable-line @typescript-eslint/no-explicit-any
      userName: extractUserName(profile),
      incompleteTasks,
      triggerType: 'on_demand',
      timezone: (profile as any).timezone || 'America/New_York' // eslint-disable-line @typescript-eslint/no-explicit-any
    })

  } catch (error) {
    // Suppress all errors to prevent affecting user experience
    console.error('Error in processEmailReminderTrigger (suppressed):', error)
  }
}

/**
 * Trigger email check for user visiting /today page
 * Fire-and-forget implementation - does not block page load
 */
export function triggerEmailCheckOnTodayVisit(userId: string): void {
  // Fire and forget - don't await this
  // Use setTimeout as setImmediate is not available in Edge Runtime
  setTimeout(() => {
    processEmailReminderTrigger(userId)
  }, 0)
}

/**
 * Update user's last login timestamp
 */
export async function updateUserLastLogin(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()

    // Get user's internal ID from clerk_user_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error finding user profile for login update:', profileError)
      return
    }

    // Update last_login_at timestamp
    const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .from('profiles')
      .update({ 
        last_login_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', (profile as any).id) // eslint-disable-line @typescript-eslint/no-explicit-any

    if (error) {
      console.error('Error updating last login:', error)
    }
  } catch (error) {
    console.error('Error in updateUserLastLogin:', error)
  }
}

/**
 * Background email check that can be triggered from API routes
 * Used for testing and manual triggers
 */
export async function triggerBackgroundEmailCheck(userId: string): Promise<{
  success: boolean
  message: string
}> {
  try {
    await processEmailReminderTrigger(userId)
    return { success: true, message: 'Email check triggered successfully' }
  } catch (error) {
    console.error('Error in triggerBackgroundEmailCheck:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}
