-- ============================================================================
-- EMAIL REMINDER SYSTEM - DATABASE MIGRATION
-- ============================================================================
-- Adds email notification functionality to existing Winter Arc database
-- Safe migration using IF NOT EXISTS to prevent conflicts
-- ============================================================================

-- ============================================================================
-- EXTEND PROFILES TABLE WITH EMAIL NOTIFICATION PREFERENCES
-- ============================================================================

-- Add email notification columns to profiles table
DO $$
BEGIN
    -- Add email notification enabled flag
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'email_notifications_enabled'
    ) THEN
        ALTER TABLE profiles ADD COLUMN email_notifications_enabled BOOLEAN DEFAULT true;
    END IF;
    
    -- Add last email sent timestamp
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'last_email_sent_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN last_email_sent_at TIMESTAMPTZ DEFAULT NULL;
    END IF;
    
    -- Add email notification window start time (local time, e.g., '08:00')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'notification_window_start'
    ) THEN
        ALTER TABLE profiles ADD COLUMN notification_window_start TIME DEFAULT '08:00';
    END IF;
    
    -- Add email notification window end time (local time, e.g., '20:00')
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'notification_window_end'
    ) THEN
        ALTER TABLE profiles ADD COLUMN notification_window_end TIME DEFAULT '20:00';
    END IF;
    
    -- Add minimum hours between reminder emails
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'reminder_cooldown_hours'
    ) THEN
        ALTER TABLE profiles ADD COLUMN reminder_cooldown_hours INTEGER DEFAULT 6;
    END IF;
END
$$;

-- Create indexes for email-related columns
CREATE INDEX IF NOT EXISTS idx_profiles_email_notifications 
ON profiles(email_notifications_enabled, last_email_sent_at) 
WHERE email_notifications_enabled = true;

CREATE INDEX IF NOT EXISTS idx_profiles_last_login_email 
ON profiles(last_login_at, email_notifications_enabled) 
WHERE email_notifications_enabled = true;

-- ============================================================================
-- EMAIL REMINDERS AUDIT TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS email_reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    email_address TEXT NOT NULL,
    trigger_type TEXT NOT NULL CHECK (trigger_type IN ('on_demand', 'inactivity')),
    reminder_reason TEXT NOT NULL,
    incomplete_tasks JSONB DEFAULT '{}'::jsonb,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    email_status TEXT DEFAULT 'sent' CHECK (email_status IN ('sent', 'failed', 'bounced')),
    resend_message_id TEXT,
    user_timezone TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for email reminders table
CREATE INDEX IF NOT EXISTS idx_email_reminders_user_id 
ON email_reminders(user_id);

CREATE INDEX IF NOT EXISTS idx_email_reminders_sent_at 
ON email_reminders(sent_at DESC);

CREATE INDEX IF NOT EXISTS idx_email_reminders_trigger_type 
ON email_reminders(trigger_type, sent_at);

CREATE INDEX IF NOT EXISTS idx_email_reminders_status 
ON email_reminders(email_status, sent_at);

CREATE INDEX IF NOT EXISTS idx_email_reminders_user_recent 
ON email_reminders(user_id, sent_at DESC);

-- ============================================================================
-- EMAIL REMINDERS RLS POLICIES
-- ============================================================================

ALTER TABLE email_reminders ENABLE ROW LEVEL SECURITY;

-- Users can view their own email reminders
DROP POLICY IF EXISTS "Users can view own email reminders" ON email_reminders;
CREATE POLICY "Users can view own email reminders"
  ON email_reminders FOR SELECT
  USING (user_id = public.get_user_id());

-- Only the system can insert email reminders (via service key)
DROP POLICY IF EXISTS "System can insert email reminders" ON email_reminders;
CREATE POLICY "System can insert email reminders"
  ON email_reminders FOR INSERT
  WITH CHECK (true); -- This will be restricted to service key usage

-- Users cannot update or delete email reminders
DROP POLICY IF EXISTS "Users cannot modify email reminders" ON email_reminders;
CREATE POLICY "Users cannot modify email reminders"
  ON email_reminders FOR UPDATE
  USING (false);

CREATE POLICY "Users cannot delete email reminders"
  ON email_reminders FOR DELETE
  USING (false);

-- ============================================================================
-- HELPER FUNCTIONS FOR EMAIL REMINDERS
-- ============================================================================

-- Function to check if user is eligible for email reminder
CREATE OR REPLACE FUNCTION is_user_eligible_for_email(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_profile RECORD;
    last_email_time TIMESTAMPTZ;
    cooldown_period INTERVAL;
    current_time TIMESTAMPTZ;
    user_local_time TIME;
BEGIN
    -- Get user profile data
    SELECT 
        email_notifications_enabled,
        last_email_sent_at,
        timezone,
        notification_window_start,
        notification_window_end,
        reminder_cooldown_hours
    INTO user_profile
    FROM profiles 
    WHERE id = p_user_id AND deleted_at IS NULL;
    
    -- Check if user exists and has notifications enabled
    IF NOT FOUND OR NOT user_profile.email_notifications_enabled THEN
        RETURN FALSE;
    END IF;
    
    -- Check cooldown period
    IF user_profile.last_email_sent_at IS NOT NULL THEN
        cooldown_period := make_interval(hours => user_profile.reminder_cooldown_hours);
        IF (NOW() - user_profile.last_email_sent_at) < cooldown_period THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    -- Check if current time is within notification window (user's local time)
    current_time := NOW() AT TIME ZONE user_profile.timezone;
    user_local_time := current_time::TIME;
    
    -- Handle window that crosses midnight
    IF user_profile.notification_window_start <= user_profile.notification_window_end THEN
        -- Normal window (e.g., 08:00 to 20:00)
        IF user_local_time < user_profile.notification_window_start OR 
           user_local_time > user_profile.notification_window_end THEN
            RETURN FALSE;
        END IF;
    ELSE
        -- Window crosses midnight (e.g., 22:00 to 06:00)
        IF user_local_time > user_profile.notification_window_end AND 
           user_local_time < user_profile.notification_window_start THEN
            RETURN FALSE;
        END IF;
    END IF;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to get users eligible for inactivity reminders
CREATE OR REPLACE FUNCTION get_users_for_inactivity_reminders()
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    timezone TEXT,
    last_login_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id as user_id,
        p.email,
        p.timezone,
        p.last_login_at
    FROM profiles p
    WHERE 
        p.deleted_at IS NULL
        AND p.email_notifications_enabled = true
        AND p.last_login_at < NOW() - INTERVAL '24 hours'
        AND is_user_eligible_for_email(p.id) = true
    ORDER BY p.last_login_at ASC;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Function to update last email sent timestamp
CREATE OR REPLACE FUNCTION update_user_last_email_sent(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles 
    SET 
        last_email_sent_at = NOW(),
        updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS FOR EMAIL REMINDER FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION is_user_eligible_for_email(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_users_for_inactivity_reminders() TO authenticated;
GRANT EXECUTE ON FUNCTION update_user_last_email_sent(UUID) TO authenticated;

-- Grant permissions on email_reminders table
GRANT SELECT ON email_reminders TO authenticated;
GRANT INSERT ON email_reminders TO authenticated;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Log migration completion
DO $$
BEGIN
    RAISE NOTICE 'Email reminders migration completed successfully at %', NOW();
END
$$;