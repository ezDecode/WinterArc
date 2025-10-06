import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getTodayDate } from '@/lib/utils/date'
import type { DailyEntry } from '@/types'

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, timezone, arc_start_date')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get today's date in user's timezone
    const todayDate = getTodayDate(profile.timezone)

    // Check if entry exists for today
    let { data: entry, error: entryError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
      .eq('entry_date', todayDate)
      .single()

    // If no entry exists, create one
    if (entryError || !entry) {
      const defaultEntry = {
        user_id: profile.id,
        entry_date: todayDate,
        study_blocks: [
          { checked: false, topic: '' },
          { checked: false, topic: '' },
          { checked: false, topic: '' },
          { checked: false, topic: '' },
        ],
        reading: { checked: false, bookName: '', pages: 0 },
        pushups: { set1: false, set2: false, set3: false, extras: 0 },
        meditation: { checked: false, method: '', duration: 0 },
        water_bottles: [false, false, false, false, false, false, false, false],
        notes: { morning: '', evening: '', general: '' },
        daily_score: 0,
        is_complete: false,
      }

      const { data: newEntry, error: createError } = await supabaseAdmin
        .from('daily_entries')
        .insert(defaultEntry)
        .select()
        .single()

      if (createError) {
        console.error('Error creating entry:', createError)
        return NextResponse.json({ error: 'Failed to create entry' }, { status: 500 })
      }

      entry = newEntry
    }

    return NextResponse.json(entry as DailyEntry)
  } catch (error) {
    console.error('Error in GET /api/daily/today:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
