/**
 * Simple database connection test script
 * Run with: npx tsx scripts/test-db-connection.ts
 */

import { readFileSync } from 'fs'
import { join } from 'path'
import { createClient } from '@supabase/supabase-js'

// Load .env file first
const envPath = join(process.cwd(), '.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) return
    
    const match = trimmedLine.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/)
    if (match) {
      const [, key, rawValue] = match
      const value = rawValue.replace(/^["']|["']$/g, '')
      if (!process.env[key]) {  // Don't override existing env vars
        process.env[key] = value
      }
    }
  })
  console.log('✅ Loaded environment variables\n')
} catch (error) {
  console.warn('⚠️  Could not load .env file\n')
}

async function testConnection() {
  console.log('🔍 Testing Database Connection\n')
  console.log('='.repeat(60))

  // Check env vars
  console.log('\n1️⃣  Checking environment variables...')
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing required environment variables!')
    console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌')
    console.error('   SUPABASE_SERVICE_KEY:', supabaseKey ? '✅' : '❌')
    process.exit(1)
  }

  console.log('   ✅ NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...')
  console.log('   ✅ SUPABASE_SERVICE_KEY: ***' + supabaseKey.substring(supabaseKey.length - 10))

  // Create Supabase client
  console.log('\n2️⃣  Creating Supabase client...')
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  console.log('   ✅ Client created')

  // Test connection with profiles table
  console.log('\n3️⃣  Testing database connection...')
  try {
    const { data, error, count } = await supabase
      .from('profiles')
      .select('id, email, arc_start_date', { count: 'exact' })
      .limit(5)

    if (error) {
      console.error('   ❌ Database error:', error.message)
      console.error('   Code:', error.code)
      console.error('   Details:', error.details)
      console.error('   Hint:', error.hint)
      return
    }

    console.log(`   ✅ Connection successful!`)
    console.log(`   ✅ Found ${count} total profiles`)

    if (data && data.length > 0) {
      console.log('\n4️⃣  Sample profiles:')
      data.forEach((profile: any, index: number) => {
        console.log(`   ${index + 1}. Email: ${profile.email}`)
        console.log(`      Arc Start: ${profile.arc_start_date}`)
        console.log(`      ID: ${profile.id}`)
      })

      // Test daily entries for first profile
      console.log('\n5️⃣  Checking daily entries for first profile...')
      const firstProfileId = data[0].id

      const { data: entries, error: entriesError } = await supabase
        .from('daily_entries')
        .select('entry_date, daily_score', { count: 'exact' })
        .eq('user_id', firstProfileId)
        .order('entry_date', { ascending: false })
        .limit(10)

      if (entriesError) {
        console.error('   ❌ Error fetching entries:', entriesError.message)
        return
      }

      console.log(`   ✅ Found ${entries?.length || 0} entries (showing last 10)`)
      
      if (entries && entries.length > 0) {
        entries.forEach((entry: any) => {
          console.log(`      - ${entry.entry_date}: Score ${entry.daily_score}`)
        })
      } else {
        console.log('   ⚠️  No entries found - user needs to start tracking')
      }
    } else {
      console.log('\n   ⚠️  No profiles found in database')
      console.log('   Action needed: Sign up at http://localhost:3000')
    }

    console.log('\n' + '='.repeat(60))
    console.log('✅ Database test complete!\n')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
  }
}

testConnection().catch(console.error)
