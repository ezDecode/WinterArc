'use client'

import { useEffect, useState } from 'react'

interface StreakCounterProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCounter({ currentStreak, longestStreak }: StreakCounterProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const getStreakColor = (streak: number) => {
    if (streak === 0) return 'text-text-tertiary'
    if (streak < 7) return 'text-warning'
    return 'text-success'
  }

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '○'
    if (streak < 3) return '🔥'
    if (streak < 7) return '🔥🔥'
    if (streak < 14) return '🔥🔥🔥'
    return '🔥🔥🔥🔥'
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Current Streak */}
      <div className="bg-surface border border-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-6xl opacity-5 p-4">
          {getStreakEmoji(currentStreak)}
        </div>
        <div className="relative z-10">
          <div className="text-sm text-text-secondary font-medium mb-2">
            Current Streak
          </div>
          <div className={`text-5xl font-bold transition-all duration-300 ${getStreakColor(currentStreak)}`}>
            {mounted ? (
              <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700">
                {currentStreak}
              </span>
            ) : (
              <span>0</span>
            )}
          </div>
          <div className="text-sm text-text-tertiary mt-2">
            {currentStreak === 0 ? 'Start your streak today!' : 
             currentStreak === 1 ? 'day of perfection' : 
             'consecutive perfect days'}
          </div>
        </div>
      </div>

      {/* Longest Streak */}
      <div className="bg-surface border border-border rounded-lg p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 text-6xl opacity-5 p-4">
          {getStreakEmoji(longestStreak)}
        </div>
        <div className="relative z-10">
          <div className="text-sm text-text-secondary font-medium mb-2">
            Longest Streak
          </div>
          <div className={`text-5xl font-bold transition-all duration-300 ${getStreakColor(longestStreak)}`}>
            {mounted ? (
              <span className="inline-block animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150">
                {longestStreak}
              </span>
            ) : (
              <span>0</span>
            )}
          </div>
          <div className="text-sm text-text-tertiary mt-2">
            {longestStreak === 0 ? 'No perfect days yet' :
             longestStreak === 1 ? 'personal best' :
             'personal best'}
          </div>
        </div>
      </div>
    </div>
  )
}
