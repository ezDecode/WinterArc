import { supabase } from '@/lib/supabase/client'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'

/**
 * Get or create user profile for Clerk user
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns User profile or null if error
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  email: string
): Promise<{ id: string; clerk_user_id: string; email: string; timezone: string; arc_start_date: string } | null> {
  try {
    // Check if profile exists
    let { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    // If profile exists, return it
    if (profile && !fetchError) {
      return profile
    }

    // Create new profile
    const { data: newProfile, error: createError } = await supabase
      .from('profiles')
      .insert({
        clerk_user_id: clerkUserId,
        email,
        timezone: DEFAULT_TIMEZONE,
        arc_start_date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (createError) {
      console.error('Error creating profile:', createError)
      return null
    }

    return newProfile
  } catch (error) {
    console.error('Error in getOrCreateProfile:', error)
    return null
  }
}
