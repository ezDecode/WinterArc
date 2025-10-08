import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'
import { toDatabaseProfile } from '@/lib/utils/typeConverters'
import { DatabaseError } from '@/lib/errors/AppError'

/**
 * Get or create user profile for Clerk user (Server-side version)
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns User profile
 * @throws DatabaseError if profile cannot be fetched or created
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
    throw new DatabaseError(`Failed to fetch profile: ${fetchError.message}`, fetchError)
  }

  // Create new profile using type converter (no 'as any' needed)
  const profileData = toDatabaseProfile({
    clerk_user_id: clerkUserId,
    email,
    timezone: DEFAULT_TIMEZONE,
    arc_start_date: new Date().toISOString().split('T')[0],
  })

  const { data: newProfile, error: createError } = await (supabaseAdmin
    .from('profiles') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
    .insert(profileData)
    .select()
    .single()

  if (createError) {
    throw new DatabaseError(`Failed to create profile: ${createError.message}`, createError)
  }

  if (!newProfile) {
    throw new DatabaseError('Failed to create profile: No data returned')
  }

  return newProfile
}
