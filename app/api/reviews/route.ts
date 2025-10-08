import { auth, currentUser } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { getOrCreateProfile } from '@/lib/utils/profile'
import { z } from 'zod'
import type { WeeklyReview } from '@/types'
import type { Database } from '@/types/database'

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
    const existingReviewResult = await supabaseAdmin
      .from('weekly_reviews')
      .select('id')
      .eq('user_id', profile.id)
      .eq('week_number', reviewData.week_number)
      .maybeSingle()

    let result
    const isUpdate = !!existingReviewResult.data

    if (isUpdate) {
      // Update existing review
      const reviewId: string = (existingReviewResult.data as any).id // eslint-disable-line @typescript-eslint/no-explicit-any
      
      const updateData: Database['public']['Tables']['weekly_reviews']['Update'] = {
        review_date: reviewData.review_date,
        days_hit_all: reviewData.days_hit_all,
        what_helped: reviewData.what_helped,
        what_blocked: reviewData.what_blocked,
        next_week_change: reviewData.next_week_change,
      }
      
      const { data, error } = await (supabaseAdmin
        .from('weekly_reviews') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .update(updateData)
        .eq('id', reviewId)
        .select()
        .single()

      if (error) {
        console.error('Error updating review:', error)
        return NextResponse.json(
          { 
            error: 'Failed to update review',
            details: error.message
          },
          { status: 500 }
        )
      }

      result = data
    } else {
      // Create new review
      const insertData: Database['public']['Tables']['weekly_reviews']['Insert'] = {
        user_id: profile.id,
        week_number: reviewData.week_number,
        review_date: reviewData.review_date,
        days_hit_all: reviewData.days_hit_all,
        what_helped: reviewData.what_helped,
        what_blocked: reviewData.what_blocked,
        next_week_change: reviewData.next_week_change,
      }
      
      const { data, error } = await (supabaseAdmin
        .from('weekly_reviews') as any) // eslint-disable-line @typescript-eslint/no-explicit-any
        .insert(insertData)
        .select()
        .single()

      if (error) {
        console.error('Error creating review:', error)
        return NextResponse.json(
          { 
            error: 'Failed to create review',
            details: error.message
          },
          { status: 500 }
        )
      }

      result = data
    }

    return NextResponse.json(result as WeeklyReview, { status: isUpdate ? 200 : 201 })
  } catch (error) {
    console.error('Error in POST /api/reviews:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
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

    // Fetch all reviews for user
    const { data: reviews, error: reviewsError } = await supabaseAdmin
      .from('weekly_reviews')
      .select('*')
      .eq('user_id', profile.id)
      .order('week_number', { ascending: true })

    if (reviewsError) {
      console.error('Error fetching reviews:', reviewsError)
      return NextResponse.json(
        { 
          error: 'Failed to fetch reviews',
          details: reviewsError.message
        },
        { status: 500 }
      )
    }

    return NextResponse.json(reviews as WeeklyReview[])
  } catch (error) {
    console.error('Error in GET /api/reviews:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
