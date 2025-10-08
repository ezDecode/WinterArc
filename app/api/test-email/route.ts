/**
 * Test Email API Endpoint
 * 
 * Allows testing email functionality for development and debugging
 * Protected endpoint that requires authentication
 */

import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { triggerBackgroundEmailCheck } from '@/lib/services/emailTrigger'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Parse request body for test options
    const body = await request.json().catch(() => ({}))
    const { force = false, type = 'on_demand' } = body

    // For development/testing only
    if (process.env.NODE_ENV === 'production' && !force) {
      return NextResponse.json(
        { error: 'Test endpoint disabled in production' },
        { status: 403 }
      )
    }

    // Trigger email check
    const result = await triggerBackgroundEmailCheck(userId)

    return NextResponse.json({
      success: result.success,
      message: result.message,
      userId,
      type,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test email API error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// Only allow POST requests
export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed. Use POST.' },
    { status: 405 }
  )
}
