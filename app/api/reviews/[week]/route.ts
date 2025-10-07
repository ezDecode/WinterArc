import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import type { WeeklyReview } from '@/types'

/**
 * GET /api/reviews/[week]
 * Get a specific week's review
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ week: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { week } = await params
    const weekNumber = parseInt(week, 10)

    if (isNaN(weekNumber) || weekNumber < 1 || weekNumber > 13) {
      return NextResponse.json({ error: 'Invalid week number' }, { status: 400 })
    }

    // Get user profile
    const profileResponse = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('clerk_user_id', userId)
      .single()

    if (profileResponse.error || !profileResponse.data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // @ts-expect-error - Supabase type narrowing issue
    const profile = profileResponse.data

    // Fetch review for specific week
    const { data: review, error: reviewError } = await supabaseAdmin
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', profile.id)
      .eq('week_number', weekNumber)
      .single()

    if (reviewError) {
      if (reviewError.code === 'PGRST116') {
        // No review found for this week
        return NextResponse.json({ error: 'Review not found' }, { status: 404 })
      }
      console.error('Error fetching review:', reviewError)
      return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
    }

    return NextResponse.json(review as WeeklyReview)
  } catch (error) {
    console.error('Error in GET /api/reviews/[week]:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
