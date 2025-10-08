import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'
import type { Database } from '@/types/database'

/**
 * Get or create user profile for Clerk user (Server-side version)
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns User profile
 * @throws Error if profile cannot be fetched or created
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  email: string
): Promise<{ id: string; clerk_user_id: string; email: string; timezone: string; arc_start_date: string }> {
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

  // If error is not "not found", throw it
  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`)
  }

  // Create new profile
  const profileData: Database['public']['Tables']['profiles']['Insert'] = {
    clerk_user_id: clerkUserId,
    email,
    timezone: DEFAULT_TIMEZONE,
    arc_start_date: new Date().toISOString().split('T')[0],
  }

  const { data: newProfile, error: createError } = await supabaseAdmin
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (createError) {
    throw new Error(`Failed to create profile: ${createError.message}`)
  }

  if (!newProfile) {
    throw new Error('Failed to create profile: No data returned')
  }

  return newProfile
}
