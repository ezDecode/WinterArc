'use client'

import { TARGETS, WATER_BOTTLES_COUNT } from '@/lib/constants/targets'
import { Plus, Trash2 } from 'lucide-react'

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

  const handleAddBottle = () => {
    onChange([...bottles, false])
  }

  const handleRemoveBottle = (index: number) => {
    if (bottles.length <= 1) return // Keep at least 1 bottle
    const newBottles = bottles.filter((_, i) => i !== index)
    onChange(newBottles)
  }

  const filledCount = bottles.filter((b) => b).length
  const targetCount = Math.max(WATER_BOTTLES_COUNT, bottles.length)
  const isTargetMet = filledCount >= WATER_BOTTLES_COUNT

  return (
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-xl sm:text-2xl">{TARGETS.WATER.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">
              {TARGETS.WATER.name}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              {TARGETS.WATER.description}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-sm text-text-secondary">Progress</div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              isTargetMet ? 'text-success' : 'text-text-primary'
            }`}
          >
            {filledCount}/{targetCount}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="h-3 bg-background rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${(filledCount / targetCount) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between text-xs">
          <span className="text-text-tertiary">
            {((filledCount / 2) * 0.5).toFixed(1)}L consumed
          </span>
          <span className={`font-medium ${isTargetMet ? 'text-success' : 'text-text-tertiary'}`}>
            Target: {WATER_BOTTLES_COUNT} bottles (4L)
          </span>
        </div>
      </div>

      {/* Bottle Grid */}
      <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
        {bottles.map((filled, index) => (
          <div key={index} className="relative group">
            <button
              onClick={() => handleBottleToggle(index)}
              className={`w-full aspect-square rounded-xl border-2 transition-all duration-200 min-h-[44px] ${
                filled
                  ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400 shadow-lg shadow-blue-500/50'
                  : 'bg-background border-border hover:border-blue-400 hover:bg-blue-50/5'
              }`}
              aria-label={`Bottle ${index + 1}`}
            >
              <div className="flex items-center justify-center h-full">
                <svg
                  className={`w-6 h-6 sm:w-7 sm:h-7 transition-colors ${
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
                      opacity="0.7"
                    />
                  )}
                </svg>
              </div>
            </button>
            {bottles.length > 1 && (
              <button
                onClick={() => handleRemoveBottle(index)}
                className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 flex items-center justify-center shadow-lg min-h-[44px] min-w-[44px]"
                aria-label="Remove bottle"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        ))}
        
        {/* Add Button */}
        <button
          onClick={handleAddBottle}
          className="w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-blue-400 bg-background hover:bg-blue-50/5 transition-all duration-200 flex items-center justify-center group min-h-[44px]"
          aria-label="Add bottle"
        >
          <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-text-tertiary group-hover:text-blue-400 transition-colors" />
        </button>
      </div>

      {isTargetMet && (
        <div className="mt-4 text-sm text-success text-center animate-in flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Hydration goal achieved! +1 point</span>
        </div>
      )}
    </div>
  )
}
