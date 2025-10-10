/**
 * Debug script to check scorecard data fetching and database connectivity
 * Run with: npx tsx scripts/debug-scorecard.ts
 */

// Load environment variables from .env file BEFORE imports
import { readFileSync } from 'fs'
import { join } from 'path'

const envPath = join(process.cwd(), '.env')
try {
  const envContent = readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim()
    if (!trimmedLine || trimmedLine.startsWith('#')) return
    
    const match = trimmedLine.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/)
    if (match) {
      const [, key, rawValue] = match
      // Remove quotes if present
      const value = rawValue.replace(/^["']|["']$/g, '')
      process.env[key] = value
    }
  })
} catch (error) {
  console.warn('⚠️  Could not load .env file')
}

// Now import after env vars are loaded
import { supabaseAdmin } from '../lib/supabase/server.js'
import type { Database } from '../types/database.js'

type Profile = Database['public']['Tables']['profiles']['Row']
type DailyEntry = Database['public']['Tables']['daily_entries']['Row']

async function debugScorecard() {
  console.log('🔍 Debugging Scorecard Data Fetching\n')
  console.log('=' .repeat(60))

  try {
    // 1. Check environment variables
    console.log('\n1️⃣  Checking environment variables...')
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_KEY',
    ]
    
    let missingVars = false
    for (const varName of requiredEnvVars) {
      const value = process.env[varName]
      if (!value) {
        console.error(`   ❌ Missing: ${varName}`)
        missingVars = true
      } else {
        console.log(`   ✅ ${varName}: ${value.substring(0, 20)}...`)
      }
    }

    if (missingVars) {
      console.error('\n❌ Missing required environment variables!')
      console.error('Please ensure .env or .env.local has all required values.')
      return
    }

    // 2. Test database connection
    console.log('\n2️⃣  Testing database connection...')
    try {
      const { data: testData, error: testError } = await supabaseAdmin
        .from('profiles')
        .select('count')
        .limit(1)
      
      if (testError) {
        console.error('   ❌ Database connection failed:', testError.message)
        console.error('   Details:', testError)
        return
      }
      
      console.log('   ✅ Database connection successful')
    } catch (connError) {
      console.error('   ❌ Database connection error:', connError)
      return
    }

    // 3. Check profiles table
    console.log('\n3️⃣  Checking profiles table...')
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
      .limit(5)

    if (profilesError) {
      console.error('   ❌ Error fetching profiles:', profilesError.message)
      console.error('   Details:', profilesError)
      return
    }

    if (!profiles || profiles.length === 0) {
      console.log('   ⚠️  No profiles found in the database')
      console.log('   This means no users have signed up yet.')
      console.log('\n   To fix:')
      console.log('   1. Start the dev server: npm dev')
      console.log('   2. Visit http://localhost:3000')
      console.log('   3. Sign up for a new account')
      console.log('   4. Complete the onboarding')
      return
    }

    console.log(`   ✅ Found ${profiles.length} profiles`)
    
    // Pick the first profile for detailed investigation
    const profile = profiles[0] as Profile
    console.log('\n   📋 Sample profile:')
    console.log(`   - ID: ${profile.id}`)
    console.log(`   - Clerk User ID: ${profile.clerk_user_id}`)
    console.log(`   - Email: ${profile.email}`)
    console.log(`   - Arc Start Date: ${profile.arc_start_date}`)
    console.log(`   - Timezone: ${profile.timezone}`)
    console.log(`   - Created At: ${profile.created_at}`)

    // 4. Check daily entries for this user
    console.log('\n4️⃣  Checking daily entries for this user...')
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score, is_complete, created_at')
      .eq('user_id', profile.id)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('   ❌ Error fetching entries:', entriesError.message)
      console.error('   Details:', entriesError)
      return
    }

    console.log(`   ✅ Found ${entries?.length || 0} daily entries`)
    
    if (!entries || entries.length === 0) {
      console.log('   ⚠️  No daily entries found for this user')
      console.log('\n   This could mean:')
      console.log('   - User just signed up and hasn\'t made any entries')
      console.log('   - Cron job hasn\'t created today\'s entry yet')
      console.log('   - User hasn\'t visited /today page yet')
      console.log('\n   To fix:')
      console.log('   1. Visit http://localhost:3000/today')
      console.log('   2. The page should auto-create today\'s entry')
      console.log('   3. Start tracking your habits')
      return
    }

    // Show first and last few entries
    console.log('\n   📅 First 3 entries:')
    entries.slice(0, 3).forEach((entry: DailyEntry) => {
      console.log(`   - ${entry.entry_date}: Score ${entry.daily_score} ${entry.is_complete ? '✓' : '○'}`)
    })

    if (entries.length > 3) {
      console.log('\n   📅 Last 3 entries:')
      entries.slice(-3).forEach((entry: DailyEntry) => {
        console.log(`   - ${entry.entry_date}: Score ${entry.daily_score} ${entry.is_complete ? '✓' : '○'}`)
      })
    }

    // 5. Validate arc date range
    console.log('\n5️⃣  Validating arc date range...')
    const arcStartDate = new Date(profile.arc_start_date)
    const arcEndDate = new Date(arcStartDate)
    arcEndDate.setDate(arcEndDate.getDate() + 90)
    const today = new Date()
    
    console.log(`   Arc Start: ${profile.arc_start_date}`)
    console.log(`   Arc End: ${arcEndDate.toISOString().split('T')[0]}`)
    console.log(`   Today: ${today.toISOString().split('T')[0]}`)
    
    const daysSinceStart = Math.floor((today.getTime() - arcStartDate.getTime()) / (1000 * 60 * 60 * 24))
    console.log(`   Days since arc start: ${daysSinceStart}`)
    
    if (daysSinceStart < 0) {
      console.log('   ⚠️  Arc start date is in the future!')
    } else if (daysSinceStart > 90) {
      console.log('   ⚠️  Arc has already completed (>90 days)')
    } else {
      console.log(`   ✅ Arc is active (Day ${daysSinceStart} of 90)`)
    }

    // 6. Test scorecard generation logic
    console.log('\n6️⃣  Testing scorecard generation logic...')
    
    const { data: rangeEntries, error: rangeError } = await supabaseAdmin
      .from('daily_entries')
      .select('entry_date, daily_score')
      .eq('user_id', profile.id)
      .gte('entry_date', profile.arc_start_date)
      .order('entry_date', { ascending: true })

    if (rangeError) {
      console.error('   ❌ Error with date range query:', rangeError.message)
      return
    }

    console.log(`   ✅ Range query returned ${rangeEntries?.length || 0} entries`)

    // Build score map like the API does
    const scoreMap = new Map<string, number>()
    if (rangeEntries) {
      rangeEntries.forEach((entry: DailyEntry) => {
        scoreMap.set(entry.entry_date, entry.daily_score)
      })
    }
    console.log(`   ✅ Score map has ${scoreMap.size} entries`)

    // Generate scorecard structure
    let totalDaysGenerated = 0
    let daysWithData = 0
    let futureDays = 0
    let pastDaysWithoutData = 0

    for (let weekIndex = 0; weekIndex < 13; weekIndex++) {
      for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
        const dayOffset = weekIndex * 7 + dayIndex
        const currentDate = new Date(arcStartDate)
        currentDate.setDate(currentDate.getDate() + dayOffset)
        
        const dateStr = currentDate.toISOString().split('T')[0]
        const isFuture = currentDate > today
        const score = scoreMap.get(dateStr) ?? 0

        totalDaysGenerated++
        if (score > 0) daysWithData++
        if (isFuture) futureDays++
        if (!isFuture && score === 0) pastDaysWithoutData++
      }
    }

    console.log(`\n   📊 Scorecard Statistics:`)
    console.log(`   - Total days generated: ${totalDaysGenerated} (should be 91)`)
    console.log(`   - Days with data (score > 0): ${daysWithData}`)
    console.log(`   - Future days: ${futureDays}`)
    console.log(`   - Past/present days without data: ${pastDaysWithoutData}`)

    if (totalDaysGenerated !== 91) {
      console.log('   ⚠️  Warning: Should generate exactly 91 days!')
    }

    // 7. Check for date format consistency
    console.log('\n7️⃣  Checking date format consistency...')
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    const invalidDates = (rangeEntries || []).filter(
      (entry: DailyEntry) => !dateRegex.test(entry.entry_date)
    )
    
    if (invalidDates.length > 0) {
      console.log('   ⚠️  Found entries with invalid date format:')
      invalidDates.forEach((entry: DailyEntry) => {
        console.log(`      - ${entry.entry_date}`)
      })
    } else {
      console.log('   ✅ All dates are in YYYY-MM-DD format')
    }

    // 8. Summary
    console.log('\n' + '='.repeat(60))
    console.log('📝 SUMMARY\n')
    
    if (pastDaysWithoutData > daysSinceStart * 0.5) {
      console.log('⚠️  ISSUE DETECTED: Many past days have no data')
      console.log('\nPossible causes:')
      console.log('1. User hasn\'t been tracking habits regularly')
      console.log('2. Daily entries aren\'t being created automatically')
      console.log('3. User manually deleted some entries')
      console.log('\nSuggested fixes:')
      console.log('1. Visit /today page to create today\'s entry')
      console.log('2. Check if cron job is running (vercel.json config)')
      console.log('3. Manually trigger cron: POST /api/cron/daily-reset')
    } else {
      console.log('✅ Scorecard data looks good!')
      console.log(`   - ${daysWithData} days with tracking data`)
      console.log(`   - ${futureDays} future days (expected)`)
      console.log(`   - Database connection is working`)
      console.log(`   - Scorecard should display correctly`)
    }

    console.log('\n' + '='.repeat(60))
    console.log('🎯 Debug complete!\n')

  } catch (error) {
    console.error('\n❌ Unexpected error:', error)
    if (error instanceof Error) {
      console.error('Error message:', error.message)
      console.error('Stack trace:', error.stack)
    }
  }
}

// Run the debug function
debugScorecard().catch(console.error)
