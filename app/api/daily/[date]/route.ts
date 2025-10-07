import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { calculateDailyScore, isDayComplete } from '@/lib/utils/scoring'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry } from '@/types'

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date } = await params
    const updates = await request.json()

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

    const userId_db: string = profile.id

    // Get existing entry
    const { data: existingEntry, error: fetchError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Merge updates with existing entry
    const updatedEntry = {
      // @ts-ignore - Supabase type narrowing issue
      ...existingEntry,
      ...updates,
    }

    // Recalculate score
    const newScore = calculateDailyScore(updatedEntry)
    const isComplete = isDayComplete(updatedEntry)

    // Update entry in database
    const { data: savedEntry, error: updateError } = await supabaseAdmin
      .from('daily_entries')
      // @ts-ignore - Supabase type narrowing issue
      .update({
        ...updates,
        daily_score: newScore,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating entry:', updateError)
      return NextResponse.json({ error: 'Failed to update entry' }, { status: 500 })
    }

    return NextResponse.json(savedEntry as DailyEntry)
  } catch (error) {
    console.error('Error in PATCH /api/daily/[date]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { date } = await params

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

    const userId_db: string = profile.id

    // Get entry for specific date
    const { data: entry, error: entryError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .single()

    if (entryError || !entry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    return NextResponse.json(entry as DailyEntry)
  } catch (error) {
    console.error('Error in GET /api/daily/[date]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}