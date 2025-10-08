import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getTodayDate } from '@/lib/utils/date'
import { getOrCreateProfile } from '@/lib/utils/profile'
import { createDefaultDailyEntry, fromDatabaseDailyEntry } from '@/lib/utils/typeConverters'
import { handleApiError } from '@/lib/errors/errorHandler'
import { AuthenticationError, NotFoundError, DatabaseError } from '@/lib/errors/AppError'
import type { DailyEntry } from '@/types'
import type { Database } from '@/types/database'

export async function GET() {
  try {
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
    const profile = await getOrCreateProfile(userId, email)

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
      // Use type converter to create default entry (no 'as any')
      const defaultEntry = createDefaultDailyEntry(profile.id, todayDate)

      const { data: newEntry, error: createError } = await (supabaseAdmin
        .from('daily_entries') as any)
        .insert(defaultEntry)
        .select()
        .single()

      if (createError) {
        throw new DatabaseError('Failed to create entry', createError)
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
    return handleApiError(error)
  }
}
