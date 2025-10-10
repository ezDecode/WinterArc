'use client'

import { memo, useEffect, useRef } from 'react'
import { DAILY_MAX_SCORE, SCORE_COLORS } from '@/lib/constants/targets'
import { useConfetti } from '@/hooks/useConfetti'

interface DailyScoreDisplayProps {
  score: number
  isComplete: boolean
}

export const DailyScoreDisplay = memo(function DailyScoreDisplay({
  score,
  isComplete,
}: DailyScoreDisplayProps) {
  const percentage = (score / DAILY_MAX_SCORE) * 100
  const { triggerConfetti } = useConfetti()
  const hasTriggeredRef = useRef(false)

  // Trigger confetti on perfect day completion
  useEffect(() => {
    if (isComplete && score === DAILY_MAX_SCORE && !hasTriggeredRef.current) {
      // Small delay to let the UI update first
      const timer = setTimeout(() => {
        triggerConfetti()
        hasTriggeredRef.current = true
      }, 300)
      
      return () => clearTimeout(timer)
    }
    
    // Reset flag when not complete
    if (!isComplete || score !== DAILY_MAX_SCORE) {
      hasTriggeredRef.current = false
    }
  }, [isComplete, score, triggerConfetti])

  const getScoreColor = () => {
    if (score === 5) return SCORE_COLORS.PERFECT
    if (score >= 3) return SCORE_COLORS.GOOD
    return SCORE_COLORS.LOW
  }

  return (
    <section 
      className="bg-surface border border-border rounded-xl p-5 sm:p-6 lg:p-8 animate-in hover:border-border/80 transition-all duration-300 shadow-sm hover:shadow-md" 
      aria-labelledby="daily-score-heading"
      role="region"
    >
      <h3 
        id="daily-score-heading"
        className="text-sm font-medium text-text-secondary mb-5 sm:mb-6 flex items-center gap-2"
      >
        <span className="text-lg">📊</span>
        Daily Score
      </h3>

      {/* Large Score Display */}
      <div className="flex items-center justify-center mb-4 sm:mb-6" role="img" aria-label={`Current score: ${score} out of ${DAILY_MAX_SCORE} points`}>
        <div
          className="text-4xl sm:text-5xl lg:text-6xl font-bold transition-all duration-300"
          style={{ color: getScoreColor() }}
          aria-hidden="true"
        >
          {score}
        </div>
        <div className="text-2xl sm:text-3xl text-text-tertiary ml-2" aria-hidden="true">
          /{DAILY_MAX_SCORE}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5 sm:mb-7" role="progressbar" aria-valuenow={score} aria-valuemin={0} aria-valuemax={DAILY_MAX_SCORE} aria-label={`Progress: ${score} out of ${DAILY_MAX_SCORE} points completed`}>
        <div className="flex items-center justify-between text-xs text-text-tertiary mb-2">
          <span>Progress</span>
          <span>{Math.round(percentage)}%</span>
        </div>
        <div className="h-3 bg-background rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full transition-all duration-500 ease-out relative"
            style={{
              width: `${percentage}%`,
              backgroundColor: getScoreColor(),
            }}
          >
            {percentage > 0 && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
            )}
          </div>
        </div>
      </div>

      {/* Target Breakdown */}
      <div className="space-y-3 sm:space-y-3.5" role="list" aria-label="Score breakdown by category">
        <div className="text-xs font-medium text-text-tertiary mb-3 sm:mb-4 uppercase tracking-wide">Breakdown</div>
        <div className="flex justify-between text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors" role="listitem">
          <span className="flex items-center gap-2">
            <span className="text-purple-400">📚</span>
            Study
          </span>
          <span className="font-medium">1 pt</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors" role="listitem">
          <span className="flex items-center gap-2">
            <span className="text-blue-400">📖</span>
            Reading
          </span>
          <span className="font-medium">1 pt</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors" role="listitem">
          <span className="flex items-center gap-2">
            <span className="text-orange-400">💪</span>
            Pushups
          </span>
          <span className="font-medium">1 pt</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors" role="listitem">
          <span className="flex items-center gap-2">
            <span className="text-green-400">🧘</span>
            Meditation
          </span>
          <span className="font-medium">1 pt</span>
        </div>
        <div className="flex justify-between text-xs sm:text-sm py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg bg-background/50 hover:bg-background/80 transition-colors" role="listitem">
          <span className="flex items-center gap-2">
            <span className="text-cyan-400">💧</span>
            Water
          </span>
          <span className="font-medium">1 pt</span>
        </div>
      </div>

      {/* Complete Badge */}
      {isComplete && (
        <div 
          className="mt-5 sm:mt-7 p-4 sm:p-5 bg-success/10 border border-success/20 rounded-xl animate-in shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-xl sm:text-2xl animate-bounce" role="img" aria-label="celebration">🎉</span>
            <span className="text-success font-semibold text-sm sm:text-base text-center">
              Perfect Day! All 5 targets completed!
            </span>
          </div>
        </div>
      )}
    </section>
  )
})
