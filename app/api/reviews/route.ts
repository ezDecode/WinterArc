import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { z } from 'zod'
import type { WeeklyReview } from '@/types'

// Validation schema for weekly review
const weeklyReviewSchema = z.object({
  week_number: z.number().int().min(1).max(13),
  review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days_hit_all: z.number().int().min(0).max(7),
  what_helped: z.string().optional().nullable(),
  what_blocked: z.string().optional().nullable(),
  next_week_change: z.string().optional().nullable(),
})

/**
 * POST /api/reviews
 * Create or update a weekly review
 */
export async function POST(request: Request) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Parse and validate request body
    const body = await request.json()
    const validationResult = weeklyReviewSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const reviewData = validationResult.data

    // Check if review already exists for this week
    const { data: existingReview } = await supabaseAdmin
      .from('weekly_reviews')
      .select('id')
      .eq('user_id', profile.id)
      .eq('week_number', reviewData.week_number)
      .single()

    let result

    if (existingReview) {
      // Update existing review
      // @ts-expect-error - Supabase type narrowing issue
      const reviewId: string = existingReview.id
      const { data, error } = await supabaseAdmin
        .from('weekly_reviews')
        // @ts-ignore - Supabase type narrowing issue
        .update({
          review_date: reviewData.review_date,
          days_hit_all: reviewData.days_hit_all,
          what_helped: reviewData.what_helped,
          what_blocked: reviewData.what_blocked,
          next_week_change: reviewData.next_week_change,
        })
        .eq('id', reviewId)
        .select()
        .single()

      if (error) {
        console.error('Error updating review:', error)
        return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
      }

      result = data
    } else {
      // Create new review
      const { data, error } = await supabaseAdmin
        .from('weekly_reviews')
        // @ts-ignore - Supabase type narrowing issue
        .insert({
          user_id: profile.id,
          week_number: reviewData.week_number,
          review_date: reviewData.review_date,
          days_hit_all: reviewData.days_hit_all,
          what_helped: reviewData.what_helped,
          what_blocked: reviewData.what_blocked,
          next_week_change: reviewData.next_week_change,
        })
        .select()
        .single()

      if (error) {
        console.error('Error creating review:', error)
        return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
      }

      result = data
    }

    return NextResponse.json(result as WeeklyReview, { status: existingReview ? 200 : 201 })
  } catch (error) {
    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

/**
 * GET /api/reviews
 * Get all weekly reviews for the current user
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    // Fetch all reviews for user
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', profile.id)
      .order('week_number', { ascending: true })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json(reviews as WeeklyReview[])
  } catch (error) {
    console.error('Error in GET /api/reviews:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}