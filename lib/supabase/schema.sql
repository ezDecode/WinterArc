-- ============================================================================
-- WINTER ARC TRACKER - IMPROVED DATABASE SCHEMA
-- ============================================================================
-- Version: 2.0
-- Date: October 8, 2025
-- Author: AI Assistant
--
-- IMPROVEMENTS OVER v1:
-- 1. Optimized RLS policies with caching
-- 2. Additional performance indexes (10+ new indexes)
-- 3. Strict data validation constraints
-- 4. Soft delete support
-- 5. Audit logging
-- 6. Materialized views for statistics
-- 7. Better error handling
-- 8. GDPR compliance features
--
-- MIGRATION NOTES:
-- - This schema can be applied to existing database
-- - Existing data will not be lost
-- - See migration guide in MIGRATION_GUIDE.md
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search if needed

-- ============================================================================
-- PROFILES TABLE (Enhanced)
-- ============================================================================

-- Add new columns to existing profiles table (safe to run multiple times)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'deleted_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ DEFAULT NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ DEFAULT NOW();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'profiles' AND column_name = 'metadata'
  ) THEN
    ALTER TABLE profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add constraints
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_timezone_valid'
  ) THEN
    ALTER TABLE profiles 
      ADD CONSTRAINT check_timezone_valid 
      CHECK (timezone ~ '^[A-Za-z]+/[A-Za-z_]+$');
  END IF;
END $$;

-- Enhanced indexes for profiles
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id_active ON profiles(clerk_user_id, id) WHERE deleted_at IS NULL;

-- ============================================================================
-- DAILY ENTRIES TABLE (Enhanced)
-- ============================================================================

-- Add new columns
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_entries' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN completed_at TIMESTAMPTZ;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'daily_entries' AND column_name = 'version'
  ) THEN
    ALTER TABLE daily_entries ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- Add strict validation constraints
DO $$ 
BEGIN
  -- Study blocks structure validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_study_blocks_structure'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_study_blocks_structure
      CHECK (
        jsonb_typeof(study_blocks) = 'array' AND
        jsonb_array_length(study_blocks) = 4 AND
        (
          SELECT bool_and(
            elem ? 'checked' AND 
            elem ? 'topic' AND
            jsonb_typeof(elem->'checked') = 'boolean' AND
            jsonb_typeof(elem->'topic') = 'string'
          )
          FROM jsonb_array_elements(study_blocks) elem
        )
      );
  END IF;

  -- Water bottles validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_water_bottles_structure'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_water_bottles_structure
      CHECK (array_length(water_bottles, 1) = 8);
  END IF;

  -- Reading validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_reading_valid'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_reading_valid
      CHECK (
        reading ? 'checked' AND
        reading ? 'bookName' AND
        reading ? 'pages' AND
        jsonb_typeof(reading->'checked') = 'boolean' AND
        jsonb_typeof(reading->'bookName') = 'string' AND
        jsonb_typeof(reading->'pages') = 'number' AND
        (reading->>'pages')::int >= 0 AND
        (reading->>'pages')::int <= 1000
      );
  END IF;

  -- Pushups validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_pushups_valid'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_pushups_valid
      CHECK (
        pushups ? 'set1' AND
        pushups ? 'set2' AND
        pushups ? 'set3' AND
        pushups ? 'extras' AND
        jsonb_typeof(pushups->'set1') = 'boolean' AND
        jsonb_typeof(pushups->'set2') = 'boolean' AND
        jsonb_typeof(pushups->'set3') = 'boolean' AND
        jsonb_typeof(pushups->'extras') = 'number' AND
        (pushups->>'extras')::int >= 0 AND
        (pushups->>'extras')::int <= 500
      );
  END IF;

  -- Meditation validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_meditation_valid'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_meditation_valid
      CHECK (
        meditation ? 'checked' AND
        meditation ? 'method' AND
        meditation ? 'duration' AND
        jsonb_typeof(meditation->'checked') = 'boolean' AND
        jsonb_typeof(meditation->'method') = 'string' AND
        jsonb_typeof(meditation->'duration') = 'number' AND
        (meditation->>'duration')::int >= 0 AND
        (meditation->>'duration')::int <= 240
      );
  END IF;

  -- Notes validation
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'check_notes_valid'
  ) THEN
    ALTER TABLE daily_entries 
      ADD CONSTRAINT check_notes_valid
      CHECK (
        notes ? 'morning' AND
        notes ? 'evening' AND
        notes ? 'general' AND
        jsonb_typeof(notes->'morning') IN ('string', 'null') AND
        jsonb_typeof(notes->'evening') IN ('string', 'null') AND
        jsonb_typeof(notes->'general') IN ('string', 'null')
      );
  END IF;
END $$;

-- Performance indexes for daily_entries
CREATE INDEX IF NOT EXISTS idx_daily_entries_dashboard 
  ON daily_entries(user_id, entry_date DESC, daily_score, is_complete);

CREATE INDEX IF NOT EXISTS idx_daily_entries_completed 
  ON daily_entries(user_id, entry_date) 
  WHERE is_complete = true;

CREATE INDEX IF NOT EXISTS idx_daily_entries_score_filter 
  ON daily_entries(user_id, daily_score) 
  WHERE daily_score = 5;

CREATE INDEX IF NOT EXISTS idx_daily_entries_date_range 
  ON daily_entries(user_id, entry_date, daily_score, is_complete);

-- BRIN index for time-series efficiency (better for large datasets)
CREATE INDEX IF NOT EXISTS idx_daily_entries_date_brin 
  ON daily_entries USING BRIN(entry_date);

-- GIN index for JSONB search capabilities
CREATE INDEX IF NOT EXISTS idx_daily_entries_study_blocks_gin 
  ON daily_entries USING GIN(study_blocks);

CREATE INDEX IF NOT EXISTS idx_daily_entries_notes_gin 
  ON daily_entries USING GIN(notes);

-- ============================================================================
-- WEEKLY REVIEWS TABLE (Enhanced)
-- ============================================================================

-- Make user_week combination unique
DROP INDEX IF EXISTS idx_weekly_reviews_user_week;
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reviews_user_week_unique 
  ON weekly_reviews(user_id, week_number);

-- Add additional indexes
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_date 
  ON weekly_reviews(user_id, review_date DESC);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_completed 
  ON weekly_reviews(user_id, days_hit_all) 
  WHERE days_hit_all > 0;

-- ============================================================================
-- CHECKPOINT NOTES TABLE (Enhanced)
-- ============================================================================

-- Make user_week combination unique
DROP INDEX IF EXISTS idx_checkpoint_notes_user_week;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkpoint_notes_user_week_unique 
  ON checkpoint_notes(user_id, week_number);

-- ============================================================================
-- AUDIT LOG TABLE (New)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for audit log
CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
  ON audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user 
  ON audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_created 
  ON audit_log(created_at DESC);

-- Partition audit_log by month for better performance
-- (Uncomment when ready for production)
/*
ALTER TABLE audit_log 
  ADD CONSTRAINT audit_log_created_at_check 
  CHECK (created_at >= '2025-01-01');

CREATE TABLE audit_log_2025_10 PARTITION OF audit_log
  FOR VALUES FROM ('2025-10-01') TO ('2025-11-01');
*/

-- ============================================================================
-- OPTIMIZED RLS FUNCTIONS
-- ============================================================================

-- Drop old inefficient function
DROP FUNCTION IF EXISTS public.uid();

-- Create optimized user ID function with session caching
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  clerk_id TEXT;
BEGIN
  -- Get Clerk ID from JWT
  clerk_id := current_setting('request.jwt.claim.sub', true);
  
  -- Return NULL if no JWT claim (unauthenticated request)
  IF clerk_id IS NULL OR clerk_id = '' THEN
    RETURN NULL;
  END IF;
  
  -- Try to get from session cache first
  BEGIN
    user_id := current_setting('app.user_id', true)::UUID;
    IF user_id IS NOT NULL THEN
      RETURN user_id;
    END IF;
  EXCEPTION 
    WHEN OTHERS THEN
      NULL; -- Cache miss, continue to query
  END;
  
  -- Query database and cache result
  SELECT id INTO user_id 
  FROM profiles 
  WHERE clerk_user_id = clerk_id 
    AND deleted_at IS NULL
  LIMIT 1;
  
  -- Cache the result in session variable
  IF user_id IS NOT NULL THEN
    PERFORM set_config('app.user_id', user_id::TEXT, true);
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to check if user is admin (for future use)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_metadata JSONB;
BEGIN
  SELECT metadata INTO user_metadata
  FROM profiles
  WHERE id = public.get_user_id();
  
  RETURN COALESCE((user_metadata->>'is_admin')::BOOLEAN, false);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- UPDATED RLS POLICIES
-- ============================================================================

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can view own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can insert own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can update own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can delete own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can view own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can insert own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can update own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can view own checkpoint notes" ON checkpoint_notes;
DROP POLICY IF EXISTS "Users can insert own checkpoint notes" ON checkpoint_notes;
DROP POLICY IF EXISTS "Users can update own checkpoint notes" ON checkpoint_notes;

-- ============================================================================
-- PROFILES TABLE RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (
    clerk_user_id = current_setting('request.jwt.claim.sub', true)
    AND deleted_at IS NULL
  );

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claim.sub', true)
  );

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (
    clerk_user_id = current_setting('request.jwt.claim.sub', true)
    AND deleted_at IS NULL
  )
  WITH CHECK (
    clerk_user_id = current_setting('request.jwt.claim.sub', true)
    AND deleted_at IS NULL
  );

-- Soft delete policy (prevent hard deletes)
CREATE POLICY "Users cannot delete profiles"
  ON profiles FOR DELETE
  USING (false);

-- ============================================================================
-- DAILY ENTRIES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Users can insert own daily entries"
  ON daily_entries FOR INSERT
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can update own daily entries"
  ON daily_entries FOR UPDATE
  USING (user_id = public.get_user_id())
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can delete own daily entries"
  ON daily_entries FOR DELETE
  USING (user_id = public.get_user_id());

-- ============================================================================
-- WEEKLY REVIEWS RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own weekly reviews"
  ON weekly_reviews FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_reviews FOR INSERT
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  USING (user_id = public.get_user_id())
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can delete own weekly reviews"
  ON weekly_reviews FOR DELETE
  USING (user_id = public.get_user_id());

-- ============================================================================
-- CHECKPOINT NOTES RLS POLICIES
-- ============================================================================

CREATE POLICY "Users can view own checkpoint notes"
  ON checkpoint_notes FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "Users can insert own checkpoint notes"
  ON checkpoint_notes FOR INSERT
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can update own checkpoint notes"
  ON checkpoint_notes FOR UPDATE
  USING (user_id = public.get_user_id())
  WITH CHECK (user_id = public.get_user_id());

CREATE POLICY "Users can delete own checkpoint notes"
  ON checkpoint_notes FOR DELETE
  USING (user_id = public.get_user_id());

-- ============================================================================
-- AUDIT LOG RLS POLICIES
-- ============================================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Users can only view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (user_id = public.get_user_id());

-- Only system can insert audit logs
CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- No one can update or delete audit logs (immutable)
CREATE POLICY "Audit logs are immutable"
  ON audit_log FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON audit_log FOR DELETE
  USING (false);

-- ============================================================================
-- AUDIT TRIGGERS
-- ============================================================================

-- Function to create audit log entries
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
BEGIN
  -- Prepare data based on operation
  IF (TG_OP = 'DELETE') THEN
    old_data := row_to_json(OLD)::JSONB;
    new_data := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data := row_to_json(OLD)::JSONB;
    new_data := row_to_json(NEW)::JSONB;
    
    -- Calculate changed fields
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(old_data)
    WHERE old_data->key IS DISTINCT FROM new_data->key;
  ELSIF (TG_OP = 'INSERT') THEN
    old_data := NULL;
    new_data := row_to_json(NEW)::JSONB;
  END IF;

  -- Insert audit log
  INSERT INTO audit_log (
    table_name,
    record_id,
    user_id,
    action,
    old_data,
    new_data,
    changed_fields
  ) VALUES (
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    COALESCE(NEW.user_id, OLD.user_id, public.get_user_id()),
    TG_OP,
    old_data,
    new_data,
    changed_fields
  );

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add audit triggers to tables
DROP TRIGGER IF EXISTS audit_daily_entries ON daily_entries;
CREATE TRIGGER audit_daily_entries
  AFTER INSERT OR UPDATE OR DELETE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_weekly_reviews ON weekly_reviews;
CREATE TRIGGER audit_weekly_reviews
  AFTER INSERT OR UPDATE OR DELETE ON weekly_reviews
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_profiles ON profiles;
CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- ============================================================================
-- MATERIALIZED VIEW FOR STATISTICS
-- ============================================================================

-- Drop existing view if it exists
DROP MATERIALIZED VIEW IF EXISTS user_statistics CASCADE;

-- Create optimized materialized view
CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  p.id as user_id,
  p.clerk_user_id,
  p.email,
  p.timezone,
  p.arc_start_date,
  
  -- Entry statistics
  COUNT(de.id) as total_entries,
  COUNT(de.id) FILTER (WHERE de.is_complete) as completed_days,
  COUNT(de.id) FILTER (WHERE de.daily_score >= 4) as high_score_days,
  
  -- Score statistics
  ROUND(AVG(de.daily_score), 2) as avg_score,
  MAX(de.daily_score) as max_score,
  MIN(de.daily_score) as min_score,
  
  -- Completion rates by target
  ROUND(
    100.0 * COUNT(de.id) FILTER (
      WHERE (SELECT COUNT(*) FROM jsonb_array_elements(de.study_blocks) elem WHERE (elem->>'checked')::boolean) = 4
    ) / NULLIF(COUNT(de.id), 0),
    1
  ) as study_completion_rate,
  
  ROUND(
    100.0 * COUNT(de.id) FILTER (WHERE (de.reading->>'checked')::boolean) / NULLIF(COUNT(de.id), 0),
    1
  ) as reading_completion_rate,
  
  ROUND(
    100.0 * COUNT(de.id) FILTER (
      WHERE (de.pushups->>'set1')::boolean AND (de.pushups->>'set2')::boolean AND (de.pushups->>'set3')::boolean
    ) / NULLIF(COUNT(de.id), 0),
    1
  ) as pushups_completion_rate,
  
  ROUND(
    100.0 * COUNT(de.id) FILTER (WHERE (de.meditation->>'checked')::boolean) / NULLIF(COUNT(de.id), 0),
    1
  ) as meditation_completion_rate,
  
  ROUND(
    100.0 * COUNT(de.id) FILTER (
      WHERE (SELECT COUNT(*) = 8 FROM unnest(de.water_bottles) as bottle WHERE bottle)
    ) / NULLIF(COUNT(de.id), 0),
    1
  ) as water_completion_rate,
  
  -- Date statistics
  MIN(de.entry_date) as first_entry_date,
  MAX(de.entry_date) as last_entry_date,
  
  -- Current streak (calculated via subquery)
  (
    WITH streak_calc AS (
      SELECT 
        entry_date,
        entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS streak_group
      FROM daily_entries
      WHERE user_id = p.id AND daily_score = 5
      ORDER BY entry_date DESC
    )
    SELECT COALESCE(COUNT(*), 0)
    FROM streak_calc
    WHERE streak_group = (SELECT streak_group FROM streak_calc LIMIT 1)
  ) as current_streak,
  
  -- Longest streak
  (
    WITH streak_calc AS (
      SELECT 
        entry_date,
        entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS streak_group
      FROM daily_entries
      WHERE user_id = p.id AND daily_score = 5
    )
    SELECT COALESCE(MAX(streak_length), 0)
    FROM (
      SELECT COUNT(*) as streak_length
      FROM streak_calc
      GROUP BY streak_group
    ) streaks
  ) as longest_streak,
  
  NOW() as last_updated

FROM profiles p
LEFT JOIN daily_entries de ON de.user_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.clerk_user_id, p.email, p.timezone, p.arc_start_date;

-- Create unique index for concurrent refresh
CREATE UNIQUE INDEX idx_user_stats_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_stats_clerk_id ON user_statistics(clerk_user_id);
CREATE INDEX idx_user_stats_streak ON user_statistics(current_streak DESC);

-- Function to refresh statistics
CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to soft delete a profile
CREATE OR REPLACE FUNCTION soft_delete_profile(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET deleted_at = NOW()
  WHERE id = profile_id AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a profile
CREATE OR REPLACE FUNCTION restore_profile(profile_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET deleted_at = NULL
  WHERE id = profile_id AND deleted_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to calculate streak for a user (optimized)
CREATE OR REPLACE FUNCTION calculate_user_streak(p_user_id UUID)
RETURNS TABLE(current_streak INT, longest_streak INT) AS $$
BEGIN
  RETURN QUERY
  WITH streak_calc AS (
    SELECT 
      entry_date,
      entry_date - (ROW_NUMBER() OVER (ORDER BY entry_date))::int AS streak_group
    FROM daily_entries
    WHERE user_id = p_user_id AND daily_score = 5
    ORDER BY entry_date DESC
  ),
  current_streak_calc AS (
    SELECT COALESCE(COUNT(*), 0)::INT as streak
    FROM streak_calc
    WHERE streak_group = (SELECT streak_group FROM streak_calc LIMIT 1)
  ),
  longest_streak_calc AS (
    SELECT COALESCE(MAX(streak_length), 0)::INT as streak
    FROM (
      SELECT COUNT(*)::INT as streak_length
      FROM streak_calc
      GROUP BY streak_group
    ) streaks
  )
  SELECT 
    (SELECT streak FROM current_streak_calc),
    (SELECT streak FROM longest_streak_calc);
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- SCHEDULED MAINTENANCE
-- ============================================================================

-- Function to clean old audit logs (keep last 90 days)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM audit_log
  WHERE created_at < NOW() - INTERVAL '90 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- DATABASE CLEANUP FUNCTIONS (Use with extreme caution!)
-- ============================================================================
-- These functions are for development/testing purposes only.
-- NEVER run these in production without a complete backup!
-- Uncomment only when you need to clear data.
-- ============================================================================

/*
-- ----------------------------------------------------------------------------
-- FUNCTION: Clear all user data (DESTRUCTIVE!)
-- ----------------------------------------------------------------------------
-- This will delete ALL user entries, reviews, and notes but keep profiles
-- USE CASE: Reset all tracking data while keeping user accounts
-- WARNING: This is irreversible! Always backup first!

CREATE OR REPLACE FUNCTION clear_all_user_data()
RETURNS TABLE(
  deleted_entries BIGINT,
  deleted_reviews BIGINT,
  deleted_notes BIGINT,
  deleted_audit_logs BIGINT
) AS $$
DECLARE
  entries_count BIGINT;
  reviews_count BIGINT;
  notes_count BIGINT;
  audit_count BIGINT;
BEGIN
  -- Delete all daily entries
  DELETE FROM daily_entries;
  GET DIAGNOSTICS entries_count = ROW_COUNT;
  
  -- Delete all weekly reviews
  DELETE FROM weekly_reviews;
  GET DIAGNOSTICS reviews_count = ROW_COUNT;
  
  -- Delete all checkpoint notes
  DELETE FROM checkpoint_notes;
  GET DIAGNOSTICS notes_count = ROW_COUNT;
  
  -- Delete all audit logs
  DELETE FROM audit_log;
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  -- Refresh statistics view
  REFRESH MATERIALIZED VIEW user_statistics;
  
  RETURN QUERY SELECT entries_count, reviews_count, notes_count, audit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage:
-- SELECT * FROM clear_all_user_data();

-- ----------------------------------------------------------------------------
-- FUNCTION: Clear specific user's data
-- ----------------------------------------------------------------------------
-- This will delete all data for a specific user but keep their profile
-- USE CASE: Reset a single user's progress

CREATE OR REPLACE FUNCTION clear_user_data(p_user_id UUID)
RETURNS TABLE(
  deleted_entries BIGINT,
  deleted_reviews BIGINT,
  deleted_notes BIGINT,
  deleted_audit_logs BIGINT
) AS $$
DECLARE
  entries_count BIGINT;
  reviews_count BIGINT;
  notes_count BIGINT;
  audit_count BIGINT;
BEGIN
  -- Verify user exists
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'User with ID % does not exist', p_user_id;
  END IF;
  
  -- Delete user's daily entries
  DELETE FROM daily_entries WHERE user_id = p_user_id;
  GET DIAGNOSTICS entries_count = ROW_COUNT;
  
  -- Delete user's weekly reviews
  DELETE FROM weekly_reviews WHERE user_id = p_user_id;
  GET DIAGNOSTICS reviews_count = ROW_COUNT;
  
  -- Delete user's checkpoint notes
  DELETE FROM checkpoint_notes WHERE user_id = p_user_id;
  GET DIAGNOSTICS notes_count = ROW_COUNT;
  
  -- Delete user's audit logs
  DELETE FROM audit_log WHERE user_id = p_user_id;
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  -- Refresh statistics view
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
  
  RETURN QUERY SELECT entries_count, reviews_count, notes_count, audit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage:
-- SELECT * FROM clear_user_data('user-uuid-here');

-- ----------------------------------------------------------------------------
-- FUNCTION: Complete database reset (NUCLEAR OPTION!)
-- ----------------------------------------------------------------------------
-- This will delete EVERYTHING including all users and their profiles
-- USE CASE: Complete fresh start in development
-- WARNING: This destroys ALL data! There is no undo!

CREATE OR REPLACE FUNCTION nuclear_reset_database()
RETURNS TABLE(
  deleted_profiles BIGINT,
  deleted_entries BIGINT,
  deleted_reviews BIGINT,
  deleted_notes BIGINT,
  deleted_audit_logs BIGINT
) AS $$
DECLARE
  profiles_count BIGINT;
  entries_count BIGINT;
  reviews_count BIGINT;
  notes_count BIGINT;
  audit_count BIGINT;
BEGIN
  -- WARNING: This deletes everything!
  RAISE NOTICE 'NUCLEAR RESET: Deleting all data...';
  
  -- Delete in correct order (respecting foreign keys)
  DELETE FROM audit_log;
  GET DIAGNOSTICS audit_count = ROW_COUNT;
  
  DELETE FROM checkpoint_notes;
  GET DIAGNOSTICS notes_count = ROW_COUNT;
  
  DELETE FROM weekly_reviews;
  GET DIAGNOSTICS reviews_count = ROW_COUNT;
  
  DELETE FROM daily_entries;
  GET DIAGNOSTICS entries_count = ROW_COUNT;
  
  DELETE FROM profiles;
  GET DIAGNOSTICS profiles_count = ROW_COUNT;
  
  -- Drop and recreate materialized view
  DROP MATERIALIZED VIEW IF EXISTS user_statistics;
  CREATE MATERIALIZED VIEW user_statistics AS
  SELECT 
    p.id as user_id,
    p.clerk_user_id,
    p.email,
    p.timezone,
    p.arc_start_date,
    0::BIGINT as total_entries,
    0::BIGINT as completed_days,
    0::BIGINT as high_score_days,
    0::NUMERIC as avg_score,
    0::INTEGER as max_score,
    0::INTEGER as min_score,
    0::NUMERIC as study_completion_rate,
    0::NUMERIC as reading_completion_rate,
    0::NUMERIC as pushups_completion_rate,
    0::NUMERIC as meditation_completion_rate,
    0::NUMERIC as water_completion_rate,
    NULL::DATE as first_entry_date,
    NULL::DATE as last_entry_date,
    0::BIGINT as current_streak,
    0::BIGINT as longest_streak,
    NOW() as last_updated
  FROM profiles p
  WHERE p.deleted_at IS NULL;
  
  -- Recreate indexes
  CREATE UNIQUE INDEX idx_user_stats_user_id ON user_statistics(user_id);
  CREATE INDEX idx_user_stats_clerk_id ON user_statistics(clerk_user_id);
  CREATE INDEX idx_user_stats_streak ON user_statistics(current_streak DESC);
  
  RAISE NOTICE 'NUCLEAR RESET: Complete! Deleted % profiles, % entries, % reviews, % notes, % audit logs',
    profiles_count, entries_count, reviews_count, notes_count, audit_count;
  
  RETURN QUERY SELECT profiles_count, entries_count, reviews_count, notes_count, audit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage (BE EXTREMELY CAREFUL!):
-- SELECT * FROM nuclear_reset_database();

-- ----------------------------------------------------------------------------
-- FUNCTION: Clear old data by date range
-- ----------------------------------------------------------------------------
-- This will delete entries older than a specified date
-- USE CASE: Archive or remove old test data

CREATE OR REPLACE FUNCTION clear_data_before_date(cutoff_date DATE)
RETURNS TABLE(
  deleted_entries BIGINT,
  deleted_reviews BIGINT
) AS $$
DECLARE
  entries_count BIGINT;
  reviews_count BIGINT;
BEGIN
  -- Delete old daily entries
  DELETE FROM daily_entries 
  WHERE entry_date < cutoff_date;
  GET DIAGNOSTICS entries_count = ROW_COUNT;
  
  -- Delete old weekly reviews (match by review_date)
  DELETE FROM weekly_reviews 
  WHERE review_date < cutoff_date;
  GET DIAGNOSTICS reviews_count = ROW_COUNT;
  
  -- Clean up related audit logs
  DELETE FROM audit_log 
  WHERE table_name IN ('daily_entries', 'weekly_reviews')
    AND created_at < cutoff_date;
  
  -- Refresh statistics
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
  
  RETURN QUERY SELECT entries_count, reviews_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage:
-- SELECT * FROM clear_data_before_date('2025-01-01');

-- ----------------------------------------------------------------------------
-- FUNCTION: Soft delete all data for a user (GDPR compliance)
-- ----------------------------------------------------------------------------
-- This marks a user as deleted and clears their PII
-- USE CASE: GDPR right to be forgotten

CREATE OR REPLACE FUNCTION gdpr_delete_user(p_clerk_user_id TEXT)
RETURNS TABLE(
  user_id UUID,
  deleted_entries BIGINT,
  deleted_reviews BIGINT,
  deleted_notes BIGINT,
  anonymized BOOLEAN
) AS $$
DECLARE
  v_user_id UUID;
  entries_count BIGINT;
  reviews_count BIGINT;
  notes_count BIGINT;
BEGIN
  -- Get user ID
  SELECT id INTO v_user_id 
  FROM profiles 
  WHERE clerk_user_id = p_clerk_user_id 
    AND deleted_at IS NULL;
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'User % not found or already deleted', p_clerk_user_id;
  END IF;
  
  -- Soft delete all user data
  DELETE FROM daily_entries WHERE user_id = v_user_id;
  GET DIAGNOSTICS entries_count = ROW_COUNT;
  
  DELETE FROM weekly_reviews WHERE user_id = v_user_id;
  GET DIAGNOSTICS reviews_count = ROW_COUNT;
  
  DELETE FROM checkpoint_notes WHERE user_id = v_user_id;
  GET DIAGNOSTICS notes_count = ROW_COUNT;
  
  -- Anonymize profile but keep record for referential integrity
  UPDATE profiles
  SET 
    email = 'deleted_' || id || '@anonymized.local',
    metadata = '{}'::jsonb,
    deleted_at = NOW()
  WHERE id = v_user_id;
  
  -- Keep audit logs but anonymize user reference
  UPDATE audit_log
  SET user_id = NULL
  WHERE user_id = v_user_id;
  
  RETURN QUERY SELECT v_user_id, entries_count, reviews_count, notes_count, true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage:
-- SELECT * FROM gdpr_delete_user('clerk_user_id_here');

-- ----------------------------------------------------------------------------
-- FUNCTION: Create backup snapshot
-- ----------------------------------------------------------------------------
-- Creates backup tables with timestamp suffix
-- USE CASE: Before running destructive operations

CREATE OR REPLACE FUNCTION create_backup_snapshot()
RETURNS TEXT AS $$
DECLARE
  timestamp_suffix TEXT;
  result TEXT;
BEGIN
  timestamp_suffix := to_char(NOW(), 'YYYYMMDD_HH24MISS');
  
  -- Create backup tables
  EXECUTE format('CREATE TABLE profiles_backup_%s AS SELECT * FROM profiles', timestamp_suffix);
  EXECUTE format('CREATE TABLE daily_entries_backup_%s AS SELECT * FROM daily_entries', timestamp_suffix);
  EXECUTE format('CREATE TABLE weekly_reviews_backup_%s AS SELECT * FROM weekly_reviews', timestamp_suffix);
  EXECUTE format('CREATE TABLE checkpoint_notes_backup_%s AS SELECT * FROM checkpoint_notes', timestamp_suffix);
  EXECUTE format('CREATE TABLE audit_log_backup_%s AS SELECT * FROM audit_log', timestamp_suffix);
  
  result := 'Backup created with suffix: ' || timestamp_suffix;
  RAISE NOTICE '%', result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Usage:
-- SELECT create_backup_snapshot();

-- To restore from backup (replace YYYYMMDD_HH24MISS with actual timestamp):
-- BEGIN;
-- TRUNCATE profiles CASCADE;
-- INSERT INTO profiles SELECT * FROM profiles_backup_YYYYMMDD_HH24MISS;
-- TRUNCATE daily_entries CASCADE;
-- INSERT INTO daily_entries SELECT * FROM daily_entries_backup_YYYYMMDD_HH24MISS;
-- -- ... repeat for other tables
-- COMMIT;

-- To list backups:
-- SELECT tablename FROM pg_tables 
-- WHERE schemaname = 'public' 
--   AND tablename LIKE '%_backup_%' 
-- ORDER BY tablename;

-- To drop old backups:
-- DROP TABLE IF EXISTS profiles_backup_YYYYMMDD_HH24MISS;
-- DROP TABLE IF EXISTS daily_entries_backup_YYYYMMDD_HH24MISS;
-- -- etc...

*/

-- ============================================================================
-- GRANTS (Security)
-- ============================================================================

-- Revoke public access
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

-- Grant authenticated user access
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON weekly_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_notes TO authenticated;
GRANT SELECT ON audit_log TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant function execution
GRANT EXECUTE ON FUNCTION get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO authenticated;

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE profiles IS 'User profiles linked to Clerk authentication';
COMMENT ON TABLE daily_entries IS 'Daily habit tracking entries (one per user per day)';
COMMENT ON TABLE weekly_reviews IS 'Weekly reflection and review entries';
COMMENT ON TABLE checkpoint_notes IS 'Notes for weekly checkpoints';
COMMENT ON TABLE audit_log IS 'Audit trail for all data changes';
COMMENT ON MATERIALIZED VIEW user_statistics IS 'Precomputed user statistics for fast dashboard loading';

COMMENT ON FUNCTION get_user_id() IS 'Retrieves user UUID from JWT claim with session caching';
COMMENT ON FUNCTION calculate_user_streak(UUID) IS 'Calculates current and longest streak for a user';
COMMENT ON FUNCTION soft_delete_profile(UUID) IS 'Soft deletes a profile (GDPR compliance)';

-- ============================================================================
-- VALIDATION QUERIES
-- ============================================================================

-- Run these to validate the schema is correct:
/*
-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- Check all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check all RLS policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check constraints
SELECT 
  conname,
  contype,
  conrelid::regclass AS table_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;
*/

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================