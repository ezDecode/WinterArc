# Email Reminder System Setup Guide

This guide covers the setup and configuration of the email reminder system for Winter Arc.

## 🚀 Quick Setup

### 1. Environment Variables

Add these environment variables to your `.env.local` file:

```env
# Resend API Configuration
RESEND_API_KEY=re_xxxxxxxxxxxx

# Email Settings
FROM_EMAIL=noreply@yourdomain.com
NEXT_PUBLIC_APP_URL=https://yourapp.com

# Supabase (already configured)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_service_key

# Cron Job Security (already configured)
CRON_SECRET=your_cron_secret
```

### 2. Database Migration

Run the database migration to add email functionality:

```sql
-- Execute the contents of: lib/supabase/email-reminders-migration.sql
-- This adds email preferences to profiles table and creates email_reminders audit table
```

### 3. Resend Setup

1. Sign up for [Resend](https://resend.com)
2. Create an API key
3. Verify your domain (or use resend's test domain for development)
4. Add the API key to your environment variables

## 📧 How It Works

### Dual-Trigger System

1. **On-Demand Trigger**: When users visit `/today` page
   - Middleware intercepts the request
   - Checks if user has incomplete tasks
   - Sends reminder if eligible (respects rate limits and preferences)

2. **Inactivity Trigger**: Daily cron job for inactive users
   - Runs as part of existing daily-reset cron job
   - Finds users who haven't logged in for 24+ hours
   - Sends reminders for incomplete tasks

### Smart Rate Limiting

- **6-hour cooldown** between emails per user
- **Timezone-aware** sending windows (8 AM - 8 PM local time)
- **User preferences** respected (can disable notifications)
- **Completion threshold** - skips reminders if 80%+ tasks complete

## 🛠 Configuration Options

### Email Preferences (Per User)

- `email_notifications_enabled`: Enable/disable all reminders
- `notification_window_start`: Start time for email sending (e.g., '08:00')
- `notification_window_end`: End time for email sending (e.g., '20:00')
- `reminder_cooldown_hours`: Minimum hours between emails (default: 6)

### Global Limits

- Maximum 100 emails per day (stays under Resend's 3,000/month limit)
- Rate limiting per user prevents spam
- Graceful error handling prevents system disruption

## 🧪 Testing

### Test Email Endpoint

```bash
# Test the email system (development only)
curl -X POST http://localhost:3000/api/test-email \
  -H "Authorization: Bearer your_clerk_session_token" \
  -H "Content-Type: application/json" \
  -d '{"force": true}'
```

### Manual Testing Steps

1. **Setup Test User**:
   - Create account and complete onboarding
   - Enable email notifications in profile

2. **Test On-Demand Trigger**:
   - Create incomplete daily entry
   - Visit `/today` page
   - Check for email delivery

3. **Test Inactivity Trigger**:
   - Manually run cron job: `POST /api/cron/daily-reset`
   - Check logs for email processing

4. **Test Rate Limiting**:
   - Trigger multiple emails quickly
   - Verify only one sends within cooldown period

## 📊 Monitoring

### Email Audit Logs

All email activity is logged in the `email_reminders` table:

```sql
SELECT 
  email_address,
  trigger_type,
  sent_at,
  email_status,
  incomplete_tasks
FROM email_reminders 
ORDER BY sent_at DESC;
```

### Useful Queries

```sql
-- Check email eligibility for a user
SELECT is_user_eligible_for_email('user_uuid_here');

-- Get users eligible for inactivity reminders
SELECT * FROM get_users_for_inactivity_reminders();

-- Email stats by day
SELECT 
  DATE(sent_at) as date,
  COUNT(*) as emails_sent,
  COUNT(*) FILTER (WHERE email_status = 'sent') as successful,
  COUNT(*) FILTER (WHERE email_status = 'failed') as failed
FROM email_reminders 
GROUP BY DATE(sent_at)
ORDER BY date DESC;
```

## 🔧 Troubleshooting

### Common Issues

1. **Emails Not Sending**
   - Check RESEND_API_KEY is correct
   - Verify FROM_EMAIL domain is verified in Resend
   - Check user is within notification window
   - Ensure cooldown period has passed

2. **Rate Limit Exceeded**
   - Check daily email count
   - Verify per-user cooldown logic
   - Monitor Resend dashboard for API limits

3. **Database Errors**
   - Ensure migration was run successfully
   - Check Supabase service key permissions
   - Verify RLS policies are correct

### Debug Mode

Add to `.env.local` for verbose logging:

```env
DEBUG=winter-arc:email
```

## 🚦 Production Checklist

- [ ] Resend API key configured
- [ ] Domain verified in Resend
- [ ] Database migration applied
- [ ] Test emails working
- [ ] Rate limiting tested
- [ ] Cron job scheduled in Vercel
- [ ] Error monitoring setup
- [ ] Email preferences UI integrated

## 📝 API Reference

### Email Service Functions

```typescript
// Send task reminder email
await sendTaskReminderEmail({
  userId: 'uuid',
  email: 'user@example.com',
  userName: 'John',
  incompleteTasks: [{ name: 'Study Blocks', details: '2 of 4 remaining' }],
  triggerType: 'on_demand',
  timezone: 'America/New_York'
})

// Get users for inactivity reminders
const users = await getUsersForInactivityReminders()

// Check user eligibility
const eligible = await isUserEligibleForEmail(userId)
```

### Database Functions

```sql
-- Check eligibility
SELECT is_user_eligible_for_email(user_uuid);

-- Update last email sent
SELECT update_user_last_email_sent(user_uuid);

-- Get inactive users
SELECT * FROM get_users_for_inactivity_reminders();
```

## 💡 Tips

1. **Start Conservatively**: Begin with longer cooldown periods and narrow time windows
2. **Monitor Closely**: Watch email delivery rates and user feedback
3. **Gradual Rollout**: Enable for subset of users initially
4. **User Control**: Always provide easy opt-out options
5. **Performance**: Email operations are non-blocking and won't affect app performance

---

For support or questions, check the implementation files:
- `lib/services/email.ts` - Main email service
- `lib/services/emailTrigger.ts` - Trigger logic
- `lib/utils/taskCompletion.ts` - Task analysis
- `components/ui/EmailPreferences.tsx` - User preferences UI