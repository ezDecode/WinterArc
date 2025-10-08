import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import { supabaseAdmin } from '@/lib/supabase/server'
import { handleApiError } from '@/lib/errors/errorHandler'
import { AuthenticationError, NotFoundError, DatabaseError } from '@/lib/errors/AppError'
import { Database } from '@/types/database'
import { z } from 'zod'

/**
 * GET /api/profile
 * Get or create user profile
 */
export async function GET() {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new AuthenticationError()
    }

    const user = await currentUser()

    if (!user) {
      throw new NotFoundError('User')
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      throw new DatabaseError('User email not found')
    }

    const profile = await getOrCreateProfile(userId, email)
    return NextResponse.json(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

// Validation schema for profile updates
const profileUpdateSchema = z.object({
  timezone: z.string().regex(/^[A-Za-z]+\/[A-Za-z_]+$/).optional(),
})

/**
 * PATCH /api/profile
 * Update user profile (e.g., timezone)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()

    if (!userId) {
      throw new AuthenticationError()
    }

    const body = await request.json()

    // Validate input (will be caught by handleApiError if it fails)
    const { timezone } = profileUpdateSchema.parse(body)

    // Get user's profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (fetchError || !profile) {
      throw new NotFoundError('Profile')
    }

    // Update profile
    const updates: Database['public']['Tables']['profiles']['Update'] = {
      updated_at: new Date().toISOString(),
    }

    if (timezone) {
      updates.timezone = timezone
    }

    const { data: updatedProfile, error: updateError } = await (supabaseAdmin
      .from('profiles') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .update(updates)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (updateError) {
      throw new DatabaseError('Failed to update profile', updateError)
    }

    if (!updatedProfile) {
      throw new DatabaseError('Failed to update profile: No data returned')
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return handleApiError(error)
  }
}
