'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Meditation } from '@/types'

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
          <span className="text-2xl">{TARGETS.MEDITATION.icon}</span>
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
        <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border">
          <input
            type="checkbox"
            checked={meditation.checked}
            onChange={(e) =>
              onChange({ ...meditation, checked: e.target.checked })
            }
            className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-text-primary">Completed meditation</span>
        </div>

        <input
          type="text"
          value={meditation.method}
          onChange={(e) => onChange({ ...meditation, method: e.target.value })}
          placeholder="Method (e.g., Mindfulness, Breathing)"
          className="w-full p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors"
        />

        <div className="flex items-center space-x-2">
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
            className="w-24 p-3 bg-background rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors"
          />
          <span className="text-text-secondary">minutes</span>
        </div>
      </div>

      {meditation.checked && (
        <div className="mt-4 text-sm text-success text-center animate-in">
          ✓ Meditation completed! +1 point
        </div>
      )}
    </div>
  )
}

