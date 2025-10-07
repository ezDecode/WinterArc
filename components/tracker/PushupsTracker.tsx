'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { Pushups } from '@/types'
import { Check, Zap } from 'lucide-react'

interface PushupsTrackerProps {
  pushups: Pushups
  onChange: (pushups: Pushups) => void
}

export function PushupsTracker({ pushups, onChange }: PushupsTrackerProps) {
  const allSetsComplete = pushups.set1 && pushups.set2 && pushups.set3
  const completedSets = [pushups.set1, pushups.set2, pushups.set3].filter(Boolean).length
  const totalPushups =
    (pushups.set1 ? 20 : 0) +
    (pushups.set2 ? 15 : 0) +
    (pushups.set3 ? 15 : 0) +
    (pushups.extras || 0)

  const sets = [
    { key: 'set1' as const, label: 'Set 1', count: 20, checked: pushups.set1 },
    { key: 'set2' as const, label: 'Set 2', count: 15, checked: pushups.set2 },
    { key: 'set3' as const, label: 'Set 3', count: 15, checked: pushups.set3 },
  ]

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
            <span className="text-2xl">{TARGETS.PUSHUPS.icon}</span>
          </div>
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
          <div className="text-xs text-text-tertiary mt-1">
            {completedSets}/3 sets
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="h-3 bg-background rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${(completedSets / 3) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-right">
          <span className={`font-medium ${allSetsComplete ? 'text-success' : 'text-text-tertiary'}`}>
            Target: 3 sets (50 pushups)
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {sets.map((set) => (
          <div
            key={set.key}
            className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 ${
              set.checked
                ? 'bg-gradient-to-r from-orange-50/10 to-red-50/10 border-orange-400/50 shadow-md shadow-orange-500/10'
                : 'bg-background border-border hover:border-orange-400/50'
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Custom Checkbox */}
              <button
                onClick={() => onChange({ ...pushups, [set.key]: !set.checked })}
                className="relative flex-shrink-0 group/checkbox"
                aria-label={`Toggle ${set.label}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                    set.checked
                      ? 'bg-gradient-to-br from-orange-500 to-red-500 border-orange-400 shadow-lg shadow-orange-500/50'
                      : 'bg-surface border-border group-hover/checkbox:border-orange-400 group-hover/checkbox:bg-orange-500/5'
                  }`}
                >
                  {set.checked && (
                    <Check 
                      className="w-5 h-5 text-white stroke-[3] animate-in" 
                      style={{ animationDuration: '200ms' }}
                    />
                  )}
                </div>
                {set.checked && (
                  <div className="absolute inset-0 rounded-lg bg-orange-500/30 animate-ping pointer-events-none"></div>
                )}
              </button>
              <span className="text-text-primary font-medium">{set.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-400/30">
                <Zap className="w-3 h-3 text-orange-400" />
                <span className="text-xs font-medium text-orange-400">{set.count}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Extras Input */}
        <div className="flex items-center space-x-3 p-4 rounded-xl border-2 border-border bg-background">
          <Zap className="w-5 h-5 text-text-tertiary" />
          <span className="text-text-primary font-medium">Bonus:</span>
          <input
            type="number"
            value={pushups.extras || ''}
            onChange={(e) =>
              onChange({ ...pushups, extras: parseInt(e.target.value) || 0 })
            }
            placeholder="0"
            min="0"
            className="w-24 px-3 py-2 bg-surface rounded-lg border border-border text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-orange-400 transition-colors text-center font-medium"
          />
          <span className="text-text-secondary">extra pushups</span>
        </div>
      </div>

      {allSetsComplete && (
        <div className="mt-4 text-sm text-success text-center animate-in flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>All sets completed! +1 point</span>
        </div>
      )}
    </div>
  )
}
