import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * GET /api/profile
 * Get or create user profile
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const email = user.emailAddresses[0]?.emailAddress || 'user@example.com'
    
    const profile = await getOrCreateProfile(userId, email)

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error in GET /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * PATCH /api/profile
 * Update user profile (e.g., timezone)
 */
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { timezone } = body

    // Get user's profile
    const { data: profile, error: fetchError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('clerk_user_id', userId)
      .single()

    if (fetchError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Update profile
    const updates: { timezone?: string; updated_at?: string } = {
      updated_at: new Date().toISOString(),
    }

    if (timezone) {
      updates.timezone = timezone
    }

    const { data: updatedProfile, error: updateError } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('clerk_user_id', userId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error('Error in PATCH /api/profile:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
