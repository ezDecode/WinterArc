import { useEffect, useState, useCallback } from 'react'
import type { DailyEntry } from '@/types'
import { useAutoSave } from './useAutoSave'
import { calculateDailyScore } from '@/lib/utils/scoring'

interface UseDailyEntryReturn {
  entry: DailyEntry | null
  isLoading: boolean
  error: string | null
  updateEntry: (updates: Partial<DailyEntry>) => void
  refreshEntry: () => Promise<void>
  isSaving: boolean
  lastSaved: Date | null
}

/**
 * Hook to manage daily entry state with auto-save
 * @returns Daily entry state and methods
 */
export function useDailyEntry(): UseDailyEntryReturn {
  const [entry, setEntry] = useState<DailyEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch today's entry
  const fetchEntry = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/daily/today')
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily entry')
      }

      const data = await response.json()
      setEntry(data)
    } catch (err) {
      console.error('Error fetching entry:', err)
      setError(err instanceof Error ? err.message : 'Failed to load entry')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Load entry on mount
  useEffect(() => {
    fetchEntry()
  }, [fetchEntry])

  // Update entry locally (optimistic update)
  const updateEntry = useCallback((updates: Partial<DailyEntry>) => {
    setEntry((prev) => {
      if (!prev) return prev
      
      const updated = { ...prev, ...updates }
      
      // Recalculate score
      const newScore = calculateDailyScore(updated)
      updated.daily_score = newScore
      updated.is_complete = newScore === 5
      
      return updated
    })
  }, [])

  // Save function for auto-save
  const saveEntry = useCallback(async (data: DailyEntry | null) => {
    if (!data || !data.entry_date) return

    const response = await fetch(`/api/daily/${data.entry_date}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        study_blocks: data.study_blocks,
        reading: data.reading,
        pushups: data.pushups,
        meditation: data.meditation,
        water_bottles: data.water_bottles,
        notes: data.notes,
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to save entry')
    }

    const savedEntry = await response.json()
    // Update with server response to ensure sync
    setEntry(savedEntry)
  }, [])

  // Auto-save hook
  const { isSaving, lastSaved } = useAutoSave({
    data: entry,
    onSave: saveEntry,
    delay: 500,
    enabled: !!entry,
  })

  return {
    entry,
    isLoading,
    error,
    updateEntry,
    refreshEntry: fetchEntry,
    isSaving,
    lastSaved,
  }
}
