'use client'

import { useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface KeyboardShortcut {
  key: string
  ctrl?: boolean
  alt?: boolean
  shift?: boolean
  meta?: boolean
  description: string
  action: () => void
  scope?: 'global' | 'today' | 'dashboard'
}

interface UseKeyboardShortcutsOptions {
  shortcuts: KeyboardShortcut[]
  enabled?: boolean
}

/**
 * Hook for handling keyboard shortcuts
 * Provides a consistent way to implement keyboard navigation
 * 
 * @param options - Configuration for keyboard shortcuts
 */
export function useKeyboardShortcuts({ shortcuts, enabled = true }: UseKeyboardShortcutsOptions) {
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement
      const isInputField =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable

      // Allow certain shortcuts even in input fields (like Cmd+S)
      const allowInInput = (event.metaKey || event.ctrlKey) && 
        ['s', 'k'].includes(event.key.toLowerCase())

      if (isInputField && !allowInInput) return

      // Find matching shortcut
      const matchedShortcut = shortcuts.find((shortcut) => {
        const keyMatches = shortcut.key.toLowerCase() === event.key.toLowerCase()
        const ctrlMatches = !shortcut.ctrl || event.ctrlKey
        const altMatches = !shortcut.alt || event.altKey
        const shiftMatches = !shortcut.shift || event.shiftKey
        const metaMatches = !shortcut.meta || event.metaKey

        return keyMatches && ctrlMatches && altMatches && shiftMatches && metaMatches
      })

      if (matchedShortcut) {
        event.preventDefault()
        matchedShortcut.action()
      }
    },
    [shortcuts, enabled]
  )

  useEffect(() => {
    if (!enabled) return

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown, enabled])
}

/**
 * Pre-configured keyboard shortcuts for the Today page
 */
export function useTodayShortcuts(
  onSave?: () => void,
  onToggleHelp?: () => void,
  trackerToggles?: {
    [key: string]: () => void
  }
) {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Help modal
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => onToggleHelp?.(),
    },
    // Save
    {
      key: 's',
      meta: true,
      description: 'Save changes',
      action: () => {
        onSave?.()
      },
    },
    {
      key: 's',
      ctrl: true,
      description: 'Save changes',
      action: () => {
        onSave?.()
      },
    },
    // Navigation
    {
      key: 'k',
      meta: true,
      description: 'Quick navigation',
      action: () => {
        // Could trigger a command palette in the future
        onToggleHelp?.()
      },
    },
    {
      key: 'k',
      ctrl: true,
      description: 'Quick navigation',
      action: () => {
        onToggleHelp?.()
      },
    },
    // Page navigation
    {
      key: '1',
      ctrl: true,
      description: 'Go to Today',
      action: () => router.push('/today'),
    },
    {
      key: '2',
      ctrl: true,
      description: 'Go to Scorecard',
      action: () => router.push('/scorecard'),
    },
    {
      key: '3',
      ctrl: true,
      description: 'Go to Progress',
      action: () => router.push('/progress'),
    },
    {
      key: '4',
      ctrl: true,
      description: 'Go to Review',
      action: () => router.push('/review'),
    },
  ]

  // Add tracker toggles if provided
  if (trackerToggles) {
    Object.entries(trackerToggles).forEach(([key, action]) => {
      shortcuts.push({
        key,
        description: `Toggle tracker ${key}`,
        action,
      })
    })
  }

  return shortcuts
}

/**
 * Pre-configured keyboard shortcuts for dashboard pages
 */
export function useDashboardShortcuts() {
  const router = useRouter()

  const shortcuts: KeyboardShortcut[] = [
    // Navigation
    {
      key: '1',
      ctrl: true,
      description: 'Go to Today',
      action: () => router.push('/today'),
    },
    {
      key: '2',
      ctrl: true,
      description: 'Go to Scorecard',
      action: () => router.push('/scorecard'),
    },
    {
      key: '3',
      ctrl: true,
      description: 'Go to Progress',
      action: () => router.push('/progress'),
    },
    {
      key: '4',
      ctrl: true,
      description: 'Go to Review',
      action: () => router.push('/review'),
    },
    // Help
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: () => {
        // Could open help modal
        console.log('Show shortcuts help')
      },
    },
  ]

  return shortcuts
}