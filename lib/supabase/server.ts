import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Validate server environment variables
function getSupabaseServerConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable')
  }

  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_KEY environment variable')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable')
  }

  // Validate URL format
  try {
    new URL(supabaseUrl)
  } catch {
    throw new Error('Invalid NEXT_PUBLIC_SUPABASE_URL format')
  }

  return { supabaseUrl, supabaseServiceKey, supabaseAnonKey }
}

const { supabaseUrl, supabaseServiceKey, supabaseAnonKey } = getSupabaseServerConfig()

/**
 * Admin client - BYPASSES RLS
 * ⚠️ USE SPARINGLY! Only for:
 * - Cron jobs
 * - Admin operations
 * - Creating user profiles
 * 
 * For regular API routes, use supabaseServer instead
 */
export const supabaseAdmin = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },

  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'winter-arc-tracker-admin',
    },
  },
})

/**
 * Regular server client - RESPECTS RLS
 * ✅ Use this for most API routes
 * - Enforces row-level security
 * - Uses anon key with JWT authentication
 * - Safer for user operations
 */
export const supabaseServer = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'x-application-name': 'winter-arc-tracker-server',
    },
  },
})
