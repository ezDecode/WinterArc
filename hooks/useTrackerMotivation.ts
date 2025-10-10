import { useCallback } from 'react'
import { getTaskCompletionMessage, getTaskProgressMessage } from '@/lib/utils/motivation'
import { useMotivationNotification } from '@/components/ui/MotivationNotification'

/**
 * Hook for adding motivation to tracker components
 */
export function useTrackerMotivation() {
  const { currentMessage, showMessage, clearMessage } = useMotivationNotification()

  const showCompletionMessage = useCallback((taskType: string) => {
    const message = getTaskCompletionMessage(taskType)
    showMessage(message)
  }, [showMessage])

  const showProgressMessage = useCallback((taskType: string) => {
    const message = getTaskProgressMessage(taskType)
    showMessage(message)
  }, [showMessage])

  return {
    currentMessage,
    showCompletionMessage,
    showProgressMessage,
    clearMessage
  }
}