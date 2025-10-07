import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/cron(.*)', // Allow cron job endpoint
])

const isOnboardingRoute = createRouteMatcher(['/onboarding'])

export default clerkMiddleware(async (auth, request) => {
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
