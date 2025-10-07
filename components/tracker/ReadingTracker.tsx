'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Reading } from '@/types'
import { Check, BookOpen } from 'lucide-react'

interface ReadingTrackerProps {
  reading: Reading
  onChange: (reading: Reading) => void
}

export function ReadingTracker({ reading, onChange }: ReadingTrackerProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-green-500/30">
            <span className="text-2xl">{TARGETS.READING.icon}</span>
          </div>
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
        {/* Custom Checkbox */}
        <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
          reading.checked
            ? 'bg-gradient-to-r from-green-50/10 to-emerald-50/10 border-green-400/50 shadow-md shadow-green-500/10'
            : 'bg-background border-border hover:border-green-400/50'
        }`}>
          <button
            onClick={() => onChange({ ...reading, checked: !reading.checked })}
            className="relative flex-shrink-0 group/checkbox"
            aria-label="Toggle reading completion"
          >
            <div
              className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                reading.checked
                  ? 'bg-gradient-to-br from-green-500 to-emerald-500 border-green-400 shadow-lg shadow-green-500/50'
                  : 'bg-surface border-border group-hover/checkbox:border-green-400 group-hover/checkbox:bg-green-500/5'
              }`}
            >
              {reading.checked && (
                <Check 
                  className="w-5 h-5 text-white stroke-[3] animate-in" 
                  style={{ animationDuration: '200ms' }}
                />
              )}
            </div>
            {reading.checked && (
              <div className="absolute inset-0 rounded-lg bg-green-500/30 animate-ping pointer-events-none"></div>
            )}
          </button>
          <span className="text-text-primary font-medium">Completed reading</span>
        </div>

        <div className="relative">
          <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-tertiary" />
          <input
            type="text"
            value={reading.bookName}
            onChange={(e) => onChange({ ...reading, bookName: e.target.value })}
            placeholder="Book name (e.g., Atomic Habits)"
            className="w-full pl-11 pr-4 py-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-green-400 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2">
          <input
            type="number"
            value={reading.pages || ''}
            onChange={(e) =>
              onChange({ ...reading, pages: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            className="w-28 px-4 py-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-green-400 transition-colors text-center font-medium"
          />
          <span className="text-text-secondary">pages read</span>
        </div>
      </div>

      {reading.checked && (
        <div className="mt-4 text-sm text-success text-center animate-in flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Reading completed! +1 point</span>
        </div>
      )}
    </div>
  )
}
