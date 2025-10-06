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
        // Try to extract error details
        let errorMessage = 'Failed to fetch daily entry'
        try {
          const body = await response.json()
          if (body?.error) errorMessage = body.error
        } catch (_) {
          // ignore JSON parse errors
        }

        // If unauthorized, surface a clearer message
        if (response.status === 401) {
          throw new Error('Please sign in to continue')
        }

        // If profile not found, attempt to create it and retry once
        if (response.status === 404) {
          try {
            await fetch('/api/profile')
          } catch (_) {
            // ignore
          }

          const retryResponse = await fetch('/api/daily/today')
          if (!retryResponse.ok) {
            let retryMessage = errorMessage
            try {
              const retryBody = await retryResponse.json()
              if (retryBody?.error) retryMessage = retryBody.error
            } catch (_) {
              // ignore
            }
            throw new Error(retryMessage)
          }

          const retryData = await retryResponse.json()
          setEntry(retryData)
          return
        }

        throw new Error(errorMessage)
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
  const saveEntry = useCallback(async (data: DailyEntry) => {
    if (!data.entry_date) return

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
