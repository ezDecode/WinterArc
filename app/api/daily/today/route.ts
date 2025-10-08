import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getTodayDate } from '@/lib/utils/date'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry } from '@/types'
import type { Database } from '@/types/database'

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
    let profile
    try {
      profile = await getOrCreateProfile(userId, email)
    } catch (profileError) {
      console.error('Error in getOrCreateProfile:', profileError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch or create profile',
          details: profileError instanceof Error ? profileError.message : 'Unknown error'
        },
        { status: 500 }
      )
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
      const defaultEntry: Database['public']['Tables']['daily_entries']['Insert'] = {
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
        return NextResponse.json(
          { 
            error: 'Failed to create entry',
            details: createError.message
          },
          { status: 500 }
        )
      }

      entry = newEntry
    }

    return NextResponse.json(entry as unknown as DailyEntry)
  } catch (error) {
    console.error('Error in GET /api/daily/today:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
