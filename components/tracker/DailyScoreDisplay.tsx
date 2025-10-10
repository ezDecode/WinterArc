'use client'

import { memo, useEffect, useState } from 'react'
import { DAILY_MAX_SCORE, SCORE_COLORS } from '@/lib/constants/targets'
import { getRemainingTasksMotivation, getDailyCompletionCelebration, getTimeBasedMotivation } from '@/lib/utils/motivation'
import type { MotivationMessage } from '@/lib/utils/motivation'

interface DailyScoreDisplayProps {
  score: number
  isComplete: boolean
}

export const DailyScoreDisplay = memo(function DailyScoreDisplay({
  score,
  isComplete,
}: DailyScoreDisplayProps) {
  const [motivationMessage, setMotivationMessage] = useState<MotivationMessage | null>(null)
  const [showMotivation, setShowMotivation] = useState(false)
  const percentage = (score / DAILY_MAX_SCORE) * 100
  const remainingTasks = DAILY_MAX_SCORE - score

  // Update motivation message when score changes
  useEffect(() => {
    if (isComplete && score === DAILY_MAX_SCORE) {
      // Perfect day celebration!
      const celebrationMessage = getDailyCompletionCelebration()
      setMotivationMessage(celebrationMessage)
      setShowMotivation(true)
    } else if (score > 0) {
      // Show encouraging message based on remaining tasks
      const remainingMessage = getRemainingTasksMotivation(remainingTasks)
      setMotivationMessage(remainingMessage)
      setShowMotivation(true)
    } else {
      // No progress yet, show time-based motivation
      const timeMessage = getTimeBasedMotivation()
      setMotivationMessage(timeMessage)
      setShowMotivation(true)
    }

    // Auto-hide motivation message after some time (except for celebration)
    if (!isComplete) {
      const timer = setTimeout(() => {
        setShowMotivation(false)
      }, 8000)
      return () => clearTimeout(timer)
    }
  }, [score, isComplete, remainingTasks])

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

      {/* Motivation Message */}
      {showMotivation && motivationMessage && (
        <div 
          className={`mt-5 sm:mt-6 p-4 sm:p-5 rounded-xl border animate-in shadow-sm transition-all duration-300 ${
            motivationMessage.intensity === 'celebration' 
              ? 'bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-purple-400/30 shadow-lg shadow-purple-500/20' 
              : motivationMessage.intensity === 'high'
              ? 'bg-gradient-to-r from-emerald-500/10 to-green-500/10 border-emerald-400/30 shadow-md shadow-emerald-500/10'
              : 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border-blue-400/20 shadow-sm shadow-blue-500/10'
          }`}
          role="alert"
          aria-live={motivationMessage.intensity === 'celebration' ? 'assertive' : 'polite'}
        >
          <div className="flex items-center justify-center space-x-2 sm:space-x-3">
            <span 
              className={`text-xl sm:text-2xl ${
                motivationMessage.intensity === 'celebration' ? 'animate-bounce' : ''
              }`} 
              role="img" 
              aria-label="motivation"
            >
              {motivationMessage.emoji}
            </span>
            <span className={`font-semibold text-sm sm:text-base text-center ${
              motivationMessage.intensity === 'celebration' 
                ? 'text-purple-200'
                : motivationMessage.intensity === 'high'
                ? 'text-emerald-200'
                : 'text-blue-200'
            }`}>
              {motivationMessage.message}
            </span>
          </div>
          
          {/* Additional info for non-celebration messages */}
          {motivationMessage.type !== 'celebration' && remainingTasks > 0 && (
            <div className="mt-3 text-center">
              <span className="text-xs text-text-tertiary bg-background/50 px-3 py-1 rounded-full border border-border/50">
                {remainingTasks} task{remainingTasks !== 1 ? 's' : ''} remaining
              </span>
            </div>
          )}
        </div>
      )}

      {/* Complete Badge (Keep for immediate feedback) */}
      {isComplete && (
        <div 
          className="mt-3 sm:mt-4 p-3 sm:p-4 bg-success/10 border border-success/20 rounded-xl animate-in shadow-sm"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center justify-center space-x-2">
            <span className="text-lg sm:text-xl animate-bounce" role="img" aria-label="celebration">🎯</span>
            <span className="text-success font-medium text-sm sm:text-base text-center">
              All targets complete! Perfect day achieved!
            </span>
          </div>
        </div>
      )}
    </section>
  )
})
