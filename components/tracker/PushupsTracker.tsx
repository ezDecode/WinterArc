'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Pushups } from '@/types'

interface PushupsTrackerProps {
  pushups: Pushups
  onChange: (pushups: Pushups) => void
}

export function PushupsTracker({ pushups, onChange }: PushupsTrackerProps) {
  const allSetsComplete = pushups.set1 && pushups.set2 && pushups.set3
  const totalPushups =
    (pushups.set1 ? 20 : 0) +
    (pushups.set2 ? 15 : 0) +
    (pushups.set3 ? 15 : 0) +
    (pushups.extras || 0)

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{TARGETS.PUSHUPS.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {TARGETS.PUSHUPS.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {TARGETS.PUSHUPS.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Total</div>
          <div
            className={`text-2xl font-bold ${
              allSetsComplete ? 'text-success' : 'text-text-primary'
            }`}
          >
            {totalPushups}
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border hover:border-text-tertiary transition-colors">
          <input
            type="checkbox"
            checked={pushups.set1}
            onChange={(e) => onChange({ ...pushups, set1: e.target.checked })}
            className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-text-primary">Set 1</span>
          <span className="text-text-secondary ml-auto">20 pushups</span>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border hover:border-text-tertiary transition-colors">
          <input
            type="checkbox"
            checked={pushups.set2}
            onChange={(e) => onChange({ ...pushups, set2: e.target.checked })}
            className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-text-primary">Set 2</span>
          <span className="text-text-secondary ml-auto">15 pushups</span>
        </div>

        <div className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border hover:border-text-tertiary transition-colors">
          <input
            type="checkbox"
            checked={pushups.set3}
            onChange={(e) => onChange({ ...pushups, set3: e.target.checked })}
            className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
          />
          <span className="text-text-primary">Set 3</span>
          <span className="text-text-secondary ml-auto">15 pushups</span>
        </div>

        <div className="flex items-center space-x-2 p-3 bg-background rounded-lg border border-border">
          <span className="text-text-primary">Extras:</span>
          <input
            type="number"
            value={pushups.extras || ''}
            onChange={(e) =>
              onChange({ ...pushups, extras: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            className="w-20 px-2 py-1 bg-surface rounded border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-text-tertiary transition-colors"
          />
          <span className="text-text-secondary">additional pushups</span>
        </div>
      </div>

      {allSetsComplete && (
        <div className="mt-4 text-sm text-success text-center animate-in">
          ✓ All sets completed! +1 point
        </div>
      )}
    </div>
  )
}
