import { test } from 'node:test'
import assert from 'node:assert'
import { calculateStreaks, getStreakColor } from '@/lib/utils/streak'
import type { DailyEntry } from '@/types'

// Helper to create mock daily entry
function createMockEntry(date: string, score: number): Partial<DailyEntry> {
  return {
    id: `test-${date}`,
    user_id: 'test-user',
    entry_date: date,
    daily_score: score,
    is_complete: score === 5,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as DailyEntry
}

test('calculateStreaks: returns zeros for empty entries', () => {
  const result = calculateStreaks([])
  assert.strictEqual(result.currentStreak, 0)
  assert.strictEqual(result.longestStreak, 0)
})

test('calculateStreaks: calculates current streak correctly', () => {
  const entries = [
    createMockEntry('2024-01-01', 3),
    createMockEntry('2024-01-02', 5),
    createMockEntry('2024-01-03', 5),
    createMockEntry('2024-01-04', 5),
  ] as DailyEntry[]

  const result = calculateStreaks(entries)
  assert.strictEqual(result.currentStreak, 3, 'Should count consecutive 5/5 days from most recent')
  assert.strictEqual(result.longestStreak, 3)
})

test('calculateStreaks: current streak breaks on non-perfect day', () => {
  const entries = [
    createMockEntry('2024-01-01', 5),
    createMockEntry('2024-01-02', 5),
    createMockEntry('2024-01-03', 4),
    createMockEntry('2024-01-04', 5),
  ] as DailyEntry[]

  const result = calculateStreaks(entries)
  assert.strictEqual(result.currentStreak, 1, 'Current streak should be 1 (only most recent day)')
})

test('calculateStreaks: finds longest streak in history', () => {
  const entries = [
    createMockEntry('2024-01-01', 5),
    createMockEntry('2024-01-02', 5),
    createMockEntry('2024-01-03', 5),
    createMockEntry('2024-01-04', 5),
    createMockEntry('2024-01-05', 5), // Longest streak: 5 days
    createMockEntry('2024-01-06', 3),
    createMockEntry('2024-01-07', 5),
    createMockEntry('2024-01-08', 5), // Current streak: 2 days
  ] as DailyEntry[]

  const result = calculateStreaks(entries)
  assert.strictEqual(result.currentStreak, 2)
  assert.strictEqual(result.longestStreak, 5)
})

test('calculateStreaks: handles single perfect day', () => {
  const entries = [
    createMockEntry('2024-01-01', 5),
  ] as DailyEntry[]

  const result = calculateStreaks(entries)
  assert.strictEqual(result.currentStreak, 1)
  assert.strictEqual(result.longestStreak, 1)
})

test('calculateStreaks: no streak when no perfect days', () => {
  const entries = [
    createMockEntry('2024-01-01', 3),
    createMockEntry('2024-01-02', 4),
    createMockEntry('2024-01-03', 2),
  ] as DailyEntry[]

  const result = calculateStreaks(entries)
  assert.strictEqual(result.currentStreak, 0)
  assert.strictEqual(result.longestStreak, 0)
})

test('getStreakColor: returns correct colors for different streak lengths', () => {
  assert.strictEqual(getStreakColor(0), 'text-text-tertiary')
  assert.strictEqual(getStreakColor(3), 'text-warning')
  assert.strictEqual(getStreakColor(6), 'text-warning')
  assert.strictEqual(getStreakColor(7), 'text-success')
  assert.strictEqual(getStreakColor(30), 'text-success')
})

console.log('✅ All streak utility tests passed!')
