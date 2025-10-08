import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'
import { toDatabaseProfile } from '@/lib/utils/typeConverters'
import { DatabaseError } from '@/lib/errors/AppError'
import type { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

/**
 * Get or create user profile for Clerk user (Server-side version)
 * Uses email as fallback lookup to prevent duplicate profiles
 * @param clerkUserId - Clerk user ID
 * @param email - User email
 * @returns User profile
 * @throws DatabaseError if profile cannot be fetched or created
 */
export async function getOrCreateProfile(
  clerkUserId: string,
  email: string
): Promise<Profile> {
  console.log('[Profile] Checking for clerk_user_id:', clerkUserId)

  // STEP 1: Try to find by clerk_user_id (primary lookup)
  const profileResult = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .maybeSingle()

  if (profileResult.data && !profileResult.error) {
    const profile = profileResult.data as Profile
    console.log('[Profile] Found by clerk_user_id:', profile.id)
    return profile
  }

  console.log('[Profile] Not found by clerk_user_id, trying email lookup...')

  // STEP 2: If not found by clerk_user_id, try by email (fallback)
  const emailResult = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('email', email)
    .is('deleted_at', null)
    .maybeSingle()

  // If found by email, UPDATE the clerk_user_id and return
  if (emailResult.data && !emailResult.error) {
    const emailProfile = emailResult.data as Profile
    console.log('[Profile] Found by email, updating clerk_user_id:', emailProfile.id)

    const updateResult = await (supabaseAdmin
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .from('profiles') as any)
      .update({
        clerk_user_id: clerkUserId,
        updated_at: new Date().toISOString(),
        last_login_at: new Date().toISOString(),
      })
      .eq('id', emailProfile.id)
      .select()
      .maybeSingle()

    if (updateResult.data && !updateResult.error) {
      console.log('[Profile] Successfully updated clerk_user_id')
      return updateResult.data as Profile
    }

    console.error('[Profile] Failed to update clerk_user_id:', updateResult.error)
  }

  // STEP 3: Only create if truly doesn't exist
  if (profileResult.error?.code !== 'PGRST116' && emailResult.error?.code !== 'PGRST116') {
    throw new DatabaseError(
      `Failed to fetch profile: ${profileResult.error?.message || emailResult.error?.message}`,
      profileResult.error || emailResult.error
    )
  }

  console.log('[Profile] Creating new profile for:', email)

  // Create new profile
  const profileData = toDatabaseProfile({
    clerk_user_id: clerkUserId,
    email,
    timezone: DEFAULT_TIMEZONE,
    arc_start_date: new Date().toISOString().split('T')[0],
  })

  const createResult = await (supabaseAdmin
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .from('profiles') as any)
    .insert(profileData)
    .select()
    .maybeSingle()

  if (createResult.error) {
    throw new DatabaseError(`Failed to create profile: ${createResult.error.message}`, createResult.error)
  }

  if (!createResult.data) {
    throw new DatabaseError('Failed to create profile: No data returned')
  }

  const newProfile = createResult.data as Profile
  console.log('[Profile] Successfully created new profile:', newProfile.id)
  return newProfile
}
