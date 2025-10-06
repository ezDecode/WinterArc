'use client'

import { TARGETS, WATER_BOTTLES_COUNT } from '@/lib/constants/targets'

interface WaterBottlesTrackerProps {
  bottles: boolean[]
  onChange: (bottles: boolean[]) => void
}

export function WaterBottlesTracker({
  bottles,
  onChange,
}: WaterBottlesTrackerProps) {
  const handleBottleToggle = (index: number) => {
    const newBottles = [...bottles]
    newBottles[index] = !newBottles[index]
    onChange(newBottles)
  }

  const filledCount = bottles.filter((b) => b).length
  const allFilled = filledCount === WATER_BOTTLES_COUNT

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{TARGETS.WATER.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {TARGETS.WATER.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {TARGETS.WATER.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Progress</div>
          <div
            className={`text-2xl font-bold ${
              allFilled ? 'text-success' : 'text-text-primary'
            }`}
          >
            {filledCount}/{WATER_BOTTLES_COUNT}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-2 bg-background rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300"
            style={{ width: `${(filledCount / WATER_BOTTLES_COUNT) * 100}%` }}
          />
        </div>
        <div className="mt-2 text-xs text-text-tertiary text-center">
          {((filledCount / WATER_BOTTLES_COUNT) * 4).toFixed(1)}L / 4L
        </div>
      </div>

      {/* Bottle Grid */}
      <div className="grid grid-cols-4 gap-3">
        {bottles.map((filled, index) => (
          <button
            key={index}
            onClick={() => handleBottleToggle(index)}
            className={`aspect-square rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
              filled
                ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50'
                : 'bg-background border-border hover:border-text-tertiary'
            }`}
            aria-label={`Bottle ${index + 1}`}
          >
            <div className="flex items-center justify-center h-full">
              <svg
                className={`w-8 h-8 transition-colors ${
                  filled ? 'text-white' : 'text-text-tertiary'
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M9 2h6v2h-6V2zm6 2v2h2v14a2 2 0 01-2 2H9a2 2 0 01-2-2V6h2V4h6z" />
                {filled && (
                  <path
                    d="M8 8h8v10H8V8z"
                    fill="currentColor"
                    opacity="0.6"
                  />
                )}
              </svg>
            </div>
          </button>
        ))}
      </div>

      {allFilled && (
        <div className="mt-4 text-sm text-success text-center animate-in">
          ✓ All bottles completed! +1 point
        </div>
      )}
    </div>
  )
}
