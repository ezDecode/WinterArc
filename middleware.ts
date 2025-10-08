import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/cron(.*)', // Allow cron job endpoint
])

const isOnboardingRoute = createRouteMatcher(['/onboarding'])

// Simple in-memory rate limiting (for production, use Upstash Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

/**
 * Check rate limit for an IP address
 */
function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const now = Date.now()

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }

  if (record.count >= RATE_LIMIT) {
    // Rate limit exceeded
    return false
  }

  // Increment count
  record.count++
  return true
}

/**
 * Clean up expired rate limit records periodically
 */
function cleanupRateLimitMap() {
  const now = Date.now()
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip)
    }
  }
}

// Clean up every 5 minutes
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitMap, 5 * 60 * 1000)
}

export default clerkMiddleware(async (auth, request) => {
  // Rate limiting for API routes (except cron)
  if (
    request.nextUrl.pathname.startsWith('/api/') &&
    !request.nextUrl.pathname.startsWith('/api/cron/')
  ) {
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        {
          error: {
            code: 'RATE_LIMIT_ERROR',
            message: 'Too many requests. Please try again later.',
            timestamp: new Date().toISOString(),
          },
        },
        { status: 429 }
      )
    }
  }

  const { userId } = await auth()

  // Protect non-public routes
  if (!isPublicRoute(request)) {
    await auth.protect()
  }

  // Skip onboarding check for public routes, onboarding itself, and API routes
  if (
    isPublicRoute(request) ||
    isOnboardingRoute(request) ||
    request.nextUrl.pathname.startsWith('/api/')
  ) {
    return NextResponse.next()
  }

  // Check if user needs onboarding
  // Note: This is a simple check. In production, you might want to check a database flag
  // For now, we'll rely on the onboarding page setting the timezone
  if (userId && request.nextUrl.pathname === '/') {
    // Redirect home page to /today
    return NextResponse.redirect(new URL('/today', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}
