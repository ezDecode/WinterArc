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
    // Validate Clerk configuration before proceeding
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
        !process.env.CLERK_SECRET_KEY ||
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_xxxxx') {
      return NextResponse.json(
        { 
          error: 'Authentication service not configured',
          details: 'Invalid Clerk credentials'
        }, 
        { status: 503 }
      )
    }
    
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
    const fetchResult = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .maybeSingle()

    if (fetchResult.error) {
      return NextResponse.json({ error: 'Database error', details: fetchResult.error.message }, { status: 500 })
    }

    if (!fetchResult.data) {
      return NextResponse.json({ error: 'Entry not found' }, { status: 404 })
    }

    // Explicitly cast to the correct type
    const existingEntry = fetchResult.data as Database['public']['Tables']['daily_entries']['Row']

    // Merge updates with existing entry for score calculation
    // Cast Json types to application types
    const updatedEntry: Partial<DailyEntry> = {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      study_blocks: updates.study_blocks ?? (existingEntry.study_blocks as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      reading: updates.reading ?? (existingEntry.reading as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pushups: updates.pushups ?? (existingEntry.pushups as any),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      meditation: updates.meditation ?? (existingEntry.meditation as any),
      water_bottles: updates.water_bottles ?? existingEntry.water_bottles,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      notes: updates.notes ?? (existingEntry.notes as any),
    }

    // Recalculate score
    const newScore = calculateDailyScore(updatedEntry)
    const isComplete = isDayComplete(updatedEntry)

    // Prepare update data
    const updateData = {
      daily_score: newScore,
      is_complete: isComplete,
      updated_at: new Date().toISOString(),
      ...(updates.study_blocks !== undefined && { study_blocks: updates.study_blocks }),
      ...(updates.reading !== undefined && { reading: updates.reading }),
      ...(updates.pushups !== undefined && { pushups: updates.pushups }),
      ...(updates.meditation !== undefined && { meditation: updates.meditation }),
      ...(updates.water_bottles !== undefined && { water_bottles: updates.water_bottles }),
      ...(updates.notes !== undefined && { notes: updates.notes }),
    }

    // Update entry in database
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryBuilder: any = supabaseAdmin.from('daily_entries')
    const updateResult = await queryBuilder
      .update(updateData)
      .eq('user_id', userId_db)
      .eq('entry_date', date)
      .select()
      .single()

    if (updateResult.error) {
      console.error('Error updating entry:', updateResult.error)
      return NextResponse.json(
        { 
          error: 'Failed to update entry',
          details: updateResult.error.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(updateResult.data as DailyEntry)
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
    // Validate Clerk configuration before proceeding
    if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || 
        !process.env.CLERK_SECRET_KEY ||
        process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY === 'pk_test_xxxxx') {
      return NextResponse.json(
        { 
          error: 'Authentication service not configured',
          details: 'Invalid Clerk credentials'
        }, 
        { status: 503 }
      )
    }
    
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