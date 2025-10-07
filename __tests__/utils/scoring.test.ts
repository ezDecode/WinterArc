import { test } from 'node:test'
import assert from 'node:assert'
import { calculateDailyScore, isDayComplete, calculateTargetCompletion } from '@/lib/utils/scoring'
import type { DailyEntry, StudyBlock, Reading, Pushups, Meditation } from '@/types'

// Helper to create complete entry
function createMockEntry(overrides: Partial<DailyEntry> = {}): Partial<DailyEntry> {
  return {
    id: 'test-id',
    user_id: 'test-user',
    entry_date: '2024-01-01',
    study_blocks: [
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' },
      { checked: false, topic: '' },
    ],
    reading: { checked: false, bookName: '', pages: 0 },
    pushups: { set1: false, set2: false, set3: false, extras: 0 },
    meditation: { checked: false, method: '', duration: 0 },
    water_bottles: [false, false, false, false, false, false, false, false],
    notes: {},
    daily_score: 0,
    is_complete: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }
}

test('calculateDailyScore: returns 0 for empty entry', () => {
  const entry = createMockEntry()
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 0)
})

test('calculateDailyScore: counts study blocks correctly', () => {
  const entry = createMockEntry({
    study_blocks: [
      { checked: true, topic: 'Math' },
      { checked: true, topic: 'Physics' },
      { checked: true, topic: 'Chemistry' },
      { checked: true, topic: 'Biology' },
    ],
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 1, 'All 4 study blocks should count as 1 point')
})

test('calculateDailyScore: study blocks require all 4 to be checked', () => {
  const entry = createMockEntry({
    study_blocks: [
      { checked: true, topic: 'Math' },
      { checked: true, topic: 'Physics' },
      { checked: true, topic: 'Chemistry' },
      { checked: false, topic: '' }, // One not checked
    ],
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 0, 'Incomplete study blocks should not count')
})

test('calculateDailyScore: counts reading correctly', () => {
  const entry = createMockEntry({
    reading: { checked: true, bookName: 'Atomic Habits', pages: 15 },
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 1)
})

test('calculateDailyScore: counts pushups correctly', () => {
  const entry = createMockEntry({
    pushups: { set1: true, set2: true, set3: true, extras: 5 },
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 1)
})

test('calculateDailyScore: pushups require all 3 sets', () => {
  const entry = createMockEntry({
    pushups: { set1: true, set2: true, set3: false, extras: 0 },
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 0)
})

test('calculateDailyScore: counts meditation correctly', () => {
  const entry = createMockEntry({
    meditation: { checked: true, method: 'Mindfulness', duration: 15 },
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 1)
})

test('calculateDailyScore: counts water correctly', () => {
  const entry = createMockEntry({
    water_bottles: [true, true, true, true, true, true, true, true],
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 1)
})

test('calculateDailyScore: water requires all 8 bottles', () => {
  const entry = createMockEntry({
    water_bottles: [true, true, true, true, true, true, true, false],
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 0)
})

test('calculateDailyScore: calculates perfect day (5/5)', () => {
  const entry = createMockEntry({
    study_blocks: [
      { checked: true, topic: 'Math' },
      { checked: true, topic: 'Physics' },
      { checked: true, topic: 'Chemistry' },
      { checked: true, topic: 'Biology' },
    ],
    reading: { checked: true, bookName: 'Book', pages: 10 },
    pushups: { set1: true, set2: true, set3: true, extras: 0 },
    meditation: { checked: true, method: 'Mindfulness', duration: 10 },
    water_bottles: [true, true, true, true, true, true, true, true],
  })
  const score = calculateDailyScore(entry)
  assert.strictEqual(score, 5)
})

test('isDayComplete: returns true for 5/5 score', () => {
  const entry = createMockEntry({
    study_blocks: [
      { checked: true, topic: 'Math' },
      { checked: true, topic: 'Physics' },
      { checked: true, topic: 'Chemistry' },
      { checked: true, topic: 'Biology' },
    ],
    reading: { checked: true, bookName: 'Book', pages: 10 },
    pushups: { set1: true, set2: true, set3: true, extras: 0 },
    meditation: { checked: true, method: 'Mindfulness', duration: 10 },
    water_bottles: [true, true, true, true, true, true, true, true],
  })
  assert.strictEqual(isDayComplete(entry), true)
})

test('isDayComplete: returns false for incomplete day', () => {
  const entry = createMockEntry({
    reading: { checked: true, bookName: 'Book', pages: 10 },
  })
  assert.strictEqual(isDayComplete(entry), false)
})

test('calculateTargetCompletion: returns 0 for empty entries', () => {
  const completion = calculateTargetCompletion([], 'study')
  assert.strictEqual(completion, 0)
})

test('calculateTargetCompletion: calculates percentage correctly', () => {
  const entries = [
    createMockEntry({
      study_blocks: [
        { checked: true, topic: 'Math' },
        { checked: true, topic: 'Physics' },
        { checked: true, topic: 'Chemistry' },
        { checked: true, topic: 'Biology' },
      ],
    }),
    createMockEntry({
      study_blocks: [
        { checked: false, topic: '' },
        { checked: false, topic: '' },
        { checked: false, topic: '' },
        { checked: false, topic: '' },
      ],
    }),
  ] as DailyEntry[]

  const completion = calculateTargetCompletion(entries, 'study')
  assert.strictEqual(completion, 50, '1 out of 2 days = 50%')
})

console.log('✅ All scoring utility tests passed!')
