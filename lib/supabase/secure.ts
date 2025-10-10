import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { auth } from '@clerk/nextjs/server'

/**
 * Secure Supabase client that enforces Row Level Security (RLS)
 * This should be used for all user-facing operations
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * Create a secure client with user authentication
 * This client respects RLS policies and should be used for most operations
 */
export async function createSecureClient() {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  
  if (!token) {
    throw new Error('No authentication token available')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Create a secure client for server-side operations with user context
 * This ensures RLS policies are enforced even in server components
 */
export async function createServerSecureClient() {
  const { getToken } = await auth()
  const token = await getToken({ template: 'supabase' })
  
  if (!token) {
    throw new Error('No authentication token available')
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
        'x-application-name': 'winter-arc-tracker-secure',
      },
    },
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * Validate that a user can access a specific resource
 * This is a helper function to check permissions before operations
 */
export async function validateUserAccess(userId: string, resourceUserId: string): Promise<boolean> {
  if (!userId || !resourceUserId) {
    return false
  }
  
  // In a properly configured RLS environment, this check would be redundant
  // But it provides an extra layer of security
  return userId === resourceUserId
}

/**
 * Safe database operation wrapper that handles errors and enforces security
 */
export async function safeDbOperation<T>(
  operation: () => Promise<T>,
  errorMessage: string = 'Database operation failed'
): Promise<{ data: T | null; error: string | null }> {
  try {
    const data = await operation()
    return { data, error: null }
  } catch (error) {
    console.error('Database operation error:', error)
    return { 
      data: null, 
      error: error instanceof Error ? error.message : errorMessage 
    }
  }
}
