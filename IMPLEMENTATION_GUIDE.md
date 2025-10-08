# 🛠️ Implementation Guide for WinterArc Fixes

**Version**: 2.0  
**Date**: October 8, 2025  
**Priority**: CRITICAL - MUST COMPLETE

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Phase 1: Critical Security Fixes](#phase-1-critical-security-fixes)
3. [Phase 2: Database Improvements](#phase-2-database-improvements)
4. [Phase 3: Type Safety Fixes](#phase-3-type-safety-fixes)
5. [Phase 4: Error Handling](#phase-4-error-handling)
6. [Phase 5: Performance Optimizations](#phase-5-performance-optimizations)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Checklist](#deployment-checklist)

---

## 🚀 Quick Start

### Prerequisites
- [x] Backup existing database (see MIGRATION_GUIDE.md)
- [x] Access to Supabase SQL Editor
- [x] Git repository access
- [x] Development environment running

### Estimated Time
- **Phase 1 (Critical)**: 4-6 hours
- **Phase 2 (Database)**: 3-4 hours
- **Phase 3 (Types)**: 2-3 hours
- **Phase 4 (Errors)**: 2-3 hours
- **Phase 5 (Performance)**: 3-4 hours

**Total**: ~14-20 hours

---

## 🔴 Phase 1: Critical Security Fixes

### Task 1.1: Apply Improved Database Schema
**Priority**: 🔴 CRITICAL  
**Time**: 30 minutes

1. **Backup current database**:
   ```bash
   # In Supabase Dashboard > SQL Editor
   # Run: pg_dump to backup
   ```

2. **Apply new schema**:
   ```bash
   # Copy contents of lib/supabase/schema-improved.sql
   # Paste in Supabase SQL Editor
   # Execute
   ```

3. **Verify application**:
   ```sql
   -- Check tables
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';

   -- Check RLS enabled
   SELECT tablename, rowsecurity FROM pg_tables 
   WHERE schemaname = 'public';

   -- Check policies
   SELECT tablename, policyname FROM pg_policies 
   WHERE schemaname = 'public';
   ```

### Task 1.2: Update Supabase Client Usage
**Priority**: 🔴 CRITICAL  
**Time**: 2 hours

**File**: `lib/supabase/client.ts`

**Before**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})
```

**After**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { z } from 'zod'

// Validate environment variables at build time
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
})

const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
})

export const supabase = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
    db: {
      schema: 'public',
    },
    global: {
      headers: {
        'x-application-name': 'winter-arc-tracker',
      },
    },
  }
)
```

**File**: `lib/supabase/server.ts`

**After**:
```typescript
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { z } from 'zod'

// Validate environment variables
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_KEY: z.string().min(1),
})

const env = envSchema.parse({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
})

// Admin client - USE SPARINGLY, ONLY FOR CRON JOBS
export const supabaseAdmin = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    db: {
      schema: 'public',
    },
  }
)

// Regular server client with RLS (preferred for API routes)
export const supabaseServer = createClient<Database>(
  env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      headers: {
        'x-application-name': 'winter-arc-tracker-server',
      },
    },
  }
)
```

### Task 1.3: Fix Cron Authentication
**Priority**: 🔴 CRITICAL  
**Time**: 30 minutes

**File**: `app/api/cron/daily-reset/route.ts`

Add constant-time comparison and IP whitelist:

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'
import type { Profile } from '@/types'
import { getUserTodayLocalDate } from '@/lib/utils/date'
import { timingSafeEqual } from 'crypto'

// Vercel cron job IP ranges
const VERCEL_CRON_IPS = [
  '76.76.21.0/24',
  '76.76.21.21',
  '76.76.21.22',
  '76.76.21.98',
  '76.76.21.99',
]

function isValidCronRequest(request: NextRequest): boolean {
  // Check IP (if available)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]
  
  // Check authorization header
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret) {
    console.error('CRON_SECRET not configured')
    return false
  }
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false
  }
  
  const token = authHeader.slice(7)
  
  // Constant-time comparison to prevent timing attacks
  try {
    const tokenBuffer = Buffer.from(token)
    const secretBuffer = Buffer.from(cronSecret)
    
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
    // Verify cron authentication
    if (!isValidCronRequest(request)) {
      console.error('Invalid cron authentication')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Rest of cron logic...
    // ... (keep existing logic)
    
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
```

### Task 1.4: Add Input Sanitization
**Priority**: 🟠 HIGH  
**Time**: 1 hour

**File**: `lib/utils/sanitization.ts` (NEW)

```typescript
import { z } from 'zod'

// Text sanitization - removes HTML, limits length
export const sanitizeText = (text: string, maxLength: number = 5000): string => {
  return text
    .trim()
    .slice(0, maxLength)
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
}

// Enhanced Zod schemas with sanitization
export const sanitizedTextSchema = (maxLength: number = 5000) =>
  z.string()
    .max(maxLength)
    .transform(val => sanitizeText(val, maxLength))
    .optional()
    .nullable()

export const sanitizedRequiredTextSchema = (maxLength: number = 5000) =>
  z.string()
    .min(1)
    .max(maxLength)
    .transform(val => sanitizeText(val, maxLength))

// Weekly review schemas with sanitization
export const weeklyReviewSchema = z.object({
  week_number: z.number().int().min(1).max(13),
  review_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  days_hit_all: z.number().int().min(0).max(7),
  what_helped: sanitizedTextSchema(5000),
  what_blocked: sanitizedTextSchema(5000),
  next_week_change: sanitizedTextSchema(5000),
})

// Notes schema with sanitization
export const notesSchema = z.object({
  morning: sanitizedTextSchema(2000),
  evening: sanitizedTextSchema(2000),
  general: sanitizedTextSchema(2000),
})
```

Update all API routes to use sanitized schemas.

### Task 1.5: Add Rate Limiting
**Priority**: 🟠 HIGH  
**Time**: 1 hour

**File**: `middleware.ts`

```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/cron(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding'])

// Simple rate limiting using IP (for production, use Upstash Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

const RATE_LIMIT = 100 // requests per window
const RATE_WINDOW = 60 * 1000 // 1 minute

function checkRateLimit(request: NextRequest): boolean {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
  const now = Date.now()
  
  const record = rateLimitMap.get(ip)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW })
    return true
  }
  
  if (record.count >= RATE_LIMIT) {
    return false
  }
  
  record.count++
  return true
}

export default clerkMiddleware(async (auth, request) => {
  // Rate limiting for API routes
  if (request.nextUrl.pathname.startsWith('/api/') && 
      !request.nextUrl.pathname.startsWith('/api/cron/')) {
    if (!checkRateLimit(request)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
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

  // Redirect home page to /today
  if (userId && request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/today', request.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

---

## 💾 Phase 2: Database Improvements

### Task 2.1: Verify All Constraints
**Priority**: 🟠 HIGH  
**Time**: 30 minutes

Run validation queries from `schema-improved.sql`:

```sql
-- Check all constraints
SELECT 
  conname,
  contype,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;
```

Expected constraints:
- ✅ check_study_blocks_structure
- ✅ check_water_bottles_structure
- ✅ check_reading_valid
- ✅ check_pushups_valid
- ✅ check_meditation_valid
- ✅ check_notes_valid
- ✅ check_timezone_valid

### Task 2.2: Set Up Audit Logging
**Priority**: 🟡 MEDIUM  
**Time**: 30 minutes

Audit triggers are already added in improved schema. Verify:

```sql
-- Check triggers
SELECT 
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
```

### Task 2.3: Set Up Materialized View Refresh
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**File**: `app/api/cron/refresh-stats/route.ts` (NEW)

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { timingSafeEqual } from 'crypto'

function isValidCronRequest(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || !authHeader) return false
  
  const token = authHeader.slice(7) // Remove 'Bearer '
  
  try {
    const tokenBuffer = Buffer.from(token)
    const secretBuffer = Buffer.from(cronSecret)
    
    if (tokenBuffer.length !== secretBuffer.length) return false
    
    return timingSafeEqual(tokenBuffer, secretBuffer)
  } catch {
    return false
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isValidCronRequest(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Refresh materialized view
    const { error } = await supabaseAdmin.rpc('refresh_user_statistics')

    if (error) {
      console.error('Error refreshing statistics:', error)
      return NextResponse.json(
        { error: 'Failed to refresh statistics' },
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
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
```

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/daily-reset",
      "schedule": "0 4 * * *"
    },
    {
      "path": "/api/cron/refresh-stats",
      "schedule": "*/30 * * * *"
    }
  ]
}
```

---

## 🎯 Phase 3: Type Safety Fixes

### Task 3.1: Remove "as any" Casts
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**File**: `lib/utils/typeConverters.ts` (NEW)

```typescript
import type { Database } from '@/types/database'
import type { StudyBlock, Reading, Pushups, Meditation, Notes, DailyEntry } from '@/types'

// Type-safe converters for database operations

export function toDatabaseDailyEntry(
  entry: Partial<DailyEntry>
): Database['public']['Tables']['daily_entries']['Insert'] {
  return {
    user_id: entry.user_id!,
    entry_date: entry.entry_date!,
    study_blocks: entry.study_blocks as any, // JSONB type
    reading: entry.reading as any,
    pushups: entry.pushups as any,
    meditation: entry.meditation as any,
    water_bottles: entry.water_bottles,
    notes: entry.notes as any,
    daily_score: entry.daily_score ?? 0,
    is_complete: entry.is_complete ?? false,
  }
}

export function fromDatabaseDailyEntry(
  entry: Database['public']['Tables']['daily_entries']['Row']
): DailyEntry {
  return {
    id: entry.id,
    user_id: entry.user_id,
    entry_date: entry.entry_date,
    study_blocks: entry.study_blocks as unknown as StudyBlock[],
    reading: entry.reading as unknown as Reading,
    pushups: entry.pushups as unknown as Pushups,
    meditation: entry.meditation as unknown as Meditation,
    water_bottles: entry.water_bottles,
    notes: entry.notes as unknown as Notes,
    daily_score: entry.daily_score,
    is_complete: entry.is_complete,
    created_at: entry.created_at,
    updated_at: entry.updated_at,
  }
}

export function toDatabaseProfile(
  profile: Partial<Database['public']['Tables']['profiles']['Row']>
): Database['public']['Tables']['profiles']['Insert'] {
  return {
    clerk_user_id: profile.clerk_user_id!,
    email: profile.email!,
    timezone: profile.timezone ?? 'Asia/Kolkata',
    arc_start_date: profile.arc_start_date ?? new Date().toISOString().split('T')[0],
  }
}
```

**Update**: `lib/utils/profile.ts`

```typescript
import { supabaseAdmin } from '@/lib/supabase/server'
import { DEFAULT_TIMEZONE } from '@/lib/constants/targets'
import { toDatabaseProfile } from '@/lib/utils/typeConverters'

export async function getOrCreateProfile(
  clerkUserId: string,
  email: string
): Promise<{ id: string; clerk_user_id: string; email: string; timezone: string; arc_start_date: string }> {
  const { data: profile, error: fetchError } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .eq('clerk_user_id', clerkUserId)
    .single()

  if (profile && !fetchError) {
    return profile
  }

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch profile: ${fetchError.message}`)
  }

  const profileData = toDatabaseProfile({
    clerk_user_id: clerkUserId,
    email,
    timezone: DEFAULT_TIMEZONE,
    arc_start_date: new Date().toISOString().split('T')[0],
  })

  const { data: newProfile, error: createError } = await supabaseAdmin
    .from('profiles')
    .insert(profileData)
    .select()
    .single()

  if (createError) {
    throw new Error(`Failed to create profile: ${createError.message}`)
  }

  if (!newProfile) {
    throw new Error('Failed to create profile: No data returned')
  }

  return newProfile
}
```

### Task 3.2: Add Zod Runtime Validation for JSONB
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**File**: `lib/validation/schemas.ts` (NEW)

```typescript
import { z } from 'zod'

// Runtime validation schemas for JSONB fields
export const StudyBlockSchema = z.object({
  checked: z.boolean(),
  topic: z.string(),
})

export const ReadingSchema = z.object({
  checked: z.boolean(),
  bookName: z.string(),
  pages: z.number().int().min(0).max(1000),
})

export const PushupsSchema = z.object({
  set1: z.boolean(),
  set2: z.boolean(),
  set3: z.boolean(),
  extras: z.number().int().min(0).max(500),
})

export const MeditationSchema = z.object({
  checked: z.boolean(),
  method: z.string(),
  duration: z.number().int().min(0).max(240),
})

export const NotesSchema = z.object({
  morning: z.string().optional().default(''),
  evening: z.string().optional().default(''),
  general: z.string().optional().default(''),
})

// Validate and parse JSONB data
export function parseStudyBlocks(data: unknown): StudyBlock[] {
  return z.array(StudyBlockSchema).length(4).parse(data)
}

export function parseReading(data: unknown): Reading {
  return ReadingSchema.parse(data)
}

export function parsePushups(data: unknown): Pushups {
  return PushupsSchema.parse(data)
}

export function parseMeditation(data: unknown): Meditation {
  return MeditationSchema.parse(data)
}

export function parseNotes(data: unknown): Notes {
  return NotesSchema.parse(data)
}
```

---

## 🚨 Phase 4: Error Handling

### Task 4.1: Create Error Hierarchy
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**File**: `lib/errors/AppError.ts` (NEW)

```typescript
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string,
    public field?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'AppError'
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        field: this.field,
        details: this.details,
        timestamp: new Date().toISOString(),
      }
    }
  }
}

export class ValidationError extends AppError {
  constructor(message: string, field?: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', field, details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'AUTH_ERROR')
    this.name = 'AuthenticationError'
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND')
    this.name = 'NotFoundError'
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 500, 'DB_ERROR', undefined, details)
    this.name = 'DatabaseError'
  }
}

export class RateLimitError extends AppError {
  constructor() {
    super('Too many requests', 429, 'RATE_LIMIT_ERROR')
    this.name = 'RateLimitError'
  }
}
```

### Task 4.2: Create Error Handler Utility
**Priority**: 🟡 MEDIUM  
**Time**: 30 minutes

**File**: `lib/errors/errorHandler.ts` (NEW)

```typescript
import { NextResponse } from 'next/server'
import { AppError } from './AppError'
import { ZodError } from 'zod'

export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error)

  // Handle Zod validation errors
  if (error instanceof ZodError) {
    const fieldErrors = error.issues.reduce((acc, issue) => {
      acc[issue.path.join('.')] = issue.message
      return acc
    }, {} as Record<string, string>)

    return NextResponse.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          fields: fieldErrors,
          timestamp: new Date().toISOString(),
        },
      },
      { status: 400 }
    )
  }

  // Handle our custom errors
  if (error instanceof AppError) {
    return NextResponse.json(error.toJSON(), { status: error.statusCode })
  }

  // Handle generic errors
  return NextResponse.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
        timestamp: new Date().toISOString(),
      },
    },
    { status: 500 }
  )
}
```

### Task 4.3: Add Retry Logic to Client
**Priority**: 🟡 MEDIUM  
**Time**: 30 minutes

**File**: `lib/utils/fetchWithRetry.ts` (NEW)

```typescript
interface RetryOptions {
  retries?: number
  backoff?: number
  onRetry?: (attempt: number, error: Error) => void
}

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<Response> {
  const { retries = 3, backoff = 1000, onRetry } = retryOptions

  let lastError: Error | null = null

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetch(url, options)

      // Don't retry on client errors (4xx)
      if (response.status >= 400 && response.status < 500 && response.status !== 429) {
        return response
      }

      // Retry on server errors (5xx) or rate limit (429)
      if (response.status >= 500 || response.status === 429) {
        throw new Error(`HTTP ${response.status}`)
      }

      return response
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (attempt < retries - 1) {
        const delay = backoff * Math.pow(2, attempt)
        onRetry?.(attempt + 1, lastError)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  throw lastError || new Error('Max retries exceeded')
}
```

Update `useDailyEntry` hook to use retry logic.

---

## ⚡ Phase 5: Performance Optimizations

### Task 5.1: Use Database Aggregation for Dashboard
**Priority**: 🟡 MEDIUM  
**Time**: 1 hour

**File**: `app/api/stats/dashboard/route.ts`

Replace in-memory processing with SQL:

```typescript
// Add this SQL function to your database
CREATE OR REPLACE FUNCTION get_dashboard_stats(p_user_id UUID)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_entries', COUNT(*),
    'completed_days', COUNT(*) FILTER (WHERE is_complete),
    'avg_score', ROUND(AVG(daily_score), 2),
    'study_rate', ROUND(100.0 * COUNT(*) FILTER (
      WHERE (SELECT COUNT(*) FROM jsonb_array_elements(study_blocks) elem 
             WHERE (elem->>'checked')::boolean) = 4
    ) / NULLIF(COUNT(*), 0), 1),
    'reading_rate', ROUND(100.0 * COUNT(*) FILTER (
      WHERE (reading->>'checked')::boolean
    ) / NULLIF(COUNT(*), 0), 1),
    'pushups_rate', ROUND(100.0 * COUNT(*) FILTER (
      WHERE (pushups->>'set1')::boolean AND 
            (pushups->>'set2')::boolean AND 
            (pushups->>'set3')::boolean
    ) / NULLIF(COUNT(*), 0), 1),
    'meditation_rate', ROUND(100.0 * COUNT(*) FILTER (
      WHERE (meditation->>'checked')::boolean
    ) / NULLIF(COUNT(*), 0), 1),
    'water_rate', ROUND(100.0 * COUNT(*) FILTER (
      WHERE (SELECT COUNT(*) = 8 FROM unnest(water_bottles) as b WHERE b)
    ) / NULLIF(COUNT(*), 0), 1)
  ) INTO result
  FROM daily_entries
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;
```

Then in the API route:

```typescript
const { data: stats, error } = await supabaseAdmin
  .rpc('get_dashboard_stats', { p_user_id: profile.id })

if (error) {
  throw new DatabaseError('Failed to fetch dashboard stats', error)
}
```

### Task 5.2: Add Pagination
**Priority**: 🟡 MEDIUM  
**Time**: 30 minutes

**File**: `app/api/daily/range/route.ts`

```typescript
// Add pagination parameters
const url = new URL(request.url)
const from = parseInt(url.searchParams.get('from') || '0')
const to = parseInt(url.searchParams.get('to') || '49')
const startDate = url.searchParams.get('start_date')
const endDate = url.searchParams.get('end_date')

let query = supabaseAdmin
  .from('daily_entries')
  .select('*', { count: 'exact' })
  .eq('user_id', profile.id)
  .order('entry_date', { ascending: false })
  .range(from, to)

if (startDate) {
  query = query.gte('entry_date', startDate)
}

if (endDate) {
  query = query.lte('entry_date', endDate)
}

const { data, error, count } = await query

return NextResponse.json({
  data,
  pagination: {
    from,
    to,
    total: count,
    hasMore: count ? to < count - 1 : false,
  },
})
```

---

## 🧪 Testing Strategy

### Unit Tests

**File**: `__tests__/lib/errors/AppError.test.ts` (NEW)

```typescript
import { describe, it, expect } from '@jest/globals'
import { ValidationError, NotFoundError, DatabaseError } from '@/lib/errors/AppError'

describe('AppError', () => {
  it('should create ValidationError with correct properties', () => {
    const error = new ValidationError('Invalid email', 'email')
    
    expect(error.statusCode).toBe(400)
    expect(error.code).toBe('VALIDATION_ERROR')
    expect(error.field).toBe('email')
    expect(error.message).toBe('Invalid email')
  })

  it('should serialize to JSON correctly', () => {
    const error = new NotFoundError('Profile')
    const json = error.toJSON()
    
    expect(json.error.code).toBe('NOT_FOUND')
    expect(json.error.message).toBe('Profile not found')
    expect(json.error.timestamp).toBeDefined()
  })
})
```

### Integration Tests

**File**: `__tests__/api/daily/today.test.ts` (NEW)

```typescript
import { describe, it, expect } from '@jest/globals'

describe('/api/daily/today', () => {
  it('should return 401 without authentication', async () => {
    const response = await fetch('http://localhost:3000/api/daily/today')
    expect(response.status).toBe(401)
  })

  // Add more tests with authenticated requests
})
```

---

## 📦 Deployment Checklist

### Pre-Deployment
- [ ] All tests passing
- [ ] Database backup created
- [ ] Environment variables validated
- [ ] New indexes created
- [ ] Materialized views created
- [ ] Audit logging enabled
- [ ] Rate limiting tested

### Deployment Steps
1. [ ] Create production database backup
2. [ ] Apply schema improvements (schema-improved.sql)
3. [ ] Deploy code changes
4. [ ] Verify RLS policies
5. [ ] Test critical user flows
6. [ ] Monitor error logs
7. [ ] Check database performance

### Post-Deployment
- [ ] Monitor Sentry/error logs for 24 hours
- [ ] Check database query performance
- [ ] Verify cron jobs running
- [ ] Test rate limiting
- [ ] Verify audit logging
- [ ] Check materialized view refresh

---

## 📞 Support

If you encounter issues during implementation:

1. Check the error logs in Vercel/Supabase
2. Verify environment variables are set
3. Check RLS policies are active
4. Review migration logs

**End of Implementation Guide**
