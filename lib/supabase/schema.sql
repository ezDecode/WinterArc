-- Winter Arc Tracker Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  timezone TEXT DEFAULT 'Asia/Kolkata',
  arc_start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for faster clerk_user_id lookups
CREATE INDEX idx_profiles_clerk_user_id ON profiles(clerk_user_id);

-- Add index for timezone queries (optimizes daily reset cron job)
CREATE INDEX IF NOT EXISTS idx_profiles_timezone ON profiles(timezone);

-- ============================================
-- DAILY ENTRIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS daily_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  entry_date DATE NOT NULL,
  study_blocks JSONB DEFAULT '[]'::jsonb,
  reading JSONB DEFAULT '{}'::jsonb,
  pushups JSONB DEFAULT '{}'::jsonb,
  meditation JSONB DEFAULT '{}'::jsonb,
  water_bottles BOOLEAN[] DEFAULT ARRAY[false,false,false,false,false,false,false,false],
  notes JSONB DEFAULT '{}'::jsonb,
  daily_score INTEGER DEFAULT 0 CHECK (daily_score >= 0 AND daily_score <= 5),
  is_complete BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add unique constraint to prevent duplicate entries for same user and date
CREATE UNIQUE INDEX idx_daily_entries_user_date ON daily_entries(user_id, entry_date);

-- Add index for date range queries
CREATE INDEX idx_daily_entries_date ON daily_entries(entry_date);

-- ============================================
-- WEEKLY REVIEWS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS weekly_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 13),
  review_date DATE NOT NULL,
  days_hit_all INTEGER DEFAULT 0,
  what_helped TEXT,
  what_blocked TEXT,
  next_week_change TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for user and week lookups
CREATE INDEX idx_weekly_reviews_user_week ON weekly_reviews(user_id, week_number);

-- ============================================
-- CHECKPOINT NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS checkpoint_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  week_number INTEGER NOT NULL CHECK (week_number >= 1 AND week_number <= 13),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index for user and week lookups
CREATE INDEX idx_checkpoint_notes_user_week ON checkpoint_notes(user_id, week_number);

-- ============================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE checkpoint_notes ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES FOR PROFILES
-- ============================================

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (clerk_user_id = current_setting('request.jwt.claim.sub', true));

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (clerk_user_id = current_setting('request.jwt.claim.sub', true));

-- ============================================
-- RLS POLICIES FOR DAILY ENTRIES
-- ============================================

-- Users can view their own daily entries
CREATE POLICY "Users can view own daily entries"
  ON daily_entries FOR SELECT
  USING (user_id = public.uid());

-- Users can insert their own daily entries
CREATE POLICY "Users can insert own daily entries"
  ON daily_entries FOR INSERT
  WITH CHECK (user_id = public.uid());

-- Users can update their own daily entries
CREATE POLICY "Users can update own daily entries"
  ON daily_entries FOR UPDATE
  USING (user_id = public.uid());

-- Users can delete their own daily entries
CREATE POLICY "Users can delete own daily entries"
  ON daily_entries FOR DELETE
  USING (user_id = public.uid());

-- ============================================
-- RLS POLICIES FOR WEEKLY REVIEWS
-- ============================================

-- Users can view their own weekly reviews
CREATE POLICY "Users can view own weekly reviews"
  ON weekly_reviews FOR SELECT
  USING (user_id = public.uid());

-- Users can insert their own weekly reviews
CREATE POLICY "Users can insert own weekly reviews"
  ON weekly_reviews FOR INSERT
  WITH CHECK (user_id = public.uid());

-- Users can update their own weekly reviews
CREATE POLICY "Users can update own weekly reviews"
  ON weekly_reviews FOR UPDATE
  USING (user_id = public.uid());

-- ============================================
-- RLS POLICIES FOR CHECKPOINT NOTES
-- ============================================

-- Users can view their own checkpoint notes
CREATE POLICY "Users can view own checkpoint notes"
  ON checkpoint_notes FOR SELECT
  USING (user_id = public.uid());

-- Users can insert their own checkpoint notes
CREATE POLICY "Users can insert own checkpoint notes"
  ON checkpoint_notes FOR INSERT
  WITH CHECK (user_id = public.uid());

-- Users can update their own checkpoint notes
CREATE POLICY "Users can update own checkpoint notes"
  ON checkpoint_notes FOR UPDATE
  USING (user_id = public.uid());

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to get current user's UUID from profiles table
-- This function is used in RLS policies for better performance
CREATE OR REPLACE FUNCTION public.uid()
RETURNS UUID AS $$
  SELECT id FROM public.profiles 
  WHERE clerk_user_id = current_setting('request.jwt.claim.sub', true)
  LIMIT 1;
$$ LANGUAGE SQL STABLE;

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for auto-updating updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_entries_updated_at
  BEFORE UPDATE ON daily_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_checkpoint_notes_updated_at
  BEFORE UPDATE ON checkpoint_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================

-- Uncomment the following to insert sample data for testing
-- Note: Replace 'clerk_user_id_here' with an actual Clerk user ID

/*
-- Insert a sample profile
INSERT INTO profiles (clerk_user_id, email, timezone, arc_start_date)
VALUES ('clerk_user_id_here', 'test@example.com', 'Asia/Kolkata', CURRENT_DATE);

-- Insert a sample daily entry
INSERT INTO daily_entries (
  user_id, 
  entry_date, 
  study_blocks,
  reading,
  pushups,
  meditation,
  water_bottles,
  notes,
  daily_score,
  is_complete
) VALUES (
  (SELECT id FROM profiles WHERE clerk_user_id = 'clerk_user_id_here'),
  CURRENT_DATE,
  '[
    {"checked": true, "topic": "Mathematics"},
    {"checked": true, "topic": "Physics"},
    {"checked": false, "topic": ""},
    {"checked": false, "topic": ""}
  ]'::jsonb,
  '{"checked": true, "bookName": "Atomic Habits", "pages": 15}'::jsonb,
  '{"set1": true, "set2": true, "set3": false, "extras": 5}'::jsonb,
  '{"checked": true, "method": "Mindfulness", "duration": 15}'::jsonb,
  ARRAY[true,true,true,true,true,false,false,false],
  '{"morning": "Great start to the day!", "evening": "", "general": ""}'::jsonb,
  3,
  false
);
*/

-- ============================================
-- CLEANUP (if needed)
-- ============================================

-- Uncomment to drop all tables (CAUTION: This will delete all data!)
/*
DROP TABLE IF EXISTS checkpoint_notes CASCADE;
DROP TABLE IF EXISTS weekly_reviews CASCADE;
DROP TABLE IF EXISTS daily_entries CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;
*/
