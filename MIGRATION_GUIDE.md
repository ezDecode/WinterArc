# 🔄 Database Migration Guide

**Version**: 1.0 → 2.0  
**Date**: October 8, 2025  
**Estimated Time**: 2-3 hours  
**Risk Level**: MEDIUM (with proper backups: LOW)

---

## 📋 Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [Backup Strategy](#backup-strategy)
3. [Migration Steps](#migration-steps)
4. [Rollback Plan](#rollback-plan)
5. [Post-Migration Verification](#post-migration-verification)
6. [Common Issues & Solutions](#common-issues--solutions)

---

## ✅ Pre-Migration Checklist

### Before You Start

- [ ] **Read this entire document** - Don't skip sections
- [ ] **Notify users** - Schedule maintenance window if in production
- [ ] **Backup database** - Complete backup of all data
- [ ] **Test on staging** - Run migration on test database first
- [ ] **Database access** - Confirm you have admin access to Supabase
- [ ] **Downtime plan** - Decide if you need downtime or can do rolling migration
- [ ] **Rollback ready** - Have rollback SQL ready

### Environment Check

```bash
# Verify environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
echo $CRON_SECRET

# Verify database connection
# (In Supabase SQL Editor)
SELECT version();
SELECT current_database();
```

### Estimated Impact

| Component | Downtime | Risk | Impact |
|-----------|----------|------|--------|
| Database Schema | 0 min | LOW | Additive changes only |
| RLS Policies | 0 min | MEDIUM | Policy changes |
| Indexes | 0 min | LOW | Created concurrently |
| Materialized Views | 0 min | LOW | New feature |
| API Routes | 5-10 min | LOW | Code deployment |

**Total Estimated Downtime**: 5-10 minutes (during code deployment)

---

## 💾 Backup Strategy

### Step 1: Create Full Backup

**In Supabase Dashboard**:
1. Go to **Settings** → **Database**
2. Click **Create backup**
3. Note the backup ID and timestamp

**OR via SQL**:

```sql
-- Export schema
pg_dump --schema-only --no-owner --no-privileges \
  -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  > backup_schema_$(date +%Y%m%d_%H%M%S).sql

-- Export data
pg_dump --data-only --no-owner --no-privileges \
  -h db.xxx.supabase.co \
  -U postgres \
  -d postgres \
  > backup_data_$(date +%Y%m%d_%H%M%S).sql
```

### Step 2: Export Critical Tables

```sql
-- Export to CSV (run in Supabase SQL Editor)
COPY (SELECT * FROM profiles) TO '/tmp/profiles_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM daily_entries) TO '/tmp/daily_entries_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM weekly_reviews) TO '/tmp/weekly_reviews_backup.csv' WITH CSV HEADER;
COPY (SELECT * FROM checkpoint_notes) TO '/tmp/checkpoint_notes_backup.csv' WITH CSV HEADER;
```

### Step 3: Document Current State

```sql
-- Count records
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'daily_entries', COUNT(*) FROM daily_entries
UNION ALL
SELECT 'weekly_reviews', COUNT(*) FROM weekly_reviews
UNION ALL
SELECT 'checkpoint_notes', COUNT(*) FROM checkpoint_notes;

-- Check RLS status
SELECT tablename, rowsecurity FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- List all indexes
SELECT tablename, indexname FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**Save this output** - You'll compare it after migration.

---

## 🚀 Migration Steps

### Phase 1: Database Schema (Additive Changes Only)

**Duration**: 5-10 minutes  
**Risk**: LOW (all changes are additive)

```sql
-- ============================================================================
-- PHASE 1: ADD NEW COLUMNS (Safe - no data loss)
-- ============================================================================

-- Add new columns to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add new columns to daily_entries
ALTER TABLE daily_entries ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
ALTER TABLE daily_entries ADD COLUMN IF NOT EXISTS version INTEGER DEFAULT 1;

-- Verify columns added
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name IN ('profiles', 'daily_entries')
ORDER BY table_name, ordinal_position;
```

**✅ Checkpoint**: Verify all columns added successfully.

### Phase 2: Add Constraints

**Duration**: 2-3 minutes  
**Risk**: MEDIUM (may fail if existing data violates constraints)

```sql
-- ============================================================================
-- PHASE 2: ADD CONSTRAINTS (Check existing data first)
-- ============================================================================

-- First, check if any data will violate new constraints
-- Run these validation queries:

-- Check timezone format
SELECT clerk_user_id, timezone 
FROM profiles 
WHERE timezone !~ '^[A-Za-z]+/[A-Za-z_]+$';
-- Should return 0 rows

-- Check study_blocks structure
SELECT id, entry_date 
FROM daily_entries 
WHERE jsonb_typeof(study_blocks) != 'array' 
   OR jsonb_array_length(study_blocks) != 4;
-- Should return 0 rows

-- Check water_bottles length
SELECT id, entry_date 
FROM daily_entries 
WHERE array_length(water_bottles, 1) != 8;
-- Should return 0 rows

-- Check reading pages range
SELECT id, entry_date 
FROM daily_entries 
WHERE (reading->>'pages')::int < 0 
   OR (reading->>'pages')::int > 1000;
-- Should return 0 rows

-- If all checks pass, add constraints:
ALTER TABLE profiles 
  ADD CONSTRAINT check_timezone_valid 
  CHECK (timezone ~ '^[A-Za-z]+/[A-Za-z_]+$');

ALTER TABLE daily_entries 
  ADD CONSTRAINT check_study_blocks_structure
  CHECK (
    jsonb_typeof(study_blocks) = 'array' AND
    jsonb_array_length(study_blocks) = 4
  );

ALTER TABLE daily_entries 
  ADD CONSTRAINT check_water_bottles_structure
  CHECK (array_length(water_bottles, 1) = 8);

ALTER TABLE daily_entries 
  ADD CONSTRAINT check_reading_valid
  CHECK (
    reading ? 'checked' AND
    reading ? 'bookName' AND
    reading ? 'pages' AND
    (reading->>'pages')::int >= 0 AND
    (reading->>'pages')::int <= 1000
  );

ALTER TABLE daily_entries 
  ADD CONSTRAINT check_pushups_valid
  CHECK (
    pushups ? 'set1' AND
    pushups ? 'set2' AND
    pushups ? 'set3' AND
    pushups ? 'extras' AND
    (pushups->>'extras')::int >= 0 AND
    (pushups->>'extras')::int <= 500
  );

ALTER TABLE daily_entries 
  ADD CONSTRAINT check_meditation_valid
  CHECK (
    meditation ? 'checked' AND
    meditation ? 'method' AND
    meditation ? 'duration' AND
    (meditation->>'duration')::int >= 0 AND
    (meditation->>'duration')::int <= 240
  );

-- Verify constraints added
SELECT conname, contype, conrelid::regclass 
FROM pg_constraint 
WHERE connamespace = 'public'::regnamespace
ORDER BY conrelid::regclass::text, conname;
```

**✅ Checkpoint**: All constraints added without errors.

### Phase 3: Add Indexes

**Duration**: 5-10 minutes  
**Risk**: LOW (indexes created concurrently, no locks)

```sql
-- ============================================================================
-- PHASE 3: ADD PERFORMANCE INDEXES
-- ============================================================================

-- Create indexes concurrently (no table locks)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_deleted 
  ON profiles(deleted_at) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_login 
  ON profiles(last_login_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_clerk_id_active 
  ON profiles(clerk_user_id, id) WHERE deleted_at IS NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_entries_dashboard 
  ON daily_entries(user_id, entry_date DESC, daily_score, is_complete);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_entries_completed 
  ON daily_entries(user_id, entry_date) WHERE is_complete = true;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_entries_score_filter 
  ON daily_entries(user_id, daily_score) WHERE daily_score = 5;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_daily_entries_date_brin 
  ON daily_entries USING BRIN(entry_date);

-- Make unique indexes for weekly reviews and checkpoint notes
DROP INDEX IF EXISTS idx_weekly_reviews_user_week;
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reviews_user_week_unique 
  ON weekly_reviews(user_id, week_number);

DROP INDEX IF EXISTS idx_checkpoint_notes_user_week;
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkpoint_notes_user_week_unique 
  ON checkpoint_notes(user_id, week_number);

-- Verify indexes created
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

**✅ Checkpoint**: All indexes created. Check for duplicates in weekly_reviews/checkpoint_notes.

**⚠️ IMPORTANT**: If unique index creation fails due to duplicates:

```sql
-- Find duplicates in weekly_reviews
SELECT user_id, week_number, COUNT(*) 
FROM weekly_reviews 
GROUP BY user_id, week_number 
HAVING COUNT(*) > 1;

-- Delete duplicates (keep most recent)
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, week_number 
    ORDER BY created_at DESC
  ) as rn
  FROM weekly_reviews
)
DELETE FROM weekly_reviews 
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- Repeat for checkpoint_notes
```

### Phase 4: Create Audit Log Table

**Duration**: 2 minutes  
**Risk**: LOW (new table)

```sql
-- ============================================================================
-- PHASE 4: CREATE AUDIT LOG
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

CREATE INDEX IF NOT EXISTS idx_audit_log_table_record 
  ON audit_log(table_name, record_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user 
  ON audit_log(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_created 
  ON audit_log(created_at DESC);

-- Enable RLS
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own audit logs"
  ON audit_log FOR SELECT
  USING (user_id = public.get_user_id());

CREATE POLICY "System can insert audit logs"
  ON audit_log FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Audit logs are immutable"
  ON audit_log FOR UPDATE
  USING (false);

CREATE POLICY "Audit logs cannot be deleted"
  ON audit_log FOR DELETE
  USING (false);

-- Verify table created
\d audit_log
```

**✅ Checkpoint**: Audit log table created with RLS enabled.

### Phase 5: Update RLS Functions

**Duration**: 2 minutes  
**Risk**: MEDIUM (affects all queries)

```sql
-- ============================================================================
-- PHASE 5: UPDATE RLS FUNCTIONS
-- ============================================================================

-- Drop old function
DROP FUNCTION IF EXISTS public.uid();

-- Create optimized function with caching
CREATE OR REPLACE FUNCTION public.get_user_id()
RETURNS UUID AS $$
DECLARE
  user_id UUID;
  clerk_id TEXT;
BEGIN
  clerk_id := current_setting('request.jwt.claim.sub', true);
  
  IF clerk_id IS NULL OR clerk_id = '' THEN
    RETURN NULL;
  END IF;
  
  BEGIN
    user_id := current_setting('app.user_id', true)::UUID;
    IF user_id IS NOT NULL THEN
      RETURN user_id;
    END IF;
  EXCEPTION 
    WHEN OTHERS THEN
      NULL;
  END;
  
  SELECT id INTO user_id 
  FROM profiles 
  WHERE clerk_user_id = clerk_id 
    AND deleted_at IS NULL
  LIMIT 1;
  
  IF user_id IS NOT NULL THEN
    PERFORM set_config('app.user_id', user_id::TEXT, true);
  END IF;
  
  RETURN user_id;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Test function
SELECT public.get_user_id();
```

**✅ Checkpoint**: Function created. Test with actual JWT token.

### Phase 6: Update RLS Policies

**Duration**: 5 minutes  
**Risk**: HIGH (changes auth logic)

```sql
-- ============================================================================
-- PHASE 6: UPDATE RLS POLICIES
-- ============================================================================

-- Backup: List all current policies before changes
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Drop old policies
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

-- Create new policies (from schema-improved.sql)
-- [Paste all RLS policies from schema-improved.sql here]

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

-- [Add remaining policies for weekly_reviews and checkpoint_notes]

-- Verify policies
SELECT tablename, policyname, permissive, roles, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**✅ Checkpoint**: All policies recreated. Count should match expected number.

### Phase 7: Create Materialized View

**Duration**: 3-5 minutes  
**Risk**: LOW (new feature)

```sql
-- ============================================================================
-- PHASE 7: CREATE MATERIALIZED VIEW
-- ============================================================================

-- [Paste materialized view creation from schema-improved.sql]

CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  p.id as user_id,
  p.clerk_user_id,
  p.email,
  p.timezone,
  p.arc_start_date,
  COUNT(de.id) as total_entries,
  COUNT(de.id) FILTER (WHERE de.is_complete) as completed_days,
  ROUND(AVG(de.daily_score), 2) as avg_score,
  -- [Add full query from schema-improved.sql]
  NOW() as last_updated
FROM profiles p
LEFT JOIN daily_entries de ON de.user_id = p.id
WHERE p.deleted_at IS NULL
GROUP BY p.id, p.clerk_user_id, p.email, p.timezone, p.arc_start_date;

CREATE UNIQUE INDEX idx_user_stats_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_stats_clerk_id ON user_statistics(clerk_user_id);

-- Initial refresh
REFRESH MATERIALIZED VIEW user_statistics;

-- Verify view
SELECT COUNT(*) FROM user_statistics;
```

**✅ Checkpoint**: Materialized view created and populated.

### Phase 8: Add Audit Triggers

**Duration**: 2 minutes  
**Risk**: MEDIUM (triggers run on all operations)

```sql
-- ============================================================================
-- PHASE 8: ADD AUDIT TRIGGERS
-- ============================================================================

-- Create trigger function
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
DECLARE
  old_data JSONB;
  new_data JSONB;
  changed_fields TEXT[];
BEGIN
  IF (TG_OP = 'DELETE') THEN
    old_data := row_to_json(OLD)::JSONB;
    new_data := NULL;
  ELSIF (TG_OP = 'UPDATE') THEN
    old_data := row_to_json(OLD)::JSONB;
    new_data := row_to_json(NEW)::JSONB;
    
    SELECT array_agg(key)
    INTO changed_fields
    FROM jsonb_each(old_data)
    WHERE old_data->key IS DISTINCT FROM new_data->key;
  ELSIF (TG_OP = 'INSERT') THEN
    old_data := NULL;
    new_data := row_to_json(NEW)::JSONB;
  END IF;

  INSERT INTO audit_log (
    table_name, record_id, user_id, action, old_data, new_data, changed_fields
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

-- Add triggers to tables
CREATE TRIGGER audit_daily_entries
  AFTER INSERT OR UPDATE OR DELETE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_weekly_reviews
  AFTER INSERT OR UPDATE OR DELETE ON weekly_reviews
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_profiles
  AFTER INSERT OR UPDATE OR DELETE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION audit_trigger_func();

-- Test trigger
UPDATE profiles SET last_login_at = NOW() WHERE id = (SELECT id FROM profiles LIMIT 1);
SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 1;
```

**✅ Checkpoint**: Triggers working. Verify audit_log has entries.

---

## 🔙 Rollback Plan

If anything goes wrong:

### Quick Rollback (Policies Only)

```sql
-- Restore old RLS function
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID AS $$
  SELECT id FROM public.profiles 
  WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true)
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Restore old policies
-- [Re-run policies from original schema.sql]
```

### Full Rollback (Nuclear Option)

```sql
-- Drop new tables
DROP MATERIALIZED VIEW IF EXISTS user_statistics;
DROP TABLE IF EXISTS audit_log CASCADE;

-- Remove new columns
ALTER TABLE profiles DROP COLUMN IF EXISTS deleted_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS last_login_at;
ALTER TABLE profiles DROP COLUMN IF EXISTS metadata;
ALTER TABLE daily_entries DROP COLUMN IF EXISTS completed_at;
ALTER TABLE daily_entries DROP COLUMN IF EXISTS version;

-- Remove constraints
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS check_timezone_valid;
ALTER TABLE daily_entries DROP CONSTRAINT IF EXISTS check_study_blocks_structure;
-- [Drop all other constraints]

-- Restore from backup
-- psql -h db.xxx.supabase.co -U postgres -d postgres < backup_schema_YYYYMMDD.sql
```

---

## ✅ Post-Migration Verification

### Data Integrity Check

```sql
-- Verify record counts match
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'daily_entries', COUNT(*) FROM daily_entries
UNION ALL
SELECT 'weekly_reviews', COUNT(*) FROM weekly_reviews
UNION ALL
SELECT 'checkpoint_notes', COUNT(*) FROM checkpoint_notes;

-- Compare with pre-migration counts

-- Check for NULL values in critical fields
SELECT COUNT(*) FROM profiles WHERE clerk_user_id IS NULL;
SELECT COUNT(*) FROM daily_entries WHERE user_id IS NULL OR entry_date IS NULL;

-- Should all be 0
```

### Performance Check

```sql
-- Test query performance with new indexes
EXPLAIN ANALYZE
SELECT * FROM daily_entries 
WHERE user_id = 'some-uuid' 
ORDER BY entry_date DESC 
LIMIT 10;

-- Should use idx_daily_entries_dashboard index
```

### RLS Check

```sql
-- Test RLS is working
SET request.jwt.claim.sub = 'test_clerk_id';
SELECT * FROM profiles; -- Should only return that user's profile
SELECT * FROM daily_entries; -- Should only return that user's entries
RESET request.jwt.claim.sub;
```

### Application Testing

1. **Sign in** - Verify authentication works
2. **View dashboard** - Check stats load correctly
3. **Update entry** - Verify auto-save works
4. **Check audit log** - Verify changes are logged
5. **Test all pages** - Ensure no errors in console

---

## 🔧 Common Issues & Solutions

### Issue 1: Constraint Violations

**Error**: `constraint "check_study_blocks_structure" violated`

**Solution**:
```sql
-- Find violating rows
SELECT id, entry_date, study_blocks 
FROM daily_entries 
WHERE jsonb_array_length(study_blocks) != 4;

-- Fix data
UPDATE daily_entries 
SET study_blocks = '[
  {"checked":false,"topic":""},
  {"checked":false,"topic":""},
  {"checked":false,"topic":""},
  {"checked":false,"topic":""}
]'::jsonb
WHERE jsonb_array_length(study_blocks) != 4;

-- Retry constraint
ALTER TABLE daily_entries 
  ADD CONSTRAINT check_study_blocks_structure
  CHECK (jsonb_array_length(study_blocks) = 4);
```

### Issue 2: Duplicate Records

**Error**: `unique constraint "idx_weekly_reviews_user_week_unique" violated`

**Solution**:
```sql
-- Find duplicates
SELECT user_id, week_number, COUNT(*) 
FROM weekly_reviews 
GROUP BY user_id, week_number 
HAVING COUNT(*) > 1;

-- Keep most recent, delete others
WITH duplicates AS (
  SELECT id, ROW_NUMBER() OVER (
    PARTITION BY user_id, week_number 
    ORDER BY created_at DESC
  ) as rn
  FROM weekly_reviews
)
DELETE FROM weekly_reviews 
WHERE id IN (SELECT id FROM duplicates WHERE rn > 1);
```

### Issue 3: RLS Not Working

**Error**: Users can't access their data

**Solution**:
```sql
-- Verify JWT claim is being set
SHOW request.jwt.claim.sub;

-- Check if get_user_id() returns correct UUID
SELECT public.get_user_id();

-- Verify profile exists
SELECT * FROM profiles WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true);

-- If function returns NULL, check Clerk integration
```

### Issue 4: Performance Degradation

**Solution**:
```sql
-- Analyze tables after migration
ANALYZE profiles;
ANALYZE daily_entries;
ANALYZE weekly_reviews;
ANALYZE checkpoint_notes;

-- Reindex if needed
REINDEX TABLE daily_entries;

-- Check for bloat
SELECT schemaname, tablename, 
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 📊 Migration Success Criteria

- [x] All tables exist
- [x] All columns added
- [x] All constraints active
- [x] All indexes created
- [x] Audit log working
- [x] Materialized view populated
- [x] RLS policies updated
- [x] Record counts match
- [x] Application working
- [x] Performance acceptable
- [x] No error logs

---

## 📞 Support & Escalation

If you encounter critical issues:

1. **Stop the migration** - Don't proceed if errors occur
2. **Check logs** - Review Supabase logs for details
3. **Run verification queries** - Check data integrity
4. **Consider rollback** - If data is corrupted
5. **Contact support** - If you need help

**Emergency Rollback**: Use backup from Step 1 of this guide.

---

**Migration Complete!** 🎉

After successful migration:
1. Monitor application for 24-48 hours
2. Check error logs daily
3. Verify cron jobs run successfully
4. Test all user workflows
5. Document any issues encountered

**End of Migration Guide**
