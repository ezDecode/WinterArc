import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { ScorecardData } from '@/types'

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
    // Parse as UTC to avoid timezone shifts
    const arcStartDate = new Date(profile.arc_start_date + 'T00:00:00Z')
    const arcEndDate = new Date(arcStartDate)
    arcEndDate.setUTCDate(arcEndDate.getUTCDate() + 90)
    
    // Get today's date in user's timezone as YYYY-MM-DD string
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: profile.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    const today = new Date(todayStr + 'T00:00:00Z')
    
    // Debug logging
    console.log('[Scorecard] User timezone:', profile.timezone)
    console.log('[Scorecard] Today (user TZ):', todayStr)
    console.log('[Scorecard] Today (UTC):', today.toISOString())
    console.log('[Scorecard] Arc start:', profile.arc_start_date)
    console.log('[Scorecard] Arc end:', arcEndDate.toISOString().split('T')[0])

    // Calculate the upper bound: min(arcEndDate, today)
    const upperBoundDate = arcEndDate < today ? arcEndDate : today
    const upperBoundStr = upperBoundDate.toISOString().split('T')[0]
    console.log('[Scorecard] Upper bound for query:', upperBoundStr)
    
    // Fetch all daily entries in the 90-day range, up to today or arc end (whichever is earlier)
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score')
      .eq('user_id', profile.id)
      .gte('entry_date', profile.arc_start_date)
      .lte('entry_date', upperBoundStr)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('[Scorecard] Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }
    
    console.log('[Scorecard] Fetched entries count:', entries?.length || 0)
    if (entries && entries.length > 0) {
      console.log('[Scorecard] First entry:', entries[0])
      console.log('[Scorecard] Last entry:', entries[entries.length - 1])
    }

    // Create a map of date -> score for quick lookup
    const scoreMap = new Map<string, number>()
    const typedEntries = entries as Array<{ entry_date: string; daily_score: number }>
    typedEntries.forEach((entry) => {
      scoreMap.set(entry.entry_date, entry.daily_score)
    })

    // Build 13-week scorecard structure
    const weeks: ScorecardData['weeks'] = []
    
    // Get the day of week the arc started (0 = Sunday, 1 = Monday, etc.)
    // Use getUTCDay() since we're working with UTC dates
    const arcStartDayOfWeek = arcStartDate.getUTCDay()
    
    // Calculate total weeks needed: 90 days + padding at start
    const totalDaysWithPadding = arcStartDayOfWeek + 90
    const totalWeeksNeeded = Math.ceil(totalDaysWithPadding / 7)
    let dayOffset = 0
    
    for (let weekIndex = 0; weekIndex < totalWeeksNeeded; weekIndex++) {
      const weekNumber = weekIndex + 1
      const days: ScorecardData['weeks'][0]['days'] = []
      let weekTotal = 0

      // For the first week, add empty padding days before arc start
      if (weekIndex === 0) {
        // Add empty padding days (Sunday = 0, Monday = 1, etc.)
        for (let i = 0; i < arcStartDayOfWeek; i++) {
          days.push({
            date: '',
            score: 0,
            isFuture: false,
            isEmpty: true, // Mark as padding
          })
        }
      }

      // Add actual days for this week
      const daysToAddThisWeek = weekIndex === 0 ? (7 - arcStartDayOfWeek) : 7
      
      for (let i = 0; i < daysToAddThisWeek && dayOffset < 90; i++) {
        const currentDate = new Date(arcStartDate)
        currentDate.setUTCDate(currentDate.getUTCDate() + dayOffset)
        
        const dateStr = currentDate.toISOString().split('T')[0]
        // More explicit comparison: compare YYYY-MM-DD strings instead of Date objects
        // This avoids any potential timezone confusion
        const isFuture = dateStr > todayStr
        const score = scoreMap.get(dateStr) ?? 0
        
        // Debug: Log first few and last few days
        if (dayOffset < 3 || dayOffset === 9 || dayOffset === 10 || dayOffset > 87) {
          console.log(`[Scorecard] Day ${dayOffset}: ${dateStr}, isFuture: ${isFuture} (${dateStr} > ${todayStr}), score: ${score}`)
        }

        days.push({
          date: dateStr,
          score,
          isFuture,
        })

        if (!isFuture && score > 0) {
          weekTotal += score
        }
        
        dayOffset++
      }

      // If this is the last week and we have fewer than 7 days, pad with empty days
      while (days.length < 7) {
        days.push({
          date: '',
          score: 0,
          isFuture: false,
          isEmpty: true,
        })
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
