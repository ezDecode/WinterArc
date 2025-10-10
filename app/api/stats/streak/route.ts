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

    // Calculate arc end date (90 days from start)
    const arcStartDate = new Date(profile.arc_start_date + 'T00:00:00Z')
    const arcEndDate = new Date(arcStartDate)
    arcEndDate.setUTCDate(arcEndDate.getUTCDate() + 90)
    
    // Get today's date in user's timezone
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: profile.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const today = new Date(todayStr + 'T00:00:00Z')
    
    // Calculate upper bound: min(arcEndDate, today)
    const upperBoundDate = arcEndDate < today ? arcEndDate : today
    const upperBoundStr = upperBoundDate.toISOString().split('T')[0]
    
    // Fetch all daily entries for streak calculation within the arc range
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score')
      .eq('user_id', profile.id)
      .gte('entry_date', profile.arc_start_date)
      .lte('entry_date', upperBoundStr)
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
