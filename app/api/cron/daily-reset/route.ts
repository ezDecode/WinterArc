import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { timingSafeEqual } from 'crypto'
import type { Database } from '@/types/database'
import type { Profile } from '@/types'
import { getUserTodayLocalDate } from '@/lib/utils/date'
import { createDefaultDailyEntry } from '@/lib/utils/typeConverters'

/**
 * Vercel Cron Job Handler for Daily Reset
 * 
 * This endpoint creates new daily entries for all active users at their local 4 AM.
 * Security: Requires CRON_SECRET in Authorization header with constant-time comparison
 * 
 * POST /api/cron/daily-reset
 */

/**
 * Validate cron request with constant-time comparison to prevent timing attacks
 */
function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return false
  }

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }

  const token = authHeader.slice(7) // Remove 'Bearer '

  try {
    const tokenBuffer = Buffer.from(token)
    const secretBuffer = Buffer.from(cronSecret)

    // Constant-time comparison to prevent timing attacks
    if (tokenBuffer.length !== secretBuffer.length) {
      return false
    }

    return timingSafeEqual(tokenBuffer, secretBuffer)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    // Security: Verify cron secret with constant-time comparison
    if (!isValidCronRequest(request)) {
      console.error('Invalid cron authentication')
      return NextResponse.json(
        {
          error: {
            code: 'AUTH_ERROR',
            message: 'Unauthorized',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 401 }
      )
    }

    // Create Supabase admin client (bypasses RLS)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Supabase credentials not configured')
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      )
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Fetch all active user profiles
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('*')

    if (profilesError) {
      console.error('Error fetching profiles:', profilesError)
      return NextResponse.json(
        { error: 'Failed to fetch user profiles', message: profilesError.message },
        { status: 500 }
      )
    }

    const profiles: Profile[] = (profilesData as Profile[]) || []

    if (profiles.length === 0) {
      return NextResponse.json({
        processedUsers: 0,
        createdEntries: 0,
        skipped: 0,
        errors: 0,
        message: 'No active users found'
      })
    }

    // Process each user
    let processedUsers = 0
    let createdEntries = 0
    let skipped = 0
    let errors = 0
    const defaultTimezone = process.env.DEFAULT_TIMEZONE || 'Asia/Kolkata'

    for (const profile of profiles) {
      try {
        processedUsers++
        const userTimezone = profile.timezone || defaultTimezone
        const todayDate = getUserTodayLocalDate(userTimezone)

        // Check if entry already exists for today
        const { data: existingEntry, error: checkError } = await supabase
          .from('daily_entries')
          .select('id')
          .eq('user_id', profile.id)
          .eq('entry_date', todayDate)
          .single()

        if (checkError && checkError.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" - that's expected
          console.error(`Error checking entry for user ${profile.id}:`, checkError)
          errors++
          continue
        }

        if (existingEntry) {
          // Entry already exists, skip
          skipped++
          continue
        }

        // Create new daily entry with defaults using type converter
        const entryData = createDefaultDailyEntry(profile.id, todayDate)

        const { error: insertError } = await (supabase
          .from('daily_entries') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
          .insert(entryData)
        if (insertError) {
          console.error(`Error creating entry for user ${profile.id}:`, insertError)
          errors++
          continue
        }

        createdEntries++
      } catch (userError) {
        console.error(`Error processing user ${profile.id}:`, userError)
        errors++
      }
    }

    // Return summary
    return NextResponse.json({
      processedUsers,
      createdEntries,
      skipped,
      errors,
      message: `Processed ${processedUsers} users, created ${createdEntries} entries, skipped ${skipped}, errors ${errors}`
    })

  } catch (error) {
    console.error('Daily reset cron error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        message: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    )
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}