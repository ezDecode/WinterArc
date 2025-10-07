'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Meditation } from '@/types'
import { Check, Timer } from 'lucide-react'

interface MeditationTrackerProps {
  meditation: Meditation
  onChange: (meditation: Meditation) => void
}

export function MeditationTracker({
  meditation,
  onChange,
}: MeditationTrackerProps) {
  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-2xl">{TARGETS.MEDITATION.icon}</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {TARGETS.MEDITATION.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {TARGETS.MEDITATION.description}
            </p>
          </div>
        </div>
        <div
          className={`text-2xl font-bold ${
            meditation.checked ? 'text-success' : 'text-text-primary'
          }`}
        >
          {meditation.checked ? '✓' : '○'}
        </div>
      </div>

      <div className="space-y-3">
        {/* Custom Checkbox */}
        <div className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all duration-200 ${
          meditation.checked
            ? 'bg-gradient-to-r from-indigo-50/10 to-blue-50/10 border-indigo-400/50 shadow-md shadow-indigo-500/10'
            : 'bg-background border-border hover:border-indigo-400/50'
        }`}>
          <button
            onClick={() => onChange({ ...meditation, checked: !meditation.checked })}
            className="relative flex-shrink-0 group/checkbox"
            aria-label="Toggle meditation completion"
          >
            <div
              className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                meditation.checked
                  ? 'bg-gradient-to-br from-indigo-500 to-blue-500 border-indigo-400 shadow-lg shadow-indigo-500/50'
                  : 'bg-surface border-border group-hover/checkbox:border-indigo-400 group-hover/checkbox:bg-indigo-500/5'
              }`}
            >
              {meditation.checked && (
                <Check 
                  className="w-5 h-5 text-white stroke-[3] animate-in" 
                  style={{ animationDuration: '200ms' }}
                />
              )}
            </div>
            {meditation.checked && (
              <div className="absolute inset-0 rounded-lg bg-indigo-500/30 animate-ping pointer-events-none"></div>
            )}
          </button>
          <span className="text-text-primary font-medium">Completed meditation</span>
        </div>

        <input
          type="text"
          value={meditation.method}
          onChange={(e) => onChange({ ...meditation, method: e.target.value })}
          placeholder="Method (e.g., Mindfulness, Breathing, Guided)"
          className="w-full px-4 py-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-indigo-400 transition-colors"
        />

        <div className="flex items-center space-x-2">
          <div className="relative">
            <Timer className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-tertiary" />
            <input
              type="number"
              value={meditation.duration || ''}
              onChange={(e) =>
                onChange({
                  ...meditation,
                  duration: parseInt(e.target.value) || 0,
                })
              }
              placeholder="0"
              min="0"
              max="120"
              className="w-28 pl-10 pr-4 py-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-indigo-400 transition-colors text-center font-medium"
            />
          </div>
          <span className="text-text-secondary">minutes</span>
        </div>
      </div>

      {meditation.checked && (
        <div className="mt-4 text-sm text-success text-center animate-in flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Meditation completed! +1 point</span>
        </div>
      )}
    </div>
  )
}
