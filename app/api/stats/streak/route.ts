import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { calculateStreaks } from '@/lib/utils/streak'
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

    // Get user profile
    const profileResponse = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileResponse.error || !profileResponse.data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // @ts-expect-error - Supabase type narrowing issue
    const profile = profileResponse.data

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
