'use client'

import { useEffect } from 'react'
import type { KeyboardShortcut } from '@/hooks/useKeyboardShortcuts'

interface KeyboardShortcutsModalProps {
  isOpen: boolean
  onClose: () => void
  shortcuts: KeyboardShortcut[]
}

export function KeyboardShortcutsModal({ isOpen, onClose, shortcuts }: KeyboardShortcutsModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const formatShortcut = (shortcut: KeyboardShortcut): string => {
    const keys: string[] = []
    if (shortcut.ctrl) keys.push('Ctrl')
    if (shortcut.meta) keys.push('Cmd')
    if (shortcut.alt) keys.push('Alt')
    if (shortcut.shift && shortcut.key !== '?') keys.push('Shift')
    keys.push(shortcut.key.toUpperCase())
    return keys.join(' + ')
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[80vh] overflow-auto bg-surface-dark border border-border-subtle rounded-lg shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-surface-dark border-b border-border-subtle px-6 py-4">
          <div className="flex items-center justify-between">
            <h2 id="shortcuts-title" className="text-2xl font-bold text-text-primary">
              Keyboard Shortcuts
            </h2>
            <button
              onClick={onClose}
              className="text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-3">
            {shortcuts.map((shortcut, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-2 px-3 rounded-md hover:bg-surface-light/10 transition-colors"
              >
                <span className="text-text-secondary">{shortcut.description}</span>
                <kbd className="px-3 py-1 text-sm font-mono bg-surface-light border border-border-subtle rounded text-text-primary shadow-sm">
                  {formatShortcut(shortcut)}
                </kbd>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-6 border-t border-border-subtle">
            <p className="text-sm text-text-secondary text-center">
              Press <kbd className="px-2 py-1 text-xs font-mono bg-surface-light border border-border-subtle rounded">Esc</kbd> or <kbd className="px-2 py-1 text-xs font-mono bg-surface-light border border-border-subtle rounded">?</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}