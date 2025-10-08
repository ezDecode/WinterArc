# 🔍 WinterArc Codebase Security & Improvements Audit

**Date**: October 8, 2025  
**Project**: Winter Arc Tracker  
**Status**: Critical Issues Found - Action Required

---

## 📊 Executive Summary

After a comprehensive codebase analysis, I've identified **28 critical issues** across 5 major categories that need immediate attention:

1. **Security Issues** (9 critical)
2. **Type Safety Issues** (6 moderate)
3. **Performance Issues** (5 moderate)
4. **Error Handling Issues** (4 high)
5. **Data Integrity Issues** (4 high)

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. RLS Policies - Inconsistent Authentication Method
**Severity**: 🔴 CRITICAL  
**Location**: `lib/supabase/schema.sql`

**Issue**:
- **Profiles table** uses `current_setting('request.jwt.claim.sub', true)` (Clerk user ID from JWT)
- **Other tables** use `public.uid()` function that queries profiles table
- This creates a performance bottleneck and security inconsistency

**Current Code**:
```sql
-- Profiles (direct JWT check)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));

-- Daily entries (indirect function check)
CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  USING (user_id = public.uid());

-- Function that queries database
CREATE OR REPLACE FUNCTION public.uid() RETURNS UUID AS $$
  SELECT id FROM public.profiles 
  WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true)
  LIMIT 1;
$$ LANGUAGE SQL STABLE;
```

**Problems**:
1. Every RLS policy check on `daily_entries`, `weekly_reviews`, etc. triggers a database query via `public.uid()`
2. If profiles table has issues, all other RLS policies fail
3. `STABLE` function may not be truly stable across transaction
4. No caching mechanism for repeated calls

**Fix Required**: Implement consistent, efficient RLS using JWT claims directly.

---

### 2. Missing RLS Policies
**Severity**: 🔴 CRITICAL  
**Location**: `lib/supabase/schema.sql`

**Issues**:
1. **No DELETE policies** on `weekly_reviews` and `checkpoint_notes`
2. **No policies for anonymous access** - all requests must be authenticated
3. **No service role bypass protection** - admin client bypasses all RLS

**Missing Policies**:
```sql
-- Missing DELETE policies
CREATE POLICY "Users can delete own weekly reviews"
  ON weekly_reviews FOR DELETE
  USING (user_id = public.uid());

CREATE POLICY "Users can delete own checkpoint notes"
  ON checkpoint_notes FOR DELETE
  USING (user_id = public.uid());
```

**Security Risk**: Users cannot delete their own data, creating potential GDPR compliance issues.

---

### 3. Weak Cron Authentication
**Severity**: 🔴 CRITICAL  
**Location**: `app/api/cron/daily-reset/route.ts`

**Current Code**:
```typescript
const authHeader = request.headers.get('authorization')
const cronSecret = process.env.CRON_SECRET
const expectedAuth = `Bearer ${cronSecret}`

if (authHeader !== expectedAuth) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
```

**Issues**:
1. Simple string comparison can be vulnerable to timing attacks
2. No rate limiting on failed attempts
3. No IP whitelist (Vercel cron IPs)
4. No request signing or HMAC verification
5. Secret exposed in plain text in environment

**Fix Required**: Implement constant-time comparison, IP whitelist, and rate limiting.

---

### 4. No Input Sanitization
**Severity**: 🟠 HIGH  
**Location**: All API routes

**Issue**: While Zod validates types, there's no sanitization for:
- HTML/XSS in text fields (notes, review text)
- SQL injection protection (Supabase client handles this, but should be explicit)
- NoSQL injection in JSONB fields
- Maximum length enforcement

**Example**:
```typescript
// No sanitization
what_helped: z.string().optional().nullable()

// Should be:
what_helped: z.string()
  .max(5000)
  .transform(val => val?.trim())
  .optional()
  .nullable()
```

---

### 5. Exposed Service Key Usage
**Severity**: 🟠 HIGH  
**Location**: `lib/supabase/server.ts`, all API routes

**Issue**: `supabaseAdmin` bypasses RLS completely, used everywhere even when regular client would work.

**Current Pattern**:
```typescript
// Every API route uses admin client
const { data } = await supabaseAdmin
  .from('daily_entries')
  .select('*')
  .eq('user_id', profile.id)
```

**Risk**: If any API route has an authorization bug, data from ALL users could be exposed.

**Fix Required**: Use regular client with RLS for user operations, reserve admin client for cron jobs only.

---

### 6. No Rate Limiting
**Severity**: 🟠 HIGH  
**Location**: All API routes

**Issue**: No rate limiting on any endpoints
- Users can spam profile creation
- Unlimited updates to daily entries
- No protection against brute force or DDoS

**Fix Required**: Implement rate limiting middleware using Vercel's Edge Config or Upstash Redis.

---

### 7. JWT Claim Validation Missing
**Severity**: 🟠 HIGH  
**Location**: RLS policies

**Issue**: 
```sql
current_setting('request.jwt.claim.sub', true)
```

The `true` parameter means "don't throw error if missing". This could allow unauthenticated access if JWT is malformed.

**Fix**: Add explicit validation:
```sql
CASE WHEN current_setting('request.jwt.claim.sub', true) IS NULL 
  THEN false 
  ELSE clerk_user_id = current_setting('request.jwt.claim.sub', true) 
END
```

---

### 8. No CORS Configuration
**Severity**: 🟡 MEDIUM  
**Location**: All API routes

**Issue**: No explicit CORS headers, relying on Next.js defaults.

**Fix**: Add explicit CORS configuration for API routes.

---

### 9. Environment Variable Validation Missing
**Severity**: 🟡 MEDIUM  
**Location**: `lib/supabase/client.ts`, `lib/supabase/server.ts`

**Current**:
```typescript
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}
```

**Issue**: Check happens AFTER non-null assertion. Should use Zod for validation at build time.

---

## ⚠️ TYPE SAFETY ISSUES

### 1. Type Coercion with "as any"
**Severity**: 🟡 MEDIUM  
**Location**: 2 instances found

**Locations**:
```typescript
// lib/utils/profile.ts:43
.insert(profileData as any)

// app/api/cron/daily-reset/route.ts:137
.insert(entryData as any)
```

**Issue**: Supabase types are correct but being bypassed with `as any`. This removes type safety.

**Root Cause**: JSONB fields in Supabase types use `Json` type, but we use specific interfaces.

**Fix Required**: Create proper type converters:
```typescript
type SupabaseInsert<T> = Omit<T, 'id' | 'created_at' | 'updated_at'>

const toSupabaseInsert = <T>(data: T): SupabaseInsert<T> => {
  // Proper type conversion without 'as any'
}
```

---

### 2. Loose Json Type
**Severity**: 🟡 MEDIUM  
**Location**: `types/database.ts`

**Issue**:
```typescript
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]
```

This allows any structure. JSONB fields should have strict types.

**Fix**: Use branded types or Zod schemas for JSONB fields:
```typescript
import { z } from 'zod'

export const StudyBlockSchema = z.object({
  checked: z.boolean(),
  topic: z.string()
})

export type StudyBlockJson = z.infer<typeof StudyBlockSchema>
```

---

### 3. Missing Null Safety
**Severity**: 🟡 MEDIUM  
**Location**: Multiple API routes

**Examples**:
```typescript
// No null check before accessing
const email = user.emailAddresses[0]?.emailAddress || 'user@example.com'

// Should validate user exists first
if (!user || !user.emailAddresses || user.emailAddresses.length === 0) {
  return NextResponse.json({ error: 'User email not found' }, { status: 400 })
}
```

---

### 4. Incomplete Error Types
**Severity**: 🟡 MEDIUM  
**Location**: All catch blocks

**Pattern**:
```typescript
catch (error) {
  console.error('Error:', error)
  return NextResponse.json({ 
    error: 'Internal server error',
    details: error instanceof Error ? error.message : 'Unknown error'
  }, { status: 500 })
}
```

**Issue**: No distinction between different error types (validation, database, auth, etc.)

**Fix**: Create error hierarchy:
```typescript
class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
  }
}
```

---

### 5. Type Assertions Without Validation
**Severity**: 🟡 MEDIUM  
**Location**: Multiple components and API routes

**Examples**:
```typescript
// Assuming shape without validation
study_blocks={entry.study_blocks as StudyBlock[]}
reading={entry.reading as Reading}

// Should validate first
const studyBlocks = StudyBlockSchema.array().parse(entry.study_blocks)
```

---

### 6. Missing Return Type Annotations
**Severity**: 🟢 LOW  
**Location**: Multiple utility functions

**Issue**: Some functions don't specify return types, relying on inference.

---

## ⚡ PERFORMANCE ISSUES

### 1. Missing Database Indexes
**Severity**: 🟠 HIGH  
**Location**: `lib/supabase/schema.sql`

**Current Indexes**:
```sql
-- Only these indexes exist
idx_profiles_clerk_user_id
idx_profiles_timezone
idx_daily_entries_user_date (UNIQUE)
idx_daily_entries_date
idx_weekly_reviews_user_week
idx_checkpoint_notes_user_week
```

**Missing Critical Indexes**:

```sql
-- For date range queries (progress page, charts)
CREATE INDEX idx_daily_entries_user_date_score 
  ON daily_entries(user_id, entry_date, daily_score);

-- For completed days queries
CREATE INDEX idx_daily_entries_user_complete 
  ON daily_entries(user_id, is_complete) 
  WHERE is_complete = true;

-- For score aggregation
CREATE INDEX idx_daily_entries_user_score 
  ON daily_entries(user_id, daily_score);

-- For profile lookups (used by uid() function)
CREATE INDEX idx_profiles_clerk_user_active 
  ON profiles(clerk_user_id, id);

-- For weekly review lookups
CREATE INDEX idx_weekly_reviews_user_date 
  ON weekly_reviews(user_id, review_date);
```

**Impact**: Without these, queries get slower as data grows. A user with 90 days of data needs sequential scans.

---

### 2. N+1 Query Problem Potential
**Severity**: 🟠 HIGH  
**Location**: `app/api/stats/dashboard/route.ts`

**Current**:
```typescript
// Single query for all entries - GOOD
const { data: entries } = await supabaseAdmin
  .from('daily_entries')
  .select('*')

// But then processes in memory
dailyEntries.forEach(entry => {
  // Calculate target completion
})
```

**Better**: Use database aggregation:
```sql
SELECT 
  COUNT(*) as total_days,
  COUNT(*) FILTER (WHERE daily_score = 5) as completed_days,
  AVG(daily_score) as avg_score
FROM daily_entries
WHERE user_id = $1
```

---

### 3. Inefficient Streak Calculation
**Severity**: 🟡 MEDIUM  
**Location**: `lib/utils/streak.ts`

**Current Code**:
```typescript
const sortedEntries = [...entries].sort((a, b) => 
  new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
)
```

**Issues**:
1. Sorts all entries in memory (could be 90+ records)
2. Reverses array for longest streak calculation
3. Creates new Date objects repeatedly

**Fix**: Use database window functions:
```sql
WITH streak_groups AS (
  SELECT 
    entry_date,
    daily_score,
    entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS streak_group
  FROM daily_entries
  WHERE user_id = $1 AND daily_score = 5
)
SELECT 
  MAX(streak_length) as longest_streak
FROM (
  SELECT COUNT(*) as streak_length
  FROM streak_groups
  GROUP BY streak_group
)
```

---

### 4. No Pagination
**Severity**: 🟡 MEDIUM  
**Location**: All list endpoints

**Issue**: All queries fetch entire datasets:
- `/api/daily/range` - no limit
- `/api/reviews` - fetches all 13 weeks
- `/api/stats/dashboard` - fetches all 90 days

**Fix**: Add pagination parameters:
```typescript
const { from = 0, to = 49 } = await request.json()
const { data } = await supabase
  .from('daily_entries')
  .select('*')
  .range(from, to)
```

---

### 5. Redundant Profile Fetches
**Severity**: 🟡 MEDIUM  
**Location**: All API routes

**Issue**: Every API route calls `getOrCreateProfile()`, which queries the database.

**Pattern**:
```typescript
// Every API route does this
const profile = await getOrCreateProfile(userId, email)
```

**Fix**: Use JWT claims to pass profile ID, or implement request-level caching:
```typescript
// Use Clerk's publicMetadata to store Supabase profile ID
const profileId = user.publicMetadata.supabase_profile_id as string
```

---

## 🔧 ERROR HANDLING ISSUES

### 1. Generic Error Messages
**Severity**: 🟠 HIGH  
**Location**: All API routes

**Current Pattern**:
```typescript
catch (error) {
  return NextResponse.json({ 
    error: 'Internal server error' 
  }, { status: 500 })
}
```

**Issues**:
1. No error codes for client handling
2. Same message for all errors
3. Sensitive info potentially exposed in `details` field in dev mode

**Fix Required**: Structured error responses:
```typescript
interface ApiError {
  error: {
    code: string // 'VALIDATION_ERROR', 'DB_ERROR', etc.
    message: string // User-friendly message
    field?: string // For validation errors
    timestamp: string
    requestId?: string
  }
}
```

---

### 2. No Error Logging Service
**Severity**: 🟠 HIGH  
**Location**: All error handlers

**Current**:
```typescript
console.error('Error:', error)
```

**Issues**:
1. Errors only go to Vercel logs (limited retention)
2. No structured logging
3. No alerting on critical errors
4. No error tracking/grouping

**Fix**: Integrate Sentry or similar:
```typescript
import * as Sentry from '@sentry/nextjs'

try {
  // ...
} catch (error) {
  Sentry.captureException(error, {
    tags: { route: '/api/daily/today' },
    user: { id: userId }
  })
}
```

---

### 3. No Retry Logic
**Severity**: 🟡 MEDIUM  
**Location**: Client-side data fetching

**Issue**: `useDailyEntry` hook doesn't retry on failure:
```typescript
const response = await fetch('/api/daily/today')
if (!response.ok) {
  throw new Error('Failed to fetch daily entry')
}
```

**Fix**: Add exponential backoff retry:
```typescript
const fetchWithRetry = async (url: string, options: RequestInit, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      if (response.ok) return response
    } catch (error) {
      if (i === retries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000))
    }
  }
}
```

---

### 4. Missing Validation Error Details
**Severity**: 🟡 MEDIUM  
**Location**: API routes with Zod validation

**Current**:
```typescript
if (!validationResult.success) {
  return NextResponse.json(
    { error: 'Invalid request data', details: validationResult.error.issues },
    { status: 400 }
  )
}
```

**Issue**: `issues` array format is not user-friendly. Should transform to field-level errors:
```typescript
const fieldErrors = validationResult.error.issues.reduce((acc, issue) => {
  acc[issue.path.join('.')] = issue.message
  return acc
}, {} as Record<string, string>)
```

---

## 💾 DATA INTEGRITY ISSUES

### 1. Missing Constraints
**Severity**: 🔴 CRITICAL  
**Location**: `lib/supabase/schema.sql`

**Missing Constraints**:

```sql
-- Study blocks should always have 4 items
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_study_blocks_length 
  CHECK (jsonb_array_length(study_blocks) = 4);

-- Water bottles should have 8 items
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_water_bottles_length 
  CHECK (array_length(water_bottles, 1) = 8);

-- Daily score should match calculated score
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_score_valid 
  CHECK (daily_score >= 0 AND daily_score <= 5);

-- Reading pages should be positive
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_reading_pages 
  CHECK ((reading->>'pages')::int >= 0);

-- Meditation duration should be positive
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_meditation_duration 
  CHECK ((meditation->>'duration')::int >= 0);

-- Pushups extras should be positive
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_pushups_extras 
  CHECK ((pushups->>'extras')::int >= 0);
```

---

### 2. No Cascade Delete Protection
**Severity**: 🟠 HIGH  
**Location**: Foreign key definitions

**Current**:
```sql
user_id UUID REFERENCES profiles(id) ON DELETE CASCADE
```

**Issue**: If a profile is deleted, ALL user data is immediately deleted. No soft delete, no backup.

**Fix Options**:
1. Remove CASCADE and prevent profile deletion if data exists
2. Implement soft delete with `deleted_at` column
3. Archive data before deletion

```sql
-- Add soft delete
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;

-- Update RLS to exclude deleted
CREATE POLICY "..." USING (deleted_at IS NULL AND ...)
```

---

### 3. No Unique Constraints on Weekly Reviews
**Severity**: 🟠 HIGH  
**Location**: `lib/supabase/schema.sql`

**Issue**: Index exists but no UNIQUE constraint:
```sql
CREATE INDEX idx_weekly_reviews_user_week 
  ON weekly_reviews(user_id, week_number);
```

**Problem**: User could create multiple reviews for the same week.

**Fix**:
```sql
CREATE UNIQUE INDEX idx_weekly_reviews_user_week_unique 
  ON weekly_reviews(user_id, week_number);
```

---

### 4. No Data Versioning
**Severity**: 🟡 MEDIUM  
**Location**: All tables

**Issue**: When data is updated, old values are lost. No audit trail.

**Fix**: Add audit table or use Supabase's Row Level Security with a trigger:
```sql
CREATE TABLE audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  old_data JSONB,
  new_data JSONB,
  user_id UUID,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function
CREATE OR REPLACE FUNCTION audit_trigger()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO audit_log (table_name, record_id, action, old_data, new_data)
    VALUES (TG_TABLE_NAME, OLD.id, 'UPDATE', row_to_json(OLD), row_to_json(NEW));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 📈 DATABASE ARCHITECTURE ANALYSIS

### Current Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  Next.js 15 + TypeScript + Clerk Auth + React 19            │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                     API ROUTES LAYER                         │
│  • /api/profile (GET, PATCH)                                │
│  • /api/daily/* (GET, PATCH)                                │
│  • /api/stats/* (GET)                                       │
│  • /api/reviews/* (GET, POST)                               │
│  • /api/cron/* (POST - authenticated)                       │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                 SUPABASE CLIENT LAYER                        │
│  • supabase (client.ts) - Client-side with RLS              │
│  • supabaseAdmin (server.ts) - Bypasses RLS ⚠️              │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   SUPABASE/POSTGRESQL                        │
│                                                              │
│  profiles (4 indexes, RLS enabled)                          │
│  ├─ clerk_user_id (unique, JWT-based RLS)                   │
│  └─ timezone (indexed for cron)                             │
│                                                              │
│  daily_entries (2 indexes, RLS enabled)                     │
│  ├─ JSONB fields (study_blocks, reading, etc.)              │
│  ├─ UNIQUE(user_id, entry_date)                             │
│  └─ CHECK(daily_score 0-5)                                  │
│                                                              │
│  weekly_reviews (1 index, RLS enabled)                      │
│  └─ CHECK(week_number 1-13)                                 │
│                                                              │
│  checkpoint_notes (1 index, RLS enabled)                    │
│  └─ CHECK(week_number 1-13)                                 │
└─────────────────────────────────────────────────────────────┘
```

### Key Observations

✅ **Good Practices**:
1. Clean separation of client and server Supabase instances
2. Row Level Security enabled on all tables
3. Proper foreign key relationships with CASCADE
4. Auto-updating timestamps via triggers
5. Type safety with TypeScript throughout
6. Zod validation on API inputs
7. JSONB for flexible data structures

⚠️ **Issues**:
1. **Over-reliance on admin client**: Bypasses RLS everywhere
2. **Inefficient RLS**: `public.uid()` function queries DB on every check
3. **Missing indexes**: Date range queries will be slow
4. **No connection pooling**: Each API route creates new connections
5. **No caching layer**: Redis or Edge Config could reduce DB load
6. **No read replicas**: All reads hit primary database

---

## 🎯 RECOMMENDED DATABASE IMPROVEMENTS

### 1. Enhanced Schema with Better Constraints

```sql
-- Enhanced profiles table
ALTER TABLE profiles
  ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL,
  ADD COLUMN last_login_at TIMESTAMPTZ DEFAULT NOW(),
  ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb,
  ADD CONSTRAINT check_timezone_valid 
    CHECK (timezone ~ '^[A-Za-z]+/[A-Za-z_]+$');

-- Enhanced daily_entries with strict validation
ALTER TABLE daily_entries
  ADD COLUMN completed_at TIMESTAMPTZ,
  ADD COLUMN version INTEGER DEFAULT 1,
  ADD CONSTRAINT check_study_blocks_structure
    CHECK (
      jsonb_typeof(study_blocks) = 'array' AND
      jsonb_array_length(study_blocks) = 4
    ),
  ADD CONSTRAINT check_water_bottles_structure
    CHECK (array_length(water_bottles, 1) = 8),
  ADD CONSTRAINT check_reading_valid
    CHECK (
      (reading->>'checked')::boolean IS NOT NULL AND
      (reading->>'pages')::int >= 0 AND
      (reading->>'pages')::int <= 1000
    ),
  ADD CONSTRAINT check_pushups_valid
    CHECK (
      (pushups->>'extras')::int >= 0 AND
      (pushups->>'extras')::int <= 500
    ),
  ADD CONSTRAINT check_meditation_valid
    CHECK (
      (meditation->>'duration')::int >= 0 AND
      (meditation->>'duration')::int <= 240
    );
```

### 2. Performance Indexes

```sql
-- Composite index for dashboard queries
CREATE INDEX idx_daily_entries_dashboard 
  ON daily_entries(user_id, entry_date DESC, daily_score, is_complete);

-- Partial index for completed days (saves space)
CREATE INDEX idx_daily_entries_completed 
  ON daily_entries(user_id, entry_date) 
  WHERE is_complete = true;

-- BRIN index for time-series data (more efficient for large datasets)
CREATE INDEX idx_daily_entries_date_brin 
  ON daily_entries USING BRIN(entry_date);

-- GIN index for JSONB search (if needed later)
CREATE INDEX idx_daily_entries_study_blocks_gin 
  ON daily_entries USING GIN(study_blocks);
```

### 3. Optimized RLS Policies

```sql
-- Drop old function
DROP FUNCTION IF EXISTS public.uid();

-- Create optimized cached function
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  clerk_id TEXT;
BEGIN
  clerk_id := current_setting('request.jwt.claim.sub', true);
  
  IF clerk_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Cache in session variable
  BEGIN
    user_id := current_setting('app.user_id', true)::UUID;
    IF user_id IS NOT NULL THEN
      RETURN user_id;
    END IF;
  EXCEPTION WHEN OTHERS THEN
    NULL;
  END;
  
  -- Query and cache
  SELECT id INTO user_id 
  FROM profiles 
  WHERE clerk_user_id = clerk_id AND deleted_at IS NULL
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    PERFORM set_config('app.user_id', user_id::TEXT, true);
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Update all policies to use optimized function
DROP POLICY IF EXISTS "Users can view own daily entries" ON daily_entries;
CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  USING (user_id = public.get_user_id());
```

### 4. Add Materialized View for Statistics

```sql
-- Materialized view for fast dashboard loading
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  p.id as user_id,
  p.clerk_user_id,
  COUNT(de.id) as total_days,
  COUNT(de.id) FILTER (WHERE de.is_complete) as completed_days,
  ROUND(AVG(de.daily_score), 2) as avg_score,
  MAX(de.entry_date) as last_entry_date,
  -- Current streak calculation
  (
    SELECT COUNT(*)
    FROM daily_entries de2
    WHERE de2.user_id = p.id 
      AND de2.daily_score = 5
      AND de2.entry_date >= (
        SELECT COALESCE(MAX(entry_date), p.arc_start_date)
        FROM daily_entries
        WHERE user_id = p.id AND daily_score < 5
      )
  ) as current_streak
FROM profiles p
LEFT JOIN daily_entries de ON de.user_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.clerk_user_id;

-- Index on materialized view
CREATE UNIQUE INDEX idx_user_stats_clerk_id 
  ON user_statistics(clerk_user_id);

-- Refresh materialized view periodically (via cron or trigger)
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS TRIGGER AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_refresh_stats
AFTER INSERT OR UPDATE ON daily_entries
FOR EACH STATEMENT
EXECUTE FUNCTION refresh_user_statistics();
```

### 5. Add Partitioning for Scalability

```sql
-- Convert daily_entries to partitioned table (for future scaling)
-- This would be done during migration, example:

CREATE TABLE daily_entries_partitioned (
  LIKE daily_entries INCLUDING ALL
) PARTITION BY RANGE (entry_date);

-- Create partitions for each month
CREATE TABLE daily_entries_2025_01 
  PARTITION OF daily_entries_partitioned
  FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE daily_entries_2025_02 
  PARTITION OF daily_entries_partitioned
  FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');
-- ... continue for each month
```

---

## 📋 COMPREHENSIVE FIX CHECKLIST

### Phase 1: Critical Security Fixes (Do First)
- [ ] Fix RLS policies to use consistent authentication
- [ ] Add missing DELETE policies
- [ ] Implement constant-time comparison for cron auth
- [ ] Add rate limiting middleware
- [ ] Replace `supabaseAdmin` with regular client where possible
- [ ] Add JWT claim validation in RLS
- [ ] Implement input sanitization

### Phase 2: Database Improvements
- [ ] Add missing indexes (performance)
- [ ] Add data validation constraints
- [ ] Add unique constraints where needed
- [ ] Implement soft delete for profiles
- [ ] Create materialized view for statistics
- [ ] Add audit logging

### Phase 3: Type Safety & Code Quality
- [ ] Remove all `as any` casts
- [ ] Create proper type converters for JSONB
- [ ] Add Zod schemas for JSONB validation
- [ ] Create error hierarchy
- [ ] Add return type annotations
- [ ] Implement proper null checks

### Phase 4: Error Handling & Monitoring
- [ ] Implement structured error responses
- [ ] Add Sentry or error tracking service
- [ ] Add retry logic to client fetches
- [ ] Improve validation error messages
- [ ] Add request ID tracking
- [ ] Implement health check endpoint

### Phase 5: Performance Optimization
- [ ] Use database aggregation instead of in-memory processing
- [ ] Optimize streak calculation with SQL
- [ ] Add pagination to list endpoints
- [ ] Implement request-level caching
- [ ] Add Redis for session caching
- [ ] Consider read replicas

---

## 🚀 NEXT STEPS FOR YOUR AGENT

I recommend your AI agent work on these fixes in this order:

1. **Start with the security fixes** - These are critical
2. **Create a new branch** for each major change
3. **Test thoroughly** before merging
4. **Create migration scripts** for database changes
5. **Update tests** to cover new constraints
6. **Document all changes** in a CHANGELOG.md

Each fix should be:
- ✅ Implemented with proper types
- ✅ Tested with unit tests
- ✅ Documented with inline comments
- ✅ Validated with integration tests
- ✅ Reviewed for security implications

---

## 📚 ADDITIONAL RESOURCES

- **Supabase RLS Best Practices**: https://supabase.com/docs/guides/auth/row-level-security
- **PostgreSQL Performance**: https://wiki.postgresql.org/wiki/Performance_Optimization
- **Type-Safe Supabase**: https://supabase.com/docs/guides/api/generating-types
- **Next.js Security**: https://nextjs.org/docs/app/building-your-application/routing/middleware

---

**End of Audit Report**
