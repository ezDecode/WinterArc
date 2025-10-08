/**
 * Email Reminder Service
 * 
 * Handles sending daily task reminder emails using Resend
 * with comprehensive rate limiting and timezone awareness
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Initialize Resend client
const resend = new Resend(process.env.RESEND_API_KEY)

// Create Supabase admin client for service operations
function getSupabaseServiceClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase credentials not configured')
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  })
}

// Email configuration
const EMAIL_CONFIG = {
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@winterarc.com',
  FROM_NAME: 'Winter Arc',
  RATE_LIMIT_PER_USER_HOURS: 6,
  MAX_EMAILS_PER_DAY: 100, // Stay well under Resend's 3000/month limit
} as const

// Types for email data
interface IncompleteTask {
  name: string
  details: string
}

interface EmailReminderData {
  userId: string
  email: string
  userName: string
  incompleteTasks: IncompleteTask[]
  triggerType: 'on_demand' | 'inactivity'
  timezone: string
}

interface EmailResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * Check if user is eligible for email reminder
 */
async function isUserEligibleForEmail(userId: string): Promise<boolean> {
  try {
    const supabase = getSupabaseServiceClient()

    const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .rpc('is_user_eligible_for_email', { p_user_id: userId })

    if (error) {
      console.error('Error checking user eligibility:', error)
      return false
    }

    return Boolean(data)
  } catch (error) {
    console.error('Error in eligibility check:', error)
    return false
  }
}

/**
 * Update user's last email sent timestamp
 */
async function updateUserLastEmailSent(userId: string): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()

    const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .rpc('update_user_last_email_sent', { p_user_id: userId })

    if (error) {
      console.error('Error updating last email timestamp:', error)
    }
  } catch (error) {
    console.error('Error in timestamp update:', error)
  }
}

/**
 * Log email reminder to audit table
 */
async function logEmailReminder(
  userId: string,
  email: string,
  triggerType: 'on_demand' | 'inactivity',
  incompleteTasks: IncompleteTask[],
  timezone: string,
  status: 'sent' | 'failed',
  messageId?: string
): Promise<void> {
  try {
    const supabase = getSupabaseServiceClient()

    const { error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .from('email_reminders')
      .insert({
        user_id: userId,
        email_address: email,
        trigger_type: triggerType,
        reminder_reason: `${incompleteTasks.length} incomplete tasks`,
        incomplete_tasks: { tasks: incompleteTasks },
        email_status: status,
        resend_message_id: messageId,
        user_timezone: timezone,
      })

    if (error) {
      console.error('Error logging email reminder:', error)
    }
  } catch (error) {
    console.error('Error in email logging:', error)
  }
}

/**
 * Generate email subject based on incomplete tasks
 */
function generateEmailSubject(incompleteTasks: IncompleteTask[]): string {
  const taskCount = incompleteTasks.length
  
  if (taskCount === 1) {
    return `🎯 Don't forget your ${incompleteTasks[0].name} today!`
  } else if (taskCount <= 3) {
    return `🎯 ${taskCount} Winter Arc tasks need your attention`
  } else {
    return `🎯 Your Winter Arc daily tasks are waiting`
  }
}

/**
 * Generate HTML email content
 */
function generateEmailHTML(userName: string, incompleteTasks: IncompleteTask[]): string {
  const tasksList = incompleteTasks.map(task => 
    `<li style="margin-bottom: 8px;">
      <strong style="color: #7c3aed;">${task.name}</strong>
      <br>
      <span style="color: #6b7280; font-size: 14px;">${task.details}</span>
    </li>`
  ).join('')

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Winter Arc Daily Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #000000; font-family: 'Inter', system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #0a0a0a; color: #ffffff;">
          <!-- Header -->
          <div style="background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); padding: 30px 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold; color: white;">
              ❄️ Winter Arc
            </h1>
            <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
              Your 90-day transformation continues
            </p>
          </div>

          <!-- Content -->
          <div style="padding: 30px 20px;">
            <h2 style="color: #ffffff; font-size: 22px; margin-bottom: 16px;">
              Hey ${userName}! 👋
            </h2>
            
            <p style="color: #a3a3a3; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
              You're doing great on your Winter Arc journey! I noticed you have 
              ${incompleteTasks.length === 1 ? 'a task' : 'some tasks'} that could use your attention today.
            </p>

            <div style="background-color: #141414; border: 1px solid #262626; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="color: #ffffff; margin-bottom: 16px; font-size: 18px;">
                📋 Incomplete Tasks
              </h3>
              <ul style="margin: 0; padding-left: 20px; color: #d1d5db;">
                ${tasksList}
              </ul>
            </div>

            <p style="color: #a3a3a3; line-height: 1.6; margin-bottom: 24px; font-size: 16px;">
              Every small action counts toward your bigger goals. You've got this! 💪
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin-bottom: 24px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://winterarc.com'}/today" 
                 style="display: inline-block; background: linear-gradient(135deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Complete Your Tasks →
              </a>
            </div>

            <!-- Stats -->
            <div style="background-color: #141414; border: 1px solid #262626; border-radius: 12px; padding: 20px; text-align: center;">
              <p style="color: #10b981; margin: 0; font-size: 14px; font-weight: 600;">
                🔥 Keep your streak alive! Every day matters in your 90-day journey.
              </p>
            </div>
          </div>

          <!-- Footer -->
          <div style="background-color: #141414; border-top: 1px solid #262626; padding: 20px; text-align: center;">
            <p style="color: #737373; margin: 0; font-size: 12px;">
              You're receiving this because you have notifications enabled for your Winter Arc account.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://winterarc.com'}/profile" 
                 style="color: #7c3aed; text-decoration: underline;">Manage preferences</a>
            </p>
            <p style="color: #737373; margin: 12px 0 0 0; font-size: 12px;">
              Winter Arc • Transform in 90 days
            </p>
          </div>
        </div>
      </body>
    </html>
  `
}

/**
 * Generate plain text email content
 */
function generateEmailText(userName: string, incompleteTasks: IncompleteTask[]): string {
  const tasksList = incompleteTasks.map(task => 
    `• ${task.name}: ${task.details}`
  ).join('\n')

  return `
Winter Arc - Daily Reminder

Hey ${userName}!

You're doing great on your Winter Arc journey! I noticed you have ${incompleteTasks.length === 1 ? 'a task' : 'some tasks'} that could use your attention today.

Incomplete Tasks:
${tasksList}

Every small action counts toward your bigger goals. You've got this!

Complete your tasks: ${process.env.NEXT_PUBLIC_APP_URL || 'https://winterarc.com'}/today

Keep your streak alive! Every day matters in your 90-day journey.

--
You're receiving this because you have notifications enabled for your Winter Arc account.
Manage preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://winterarc.com'}/profile

Winter Arc • Transform in 90 days
  `.trim()
}

/**
 * Send reminder email using Resend
 */
async function sendReminderEmail(data: EmailReminderData): Promise<EmailResult> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured')
      return { success: false, error: 'Email service not configured' }
    }

    const subject = generateEmailSubject(data.incompleteTasks)
    const html = generateEmailHTML(data.userName, data.incompleteTasks)
    const text = generateEmailText(data.userName, data.incompleteTasks)

    const { data: result, error } = await resend.emails.send({
      from: `${EMAIL_CONFIG.FROM_NAME} <${EMAIL_CONFIG.FROM_EMAIL}>`,
      to: [data.email],
      subject,
      html,
      text,
      tags: [
        { name: 'type', value: 'reminder' },
        { name: 'trigger', value: data.triggerType },
        { name: 'app', value: 'winter-arc' }
      ]
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message || 'Failed to send email' }
    }

    return { success: true, messageId: result?.id }
  } catch (error) {
    console.error('Email sending error:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Main function to send reminder email with all safety checks
 */
export async function sendTaskReminderEmail(data: EmailReminderData): Promise<EmailResult> {
  try {
    // Validate required data
    if (!data.userId || !data.email || !data.incompleteTasks.length) {
      return { success: false, error: 'Invalid email data provided' }
    }

    // Check if user is eligible (rate limiting, timezone, preferences)
    const isEligible = await isUserEligibleForEmail(data.userId)
    if (!isEligible) {
      console.log(`User ${data.userId} not eligible for email reminder`)
      return { success: false, error: 'User not eligible for reminder' }
    }

    // Send the email
    const result = await sendReminderEmail(data)

    // Log the email attempt
    await logEmailReminder(
      data.userId,
      data.email,
      data.triggerType,
      data.incompleteTasks,
      data.timezone,
      result.success ? 'sent' : 'failed',
      result.messageId
    )

    // Update user's last email timestamp if successful
    if (result.success) {
      await updateUserLastEmailSent(data.userId)
    }

    return result
  } catch (error) {
    console.error('Error in sendTaskReminderEmail:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }
  }
}

/**
 * Get users eligible for inactivity-based reminders
 */
export async function getUsersForInactivityReminders(): Promise<Array<{
  user_id: string
  email: string
  timezone: string
  last_login_at: string
}>> {
  try {
    const supabase = getSupabaseServiceClient()

    const { data, error } = await (supabase as any) // eslint-disable-line @typescript-eslint/no-explicit-any
      .rpc('get_users_for_inactivity_reminders')

    if (error) {
      console.error('Error fetching users for reminders:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getUsersForInactivityReminders:', error)
    return []
  }
}

// Export types for use in other modules
export type { EmailReminderData, IncompleteTask, EmailResult }