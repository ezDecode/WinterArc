#!/usr/bin/env node
/**
 * Script to create daily entries for all days from arc start to today
 * This allows users to go back and fill in previous days' data
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

// Default entry structure
function createDefaultEntry(userId, date) {
  return {
    user_id: userId,
    entry_date: date,
    study_blocks: [
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' }
    ],
    reading: { checked: false, bookName: '', pages: 0 },
    pushups: { set1: false, set2: false, set3: false, extras: 0 },
    meditation: { checked: false, method: '', duration: 0 },
    water_bottles: [false, false, false, false, false, false, false, false],
    notes: { morning: '', evening: '', general: '' },
    daily_score: 0,
    is_complete: false
  }
}

async function backfillEntries() {
  console.log('🔄 Backfilling daily entries...\\n')

  // 1. Get user profile
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false })
    .limit(1)

  if (profilesError || !profiles || profiles.length === 0) {
    console.error('❌ No profiles found')
    return
  }

  const profile = profiles[0]
  console.log(`👤 User: ${profile.email}`)
  console.log(`📅 Arc Start: ${profile.arc_start_date}`)
  console.log(`🌍 Timezone: ${profile.timezone}\\n`)

  // 2. Calculate date range
  const arcStart = new Date(profile.arc_start_date + 'T00:00:00Z')
  const today = new Date()
  today.setUTCHours(0, 0, 0, 0)
  
  // Don't go beyond 90 days
  const arcEnd = new Date(arcStart)
  arcEnd.setUTCDate(arcEnd.getUTCDate() + 89) // 0-89 = 90 days
  
  const endDate = today < arcEnd ? today : arcEnd

  console.log(`📆 Creating entries from ${arcStart.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}\\n`)

  // 3. Get existing entries
  const { data: existingEntries } = await supabase
    .from('daily_entries')
    .select('entry_date')
    .eq('user_id', profile.id)

  const existingDates = new Set(existingEntries?.map(e => e.entry_date) || [])
  console.log(`✓ Found ${existingDates.size} existing entries\\n`)

  // 4. Create missing entries
  const entriesToCreate = []
  let currentDate = new Date(arcStart)

  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0]
    
    if (!existingDates.has(dateStr)) {
      entriesToCreate.push(createDefaultEntry(profile.id, dateStr))
    }
    
    currentDate.setUTCDate(currentDate.getUTCDate() + 1)
  }

  if (entriesToCreate.length === 0) {
    console.log('✅ All entries already exist!')
    return
  }

  console.log(`📝 Creating ${entriesToCreate.length} new entries...`)

  // Insert in batches to avoid timeout
  const batchSize = 50
  let created = 0
  
  for (let i = 0; i < entriesToCreate.length; i += batchSize) {
    const batch = entriesToCreate.slice(i, i + batchSize)
    
    const { error } = await supabase
      .from('daily_entries')
      .insert(batch)
    
    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message)
      continue
    }
    
    created += batch.length
    console.log(`   ✓ Created ${created}/${entriesToCreate.length}`)
  }

  console.log(`\\n✅ Done! Created ${created} entries`)
  console.log('\\n💡 Now you can:')
  console.log('   1. Visit /today to track today')
  console.log('   2. Click on previous days in the scorecard to edit them')
}

backfillEntries().catch(console.error)
