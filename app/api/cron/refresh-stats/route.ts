import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase/server'

/**
 * Vercel Cron Job Handler for Refreshing Statistics Materialized View
 * 
 * This endpoint refreshes the user_statistics materialized view every 30 minutes
 * Security: Requires CRON_SECRET in Authorization header
 * 
 * POST /api/cron/refresh-stats
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
    // Security: Verify cron secret
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

    // Refresh materialized view using the database function
    const { error } = await supabaseAdmin.rpc('refresh_user_statistics')

    if (error) {
      console.error('Error refreshing statistics:', error)
      return NextResponse.json(
        {
          error: {
            code: 'DB_ERROR',
            message: 'Failed to refresh statistics',
            details: error.message,
            timestamp: new Date().toISOString(),
          },
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Statistics refreshed successfully',
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Statistics refresh error:', error)
    return NextResponse.json(
      {
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Internal server error',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString(),
        },
      },
      { status: 500 }
    )
  }
}

// Reject other HTTP methods
export async function GET() {
  return NextResponse.json(
    {
      error: {
        code: 'METHOD_NOT_ALLOWED',
        message: 'Method not allowed. Use POST.',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 405 }
  )
}
