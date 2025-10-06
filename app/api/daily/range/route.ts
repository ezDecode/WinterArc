import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import type { DailyEntry } from '@/types'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('start')
    const endDate = searchParams.get('end')

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing start or end date parameters' },
        { status: 400 }
      )
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get entries for date range
    const { data: entries, error: entriesError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
      .gte('entry_date', startDate)
      .lte('entry_date', endDate)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    return NextResponse.json(entries as DailyEntry[])
  } catch (error) {
    console.error('Error in GET /api/daily/range:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

