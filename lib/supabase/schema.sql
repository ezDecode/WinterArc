-- ============================================================================
-- WINTER ARC TRACKER - PRODUCTION DATABASE SCHEMA
-- ============================================================================
-- Clean, production-ready schema with only essential features
-- No audit logging, no cleanup functions, no development features
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- PROFILES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  timezone TEXT DEFAULT 'America/New_York',
  arc_start_date DATE DEFAULT CURRENT_DATE,
  deleted_at TIMESTAMPTZ DEFAULT NULL,
  last_login_at TIMESTAMPTZ DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_clerk_user_id ON profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_deleted ON profiles(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_last_login ON profiles(last_login_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_clerk_id_active ON profiles(clerk_user_id, id) WHERE deleted_at IS NULL;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DAILY ENTRIES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  entry_date DATE NOT NULL,
  study_blocks JSONB DEFAULT '[
    {"checked": false, "topic": ""},
    {"checked": false, "topic": ""},
    {"checked": false, "topic": ""},
    {"checked": false, "topic": ""}
  ]'::jsonb,
  reading JSONB DEFAULT '{"checked": false, "bookName": "", "pages": 0}'::jsonb,
  pushups JSONB DEFAULT '{"set1": false, "set2": false, "set3": false, "extras": 0}'::jsonb,
  meditation JSONB DEFAULT '{"checked": false, "method": "", "duration": 0}'::jsonb,
  water_bottles BOOLEAN[] DEFAULT ARRAY[false, false, false, false, false, false, false, false],
  notes JSONB DEFAULT '{"morning": null, "evening": null, "general": null}'::jsonb,
  daily_score INTEGER DEFAULT 0,
  is_complete BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, entry_date)
);

CREATE INDEX IF NOT EXISTS idx_daily_entries_user_id ON daily_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_entries_entry_date ON daily_entries(entry_date);
CREATE UNIQUE INDEX IF NOT EXISTS idx_daily_entries_user_date ON daily_entries(user_id, entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_dashboard ON daily_entries(user_id, entry_date DESC, daily_score, is_complete);
CREATE INDEX IF NOT EXISTS idx_daily_entries_completed ON daily_entries(user_id, entry_date) WHERE is_complete = true;
CREATE INDEX IF NOT EXISTS idx_daily_entries_score_filter ON daily_entries(user_id, daily_score) WHERE daily_score = 5;
CREATE INDEX IF NOT EXISTS idx_daily_entries_date_range ON daily_entries(user_id, entry_date, daily_score, is_complete);
CREATE INDEX IF NOT EXISTS idx_daily_entries_date_brin ON daily_entries USING BRIN(entry_date);
CREATE INDEX IF NOT EXISTS idx_daily_entries_study_blocks_gin ON daily_entries USING GIN(study_blocks);
CREATE INDEX IF NOT EXISTS idx_daily_entries_notes_gin ON daily_entries USING GIN(notes);

ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- WEEKLY REVIEWS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  review_date DATE NOT NULL,
  days_hit_all INTEGER DEFAULT 0,
  what_helped TEXT,
  what_blocked TEXT,
  next_week_change TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_weekly_reviews_user_id ON weekly_reviews(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_weekly_reviews_user_week_unique ON weekly_reviews(user_id, week_number);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_date ON weekly_reviews(user_id, review_date DESC);
CREATE INDEX IF NOT EXISTS idx_weekly_reviews_completed ON weekly_reviews(user_id, days_hit_all) WHERE days_hit_all > 0;

ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- CHECKPOINT NOTES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS checkpoint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_checkpoint_notes_user_id ON checkpoint_notes(user_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_checkpoint_notes_user_week_unique ON checkpoint_notes(user_id, week_number);

ALTER TABLE checkpoint_notes ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS HELPER FUNCTION
-- ============================================================================

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

-- ============================================================================
-- PROFILES RLS POLICIES
-- ============================================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users cannot delete profiles" ON profiles;

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

DROP POLICY IF EXISTS "Users can view own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can insert own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can update own daily entries" ON daily_entries;
DROP POLICY IF EXISTS "Users can delete own daily entries" ON daily_entries;

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

DROP POLICY IF EXISTS "Users can view own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can insert own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can update own weekly reviews" ON weekly_reviews;
DROP POLICY IF EXISTS "Users can delete own weekly reviews" ON weekly_reviews;

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

DROP POLICY IF EXISTS "Users can view own checkpoint notes" ON checkpoint_notes;
DROP POLICY IF EXISTS "Users can insert own checkpoint notes" ON checkpoint_notes;
DROP POLICY IF EXISTS "Users can update own checkpoint notes" ON checkpoint_notes;
DROP POLICY IF EXISTS "Users can delete own checkpoint notes" ON checkpoint_notes;

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
-- MATERIALIZED VIEW FOR STATISTICS
-- ============================================================================

DROP MATERIALIZED VIEW IF EXISTS user_statistics CASCADE;

CREATE MATERIALIZED VIEW user_statistics AS
SELECT 
  p.id as user_id,
  p.clerk_user_id,
  p.email,
  p.timezone,
  p.arc_start_date,
  COUNT(de.id) as total_entries,
  COUNT(de.id) FILTER (WHERE de.is_complete) as completed_days,
  COUNT(de.id) FILTER (WHERE de.daily_score >= 4) as high_score_days,
  ROUND(AVG(de.daily_score), 2) as avg_score,
  MAX(de.daily_score) as max_score,
  MIN(de.daily_score) as min_score,
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
  MIN(de.entry_date) as first_entry_date,
  MAX(de.entry_date) as last_entry_date,
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

CREATE UNIQUE INDEX idx_user_stats_user_id ON user_statistics(user_id);
CREATE INDEX idx_user_stats_clerk_id ON user_statistics(clerk_user_id);
CREATE INDEX idx_user_stats_streak ON user_statistics(current_streak DESC);

CREATE OR REPLACE FUNCTION refresh_user_statistics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW CONCURRENTLY user_statistics;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

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
-- GRANTS
-- ============================================================================

REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON daily_entries TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON weekly_reviews TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON checkpoint_notes TO authenticated;
GRANT SELECT ON user_statistics TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_id() TO authenticated;
GRANT EXECUTE ON FUNCTION calculate_user_streak(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION refresh_user_statistics() TO authenticated;
