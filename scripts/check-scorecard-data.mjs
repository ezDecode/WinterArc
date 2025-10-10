#!/usr/bin/env node
/**
 * Quick script to check what's in the database for scorecard
 */

import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkData() {
  console.log('🔍 Checking database for scorecard data...\n')

  // 1. Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (profilesError) {
    console.error('❌ Error fetching profiles:', profilesError.message)
    return
  }

  if (!profiles || profiles.length === 0) {
    console.log('⚠️  No profiles found')
    return
  }

  const profile = profiles[0]
  console.log('👤 User Profile:')
  console.log(`   Email: ${profile.email}`)
  console.log(`   Arc Start: ${profile.arc_start_date}`)
  console.log(`   Timezone: ${profile.timezone}`)

  // 2. Get ALL daily entries for this user
  const { data: entries, error: entriesError } = await supabase
    .from('daily_entries')
    .select('entry_date, daily_score, is_complete, study_blocks, reading, pushups, meditation, water_bottles')
    .eq('user_id', profile.id)
    .order('entry_date', { ascending: true })

  if (entriesError) {
    console.error('\n❌ Error fetching entries:', entriesError.message)
    return
  }

  console.log(`\n📊 Total Entries: ${entries?.length || 0}`)

  if (!entries || entries.length === 0) {
    console.log('\n⚠️  NO ENTRIES FOUND!')
    console.log('This means:')
    console.log('  - You need to visit /today to create entries')
    console.log('  - Or the cron job hasn\'t run')
    return
  }

  // 3. Analyze entries
  const withScores = entries.filter(e => e.daily_score > 0)
  const withoutScores = entries.filter(e => e.daily_score === 0)
  const complete = entries.filter(e => e.is_complete)

  console.log(`\n📈 Entry Analysis:`)
  console.log(`   Entries with score > 0: ${withScores.length}`)
  console.log(`   Entries with score = 0: ${withoutScores.length}`)
  console.log(`   Complete entries (5/5): ${complete.length}`)

  console.log('\n📅 Recent Entries:')
  entries.slice(-10).forEach(entry => {
    const hasData = 
      entry.study_blocks?.some(b => b.checked) ||
      entry.reading?.checked ||
      entry.pushups?.set1 ||
      entry.meditation?.checked ||
      entry.water_bottles?.some(b => b)
    
    console.log(`   ${entry.entry_date}: Score ${entry.daily_score}/5 ${entry.is_complete ? '✓' : '○'} ${hasData ? '(has data)' : '(empty)'}`)
  })

  // 4. Check if there are entries with data but score = 0
  const needsRecalc = entries.filter(entry => {
    if (entry.daily_score > 0) return false
    
    const hasData = 
      entry.study_blocks?.some(b => b.checked) ||
      entry.reading?.checked ||
      entry.pushups?.set1 ||
      entry.meditation?.checked ||
      entry.water_bottles?.some(b => b)
    
    return hasData
  })

  if (needsRecalc.length > 0) {
    console.log(`\n⚠️  ISSUE FOUND: ${needsRecalc.length} entries have data but score = 0`)
    console.log('These entries need score recalculation:')
    needsRecalc.forEach(e => console.log(`   - ${e.entry_date}`))
  }

  // 5. Summary
  console.log('\n' + '='.repeat(60))
  if (needsRecalc.length > 0) {
    console.log('🔧 NEEDS FIX: Entries have data but scores are 0')
    console.log('   Run: node scripts/recalculate-scores.mjs')
  } else if (withoutScores.length === entries.length) {
    console.log('⚠️  All entries have score 0 - no data has been tracked yet')
  } else {
    console.log('✅ Data looks correct!')
  }
  console.log('='.repeat(60))
}

checkData().catch(console.error)
