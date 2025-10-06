'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Reading } from '@/types'

interface ReadingTrackerProps {
  reading: Reading
  onChange: (reading: Reading) => void
}

export function ReadingTracker({ reading, onChange }: ReadingTrackerProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{TARGETS.READING.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {TARGETS.READING.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {TARGETS.READING.description}
            </p>
          </div>
        </div>
        <div
          className={`text-2xl font-bold ${
            reading.checked ? 'text-success' : 'text-text-primary'
          }`}
        >
          {reading.checked ? '✓' : '○'}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border">
          <input
            type="checkbox"
            checked={reading.checked}
            onChange={(e) =>
              onChange({ ...reading, checked: e.target.checked })
            }
            className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-text-primary">Completed reading</span>
        </div>

        <input
          type="text"
          value={reading.bookName}
          onChange={(e) => onChange({ ...reading, bookName: e.target.value })}
          placeholder="Book name"
          className="w-full p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors"
        />

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={reading.pages || ''}
            onChange={(e) =>
              onChange({ ...reading, pages: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            className="w-24 p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors"
          />
          <span className="text-text-secondary">pages read</span>
        </div>
      </div>

      {reading.checked && (
        <div className="mt-4 text-sm text-success text-center animate-in">
          ✓ Reading completed! +1 point
        </div>
      )}
    </div>
  )
}
