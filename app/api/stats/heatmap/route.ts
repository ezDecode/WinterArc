import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry } from '@/types'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
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

    // Get query params
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 90

    // Calculate date range based on user's timezone
    const todayStr = new Intl.DateTimeFormat('en-CA', {
      timeZone: profile.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    
    const endDate = new Date(todayStr + 'T00:00:00Z')
    const startDate = new Date(endDate)
    startDate.setUTCDate(startDate.getUTCDate() - days + 1)

    const startDateStr = startDate.toISOString().split('T')[0]
    const endDateStr = endDate.toISOString().split('T')[0]

    // Fetch entries in date range from Supabase
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score, is_complete')
      .eq('user_id', profile.id)
      .gte('entry_date', startDateStr)
      .lte('entry_date', endDateStr)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json(
        { error: 'Failed to fetch entries' },
        { status: 500 }
      )
    }

    const typedEntries = entries as DailyEntry[]

    // Create a map for quick lookup
    const entryMap = new Map(
      typedEntries.map(entry => [
        entry.entry_date,
        {
          score: entry.daily_score,
          isComplete: entry.is_complete
        }
      ])
    )

    // Generate all dates in range with data
    const heatmapData = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const entryData = entryMap.get(dateStr)

      heatmapData.push({
        date: dateStr,
        score: entryData?.score ?? 0,
        isComplete: entryData?.isComplete ?? false
      })

      currentDate.setUTCDate(currentDate.getUTCDate() + 1)
    }

    return NextResponse.json({
      startDate: startDateStr,
      endDate: endDateStr,
      days,
      data: heatmapData
    })

  } catch (error) {
    console.error('Heatmap API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}
