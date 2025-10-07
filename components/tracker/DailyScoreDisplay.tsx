'use client'

import { memo } from 'react'
import { DAILY_MAX_SCORE, SCORE_COLORS } from '@/lib/constants/targets'

interface DailyScoreDisplayProps {
  score: number
  isComplete: boolean
}

export const DailyScoreDisplay = memo(function DailyScoreDisplay({
  score,
  isComplete,
}: DailyScoreDisplayProps) {
  const percentage = (score / DAILY_MAX_SCORE) * 100

  const getScoreColor = () => {
    if (score === 5) return SCORE_COLORS.PERFECT
    if (score >= 3) return SCORE_COLORS.GOOD
    return SCORE_COLORS.LOW
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <h3 className="text-sm font-medium text-text-secondary mb-4">
        Daily Score
      </h3>

      {/* Large Score Display */}
      <div className="flex items-center justify-center mb-6">
        <div
          className="text-6xl font-bold"
          style={{ color: getScoreColor() }}
        >
          {score}
        </div>
        <div className="text-3xl text-text-tertiary ml-2">
          /{DAILY_MAX_SCORE}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <div className="h-3 bg-background rounded-full overflow-hidden">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: getScoreColor(),
            }}
          />
        </div>
      </div>

      {/* Target Breakdown */}
      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-text-secondary">
          <span>Study</span>
          <span>1 pt</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Reading</span>
          <span>1 pt</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Pushups</span>
          <span>1 pt</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Meditation</span>
          <span>1 pt</span>
        </div>
        <div className="flex justify-between text-text-secondary">
          <span>Water</span>
          <span>1 pt</span>
        </div>
      </div>

      {/* Complete Badge */}
      {isComplete && (
        <div className="mt-6 p-4 bg-success/10 border border-success/20 rounded-lg animate-in">
          <div className="flex items-center justify-center space-x-2">
            <span className="text-2xl">🎉</span>
            <span className="text-success font-semibold">
              Perfect Day! All 5 targets completed!
            </span>
          </div>
        </div>
      )}
    </div>
  )
})
