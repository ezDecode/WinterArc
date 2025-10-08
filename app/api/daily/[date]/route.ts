import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { calculateDailyScore, isDayComplete } from '@/lib/utils/scoring'
import { getOrCreateProfile } from '@/lib/utils/profile'
import type { DailyEntry } from '@/types'
import type { Database } from '@/types/database'
import { z } from 'zod'

// Validation schemas for daily entry updates
const studyBlockSchema = z.object({
  checked: z.boolean(),
  topic: z.string(),
})

const readingSchema = z.object({
  checked: z.boolean(),
  bookName: z.string(),
  pages: z.number(),
})

const pushupsSchema = z.object({
  set1: z.boolean(),
  set2: z.boolean(),
  set3: z.boolean(),
  extras: z.number(),
})

const meditationSchema = z.object({
  checked: z.boolean(),
  method: z.string(),
  duration: z.number(),
})

const notesSchema = z.object({
  morning: z.string(),
  evening: z.string(),
  general: z.string(),
})

const dailyEntryUpdateSchema = z.object({
  study_blocks: z.array(studyBlockSchema).optional(),
  reading: readingSchema.optional(),
  pushups: pushupsSchema.optional(),
  meditation: meditationSchema.optional(),
  water_bottles: z.array(z.boolean()).optional(),
  notes: notesSchema.optional(),
}).partial()

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
    const body = await request.json()

    // Validate input
    const validationResult = dailyEntryUpdateSchema.safeParse(body)
    
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: validationResult.error.issues
        },
        { status: 400 }
      )
    }

    const updates = validationResult.data

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
      ...existingEntry,
      ...updates,
    }

    // Recalculate score
    const newScore = calculateDailyScore(updatedEntry)
    const isComplete = isDayComplete(updatedEntry)

    // Prepare update data
    const updateData: Database['public']['Tables']['daily_entries']['Update'] = {
      ...updates,
      daily_score: newScore,
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
    }

    // Update entry in database
    const { data: savedEntry, error: updateError } = await supabaseAdmin
      .from('daily_entries')
      .update(updateData)
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating entry:', updateError)
      return NextResponse.json(
        { 
          error: 'Failed to update entry',
          details: updateError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(savedEntry as DailyEntry)
  } catch (error) {
    console.error('Error in PATCH /api/daily/[date]:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
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
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}