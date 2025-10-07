import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useDebounce } from './useDebounce'

interface UseAutoSaveOptions<T> {
  data: T
  onSave: (data: T) => Promise<void>
  delay?: number
  enabled?: boolean
  showToast?: boolean
}

interface UseAutoSaveReturn {
  isSaving: boolean
  lastSaved: Date | null
  error: string | null
}

/**
 * Auto-save hook that automatically saves data after a debounce delay
 * @param options - Configuration options
 * @returns Save state information
 */
export function useAutoSave<T>({
  data,
  onSave,
  delay = 500,
  enabled = true,
  showToast = false,
}: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [error, setError] = useState<string | null>(null)
  const isFirstRender = useRef(true)
  
  // Debounce the data changes
  const debouncedData = useDebounce(data, delay)

  useEffect(() => {
    // Skip saving on first render
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    // Skip if auto-save is disabled
    if (!enabled) {
      return
    }

    const saveData = async () => {
      try {
        setIsSaving(true)
        setError(null)
        await onSave(debouncedData)
        setLastSaved(new Date())
        
        // Show success toast if enabled
        if (showToast) {
          toast.success('Changes saved successfully', {
            duration: 2000,
          })
        }
      } catch (err) {
        console.error('Auto-save error:', err)
        const errorMessage = err instanceof Error ? err.message : 'Failed to save'
        setError(errorMessage)
        
        // Always show error toast
        toast.error(errorMessage, {
          duration: 4000,
        })
      } finally {
        setIsSaving(false)
      }
    }

    saveData()
  }, [debouncedData, enabled, onSave, showToast])

  return {
    isSaving,
    lastSaved,
    error,
  }
}
