'use client'

import { useState } from 'react'
import type { Notes } from '@/types'

interface NotesSectionProps {
  notes: Notes
  onChange: (notes: Notes) => void
}

export function NotesSection({ notes, onChange }: NotesSectionProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left"
      >
        <div className="flex items-center space-x-3">
          <span className="text-2xl">📝</span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">Daily Notes</h3>
            <p className="text-sm text-text-secondary">
              Optional reflections and thoughts
            </p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {isExpanded && (
        <div className="mt-4 space-y-4 animate-in">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Morning Notes
            </label>
            <textarea
              value={notes.morning || ''}
              onChange={(e) =>
                onChange({ ...notes, morning: e.target.value })
              }
              placeholder="How are you feeling this morning? What are your intentions for today?"
              rows={3}
              className="w-full p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Evening Notes
            </label>
            <textarea
              value={notes.evening || ''}
              onChange={(e) =>
                onChange({ ...notes, evening: e.target.value })
              }
              placeholder="How did the day go? Any wins or challenges?"
              rows={3}
              className="w-full p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              General Notes
            </label>
            <textarea
              value={notes.general || ''}
              onChange={(e) =>
                onChange({ ...notes, general: e.target.value })
              }
              placeholder="Any other thoughts or observations..."
              rows={3}
              className="w-full p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors resize-none"
            />
          </div>
        </div>
      )}
    </div>
  )
}
