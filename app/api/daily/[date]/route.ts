import { auth } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { calculateDailyScore, isDayComplete } from '@/lib/utils/scoring'
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get existing entry
    const { data: existingEntry, error: fetchError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
      .eq('entry_date', date)
      .single()

    if (fetchError || !existingEntry) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Merge updates with existing entry
    const updatedEntry = {
      ...existingEntry,
      ...updates,
    }

    // Recalculate score
    const newScore = calculateDailyScore(updatedEntry)
    const isComplete = isDayComplete(updatedEntry)

    // Update entry in database
    const { data: savedEntry, error: updateError } = await supabase
      .from('daily_entries')
      .update({
        ...updates,
        daily_score: newScore,
        is_complete: isComplete,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', profile.id)
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

    // Get user profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileError || !profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Get entry for specific date
    const { data: entry, error: entryError } = await supabase
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
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

