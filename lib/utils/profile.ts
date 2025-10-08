import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'
import type { Database } from '@/types/database'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']

/**
 * Get or create user profile for Clerk user (Server-side version)
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns User profile or null if error
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  email: string
): Promise<ProfileRow | null> {
  try {
    // Check if profile exists
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', clerkUserId)
      .single()

    // If profile exists, return it
    if (profile && !fetchError) {
      return profile
    }

    // Profile doesn't exist, create new one
    const newProfileData: ProfileInsert = {
      clerk_user_id: clerkUserId,
      email: email,
      timezone: DEFAULT_TIMEZONE,
      arc_start_date: new Date().toISOString().split('T')[0],
    }

    const { data: newProfile, error: createError } = await supabaseAdmin
      .from('profiles')
      // @ts-ignore - Supabase type narrowing issue
      .insert(newProfileData)
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
