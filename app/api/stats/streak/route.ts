import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { calculateStreaks } from '@/lib/utils/streak'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry, StreakData } from '@/types'

/**
 * GET /api/stats/streak
 * Returns current and longest streak data
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get current user for email
    const user = await currentUser()
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const email = user.emailAddresses[0]?.emailAddress || 'user@example.com'

    // Get or create user profile
    const profile = await getOrCreateProfile(userId, email)

    if (!profile) {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }

    // Fetch all daily entries for streak calculation
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score')
      .eq('user_id', profile.id)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    // Calculate streaks using utility function
    const streakData = calculateStreaks(entries as DailyEntry[])
    
    return NextResponse.json(streakData as StreakData)
  } catch (error) {
    console.error('Error in GET /api/stats/streak:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
