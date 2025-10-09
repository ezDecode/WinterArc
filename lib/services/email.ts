/**
 * Email Reminder Service
 * * Handles sending daily task reminder emails using Resend
 * with comprehensive rate limiting and timezone awareness
 */

import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

// Lazy initialize Resend client to avoid build-time errors
let resendClient: Resend | null = null

function getResendClient(): Resend {
  if (!resendClient) {
    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      throw new Error('RESEND_API_KEY environment variable is not set')
    }
    resendClient = new Resend(apiKey)
  }
  return resendClient
}

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
  FROM_EMAIL: process.env.FROM_EMAIL || 'noreply@creativesky.me',
  FROM_NAME: 'Winter Arc',
  RATE_LIMIT_PER_USER_HOURS: 6,
  MAX_EMAILS_PER_DAY: 100, // Stay well under Resend's 3000/month limit
} as const

// Types for email data
interface IncompleteTask {
  name: string
  details: string
}

// [MODIFIED] Added currentDay for personalization
interface EmailReminderData {
  userId: string
  email: string
  userName: string
  incompleteTasks: IncompleteTask[]
  triggerType: 'on_demand' | 'inactivity'
  timezone: string
  currentDay: number
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
 * [REWRITTEN] Generate HTML email content with new design
 */
function generateEmailHTML(
  userName: string, 
  incompleteTasks: IncompleteTask[],
  currentDay: number 
): string {
  
  const getTaskIcon = (taskName: string): string => {
    const lowerCaseName = taskName.toLowerCase();
    if (lowerCaseName.includes('study') || lowerCaseName.includes('work')) return '💻';
    if (lowerCaseName.includes('read')) return '📖';
    if (lowerCaseName.includes('water') || lowerCaseName.includes('drink')) return '💧';
    if (lowerCaseName.includes('gym') || lowerCaseName.includes('workout')) return '💪';
    return '📋'; // Default icon
  };

  const tasksList = incompleteTasks.map(task => 
    `<li style="margin-bottom: 12px; display: flex; align-items: flex-start; text-align: left;">
      <span style="font-size: 20px; margin-right: 12px; margin-top: 2px; font-family: sans-serif;">${getTaskIcon(task.name)}</span>
      <div>
        <strong style="color: #e5e7eb; font-weight: 500;">${task.name}</strong>
        <br>
        <span style="color: #a1a1aa; font-size: 14px;">${task.details}</span>
      </div>
    </li>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter+Tight:wght@400;500;600;700&display=swap" rel="stylesheet">
        <title>Winter Arc Daily Reminder</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #09090b; font-family: 'Inter Tight', system-ui, -apple-system, sans-serif;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #111113; color: #fafafa;">
          <div style="background: #18181b; padding: 32px 24px; text-align: center; border-bottom: 1px solid #27272a;">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin: 0 auto 16px auto; color: #a855f7;">
              <path d="M12 2L12.75 3.06L15.31 2.25L15.54 4.88L17.94 4.5L17.5 6.88L19.75 7.75L18.5 9.81L20.5 11L18.5 12.19L19.75 14.25L17.5 15.13L17.94 17.5L15.54 17.13L15.31 19.75L12.75 18.94L12 20L11.25 18.94L8.69 19.75L8.46 17.13L6.06 17.5L6.5 15.13L4.25 14.25L5.5 12.19L3.5 11L5.5 9.81L4.25 7.75L6.5 6.88L6.06 4.5L8.46 4.88L8.69 2.25L11.25 3.06L12 2Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 8.01V8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 12.01V12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 16.01V16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <h1 style="margin: 0; font-size: 28px; font-weight: 600; color: #fafafa; letter-spacing: -1px;">
              Winter Arc
            </h1>
            <p style="margin: 8px 0 0 0; color: #a1a1aa; font-size: 16px; font-weight: 400;">
              Your 90-day transformation continues
            </p>
          </div>

          <div style="padding: 32px 24px;">
            <h2 style="color: #fafafa; font-size: 24px; font-weight: 600; margin: 0 0 16px 0;">
              Hey ${userName}! 👋
            </h2>
            
            <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px; font-weight: 400;">
              You're doing great on your journey! Let's keep the momentum going by finishing today's tasks.
            </p>
            
            <div style="margin-bottom: 24px;">
                <p style="font-size: 14px; color: #a1a1aa; margin: 0 0 8px 0; font-weight: 500;">Your Progress: Day ${currentDay} of 90</p>
                <div style="background-color: #27272a; border-radius: 99px; overflow: hidden; height: 8px;">
                    <div style="width: ${Math.round((currentDay / 90) * 100)}%; height: 8px; background: linear-gradient(90deg, #7c3aed 0%, #a855f7 100%);"></div>
                </div>
            </div>

            <div style="background-color: #18181b; border: 1px solid #27272a; border-radius: 12px; padding: 24px; margin-bottom: 24px;">
              <h3 style="color: #fafafa; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">
                Incomplete Tasks
              </h3>
              <ul style="margin: 0; padding: 0; list-style: none;">
                ${tasksList}
              </ul>
            </div>

            <p style="color: #a1a1aa; line-height: 1.6; margin: 0 0 24px 0; font-size: 16px; font-weight: 400;">
              Every small action counts toward your bigger goals. You've got this!
            </p>

            <div style="text-align: center; margin-bottom: 32px;">
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rebuild.creativesky.me'}/today" 
                 style="display: inline-block; background: linear-gradient(90deg, #7c3aed 0%, #a855f7 100%); color: white; text-decoration: none; padding: 14px 28px; border-radius: 10px; font-weight: 600; font-size: 16px;">
                Complete Your Tasks →
              </a>
            </div>

            <div style="background-color: rgba(22, 163, 74, 0.1); border: 1px solid rgba(34, 197, 94, 0.2); border-radius: 12px; padding: 16px; text-align: center;">
              <p style="color: #4ade80; margin: 0; font-size: 14px; font-weight: 500;">
                🔥 Keep your streak alive! Every day matters.
              </p>
            </div>
          </div>

          <div style="background-color: #18181b; border-top: 1px solid #27272a; padding: 24px; text-align: center;">
            <p style="color: #71717a; margin: 0; font-size: 12px; font-weight: 400; line-height: 1.5;">
              You're receiving this because you have notifications enabled for your Winter Arc account.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL || 'https://rebuild.creativesky.me'}/profile" 
                 style="color: #a855f7; text-decoration: underline;">Manage preferences</a>
            </p>
            <p style="color: #71717a; margin: 12px 0 0 0; font-size: 12px; font-weight: 400;">
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

Complete your tasks: ${process.env.NEXT_PUBLIC_APP_URL || 'https://rebuild.creativesky.me'}/today

Keep your streak alive! Every day matters in your 90-day journey.

--
You're receiving this because you have notifications enabled for your Winter Arc account.
Manage preferences: ${process.env.NEXT_PUBLIC_APP_URL || 'https://rebuild.creativesky.me'}/profile

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
    // [MODIFIED] Pass currentDay to the HTML generator
    const html = generateEmailHTML(data.userName, data.incompleteTasks, data.currentDay)
    const text = generateEmailText(data.userName, data.incompleteTasks)

    const resend = getResendClient()
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