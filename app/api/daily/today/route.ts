import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getTodayDate } from '@/lib/utils/date'
import { getOrCreateProfile } from '@/lib/utils/profile'
import { createDefaultDailyEntry, fromDatabaseDailyEntry } from '@/lib/utils/typeConverters'
import { handleApiError } from '@/lib/errors/errorHandler'
import { AuthenticationError, NotFoundError, DatabaseError } from '@/lib/errors/AppError'

export async function GET() {
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
      throw new AuthenticationError()
    }

    // Get current user for email
    const user = await currentUser()

    if (!user) {
      throw new NotFoundError('User')
    }

    const email = user.emailAddresses[0]?.emailAddress

    if (!email) {
      throw new DatabaseError('User email not found')
    }

    // Get or create user profile
    let profile
    try {
      profile = await getOrCreateProfile(userId, email)
    } catch (error) {
      console.error('Failed to get or create profile:', error)
      throw new DatabaseError(
        `Failed to get or create profile: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error
      )
    }

    // Get today's date in user's timezone
    const todayDate = getTodayDate(profile.timezone)

    // Check if entry exists for today
    const { data: existingEntry, error: entryError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
      .eq('entry_date', todayDate)
      .single()

    let entry = existingEntry

    // If no entry exists, create one
    if (entryError || !entry) {
      // Log the error if it's not "not found"
      if (entryError && entryError.code !== 'PGRST116') {
        console.error('Error fetching daily entry:', entryError)
      }

      // Use type converter to create default entry
      const defaultEntry = createDefaultDailyEntry(profile.id, todayDate)

      const { data: newEntry, error: createError } = await (supabaseAdmin
        .from('daily_entries') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .insert(defaultEntry)
        .select()
        .single()

      if (createError) {
        console.error('Error creating daily entry:', createError)
        throw new DatabaseError(`Failed to create entry: ${createError.message}`, createError)
      }

      if (!newEntry) {
        throw new DatabaseError('Failed to create entry: No data returned')
      }

      entry = newEntry
    }

    // Convert database entry to DailyEntry type
    if (entry) {
      return NextResponse.json(fromDatabaseDailyEntry(entry))
    } else {
      throw new DatabaseError('Entry not found')
    }
  } catch (error) {
    // Enhanced error logging
    console.error('Error in /api/daily/today:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    })
    return handleApiError(error)
  }
}
