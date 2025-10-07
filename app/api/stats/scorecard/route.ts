import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry, ScorecardData } from '@/types'

/**
 * GET /api/stats/scorecard
 * Returns 13-week scorecard data with daily scores for the last 90 days
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

    // Calculate date range (arc_start_date to arc_start_date + 90 days)
    const arcStartDate = new Date(profile.arc_start_date)
    const arcEndDate = new Date(arcStartDate)
    arcEndDate.setDate(arcEndDate.getDate() + 90)
    const today = new Date()

    // Fetch all daily entries in the 90-day range
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score')
      .eq('user_id', profile.id)
      .gte('entry_date', profile.arc_start_date)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    // Create a map of date -> score for quick lookup
    const scoreMap = new Map<string, number>()
    const typedEntries = entries as Array<{ entry_date: string; daily_score: number }>
    typedEntries.forEach((entry) => {
      scoreMap.set(entry.entry_date, entry.daily_score)
    })

    // Build 13-week scorecard structure
    const weeks: ScorecardData['weeks'] = []
    
    for (let weekIndex = 0; weekIndex < 13; weekIndex++) {
      const weekNumber = weekIndex + 1
      const days: ScorecardData['weeks'][0]['days'] = []
      let weekTotal = 0

      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayOffset = weekIndex * 7 + dayIndex
        const currentDate = new Date(arcStartDate)
        currentDate.setDate(currentDate.getDate() + dayOffset)
        
        const dateStr = currentDate.toISOString().split('T')[0]
        const isFuture = currentDate > today
        const score = scoreMap.get(dateStr) ?? 0

        days.push({
          date: dateStr,
          score,
          isFuture,
        })

        if (!isFuture && score > 0) {
          weekTotal += score
        }
      }

      weeks.push({
        weekNumber,
        days,
        weekTotal,
      })
    }

    const scorecardData: ScorecardData = { weeks }
    
    return NextResponse.json(scorecardData)
  } catch (error) {
    console.error('Error in GET /api/stats/scorecard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
