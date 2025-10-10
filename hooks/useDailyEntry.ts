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
 * @param date - Optional date string (YYYY-MM-DD). If not provided, uses today's date
 * @returns Daily entry state and methods
 */
export function useDailyEntry(date?: string): UseDailyEntryReturn {
  const [entry, setEntry] = useState<DailyEntry | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch entry for specified date or today
  const fetchEntry = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Use specific date API endpoint if date is provided, otherwise use /today
      const apiUrl = date ? `/api/daily/${date}` : '/api/daily/today'
      const response = await fetch(apiUrl)
      
      if (!response.ok) {
        // Try to get error details from response
        let errorMessage = 'Failed to fetch daily entry'
        try {
          const errorData = await response.json()
          
          // Handle nested error object format from errorHandler
          if (errorData.error && typeof errorData.error === 'object') {
            errorMessage = errorData.error.message || errorData.error.details || errorMessage
            
            // Add error code if available
            if (errorData.error.code) {
              errorMessage = `${errorData.error.code}: ${errorMessage}`
            }
          } 
          // Handle direct string or simple object formats
          else if (typeof errorData === 'string') {
            errorMessage = errorData
          } else if (errorData.error && typeof errorData.error === 'string') {
            errorMessage = errorData.error
          } else if (errorData.message) {
            errorMessage = errorData.message
          } else if (errorData.details) {
            errorMessage = errorData.details
          }
        } catch (parseError) {
          // If JSON parsing fails, use status text
          console.error('Failed to parse error response:', parseError)
          errorMessage = `${errorMessage} (${response.status}: ${response.statusText})`
        }
        throw new Error(errorMessage)
      }

      const data = await response.json()
      setEntry(data)
    } catch (err) {
      console.error('Error fetching entry:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to load entry'
      setError(errorMessage)
      
      // Log additional debugging info
      if (err instanceof Error && err.stack) {
        console.error('Stack trace:', err.stack)
      }
    } finally {
      setIsLoading(false)
    }
  }, [date])

  // Load entry on mount and when date changes
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

    // Don't update state with server response to avoid infinite loop
    // We already have the correct data from optimistic updates
    await response.json()
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
