'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SkeletonScorecard } from '@/components/ui/Skeleton'
import type { ScorecardData } from '@/types'

export default function ScorecardPage() {
  const [scorecard, setScorecard] = useState<ScorecardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchScorecard() {
      try {
        const response = await fetch('/api/stats/scorecard')
        if (!response.ok) {
          throw new Error('Failed to fetch scorecard')
        }
        const data = await response.json()
        setScorecard(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load scorecard')
      } finally {
        setLoading(false)
      }
    }

    fetchScorecard()
  }, [])

  // Color coding based on PRD thresholds
  const getScoreColor = (score: number, isFuture: boolean) => {
    if (isFuture) return 'bg-[#262626] border-[#262626]'
    if (score === 5) return 'bg-[#10b981] border-[#10b981] cursor-pointer hover:opacity-80'
    if (score >= 3) return 'bg-[#f59e0b] border-[#f59e0b] cursor-pointer hover:opacity-80'
    if (score > 0) return 'bg-[#ef4444] border-[#ef4444] cursor-pointer hover:opacity-80'
    return 'bg-background border-border cursor-pointer hover:bg-surface'
  }

  const getScoreTextColor = (score: number, isFuture: boolean) => {
    if (isFuture) return 'text-text-tertiary'
    if (score === 0) return 'text-text-tertiary'
    return 'text-white font-semibold'
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">13-Week Scorecard</h1>
          <p className="text-text-secondary mt-1">
            Visual overview of your entire 90-day journey
          </p>
        </div>
        <SkeletonScorecard />
      </div>
    )
  }

  if (error || !scorecard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">13-Week Scorecard</h1>
          <p className="text-text-secondary mt-1">
            Visual overview of your entire 90-day journey
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-8">
          <p className="text-error text-center">{error || 'Failed to load scorecard'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">13-Week Scorecard</h1>
        <p className="text-text-secondary mt-1">
          Visual overview of your entire 90-day journey
        </p>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 items-center justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#10b981] rounded"></div>
          <span className="text-text-secondary">Perfect (5/5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#f59e0b] rounded"></div>
          <span className="text-text-secondary">Good (3-4/5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#ef4444] rounded"></div>
          <span className="text-text-secondary">Needs Work (1-2/5)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-background border border-border rounded"></div>
          <span className="text-text-secondary">Not Started</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-[#262626] rounded"></div>
          <span className="text-text-secondary">Future</span>
        </div>
      </div>

      {/* Scorecard Grid */}
      <div className="bg-surface border border-border rounded-lg p-4 md:p-6 lg:p-8 overflow-x-auto">
        <div className="min-w-[640px]">
          {/* Header Row */}
          <div className="grid grid-cols-9 gap-2 mb-3">
            <div className="text-xs font-semibold text-text-secondary text-center">Week</div>
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
              <div key={day} className="text-xs font-semibold text-text-secondary text-center">
                {day}
              </div>
            ))}
            <div className="text-xs font-semibold text-text-secondary text-center">Total</div>
          </div>

          {/* Week Rows */}
          <div className="space-y-2">
            {scorecard.weeks.map((week) => (
              <div key={week.weekNumber} className="grid grid-cols-9 gap-2">
                {/* Week Number */}
                <div className="flex items-center justify-center">
                  <div className="text-sm font-semibold text-text-primary">
                    W{week.weekNumber}
                  </div>
                </div>

                {/* Days */}
                {week.days.map((day, index) => (
                  <Link
                    key={index}
                    href={day.isFuture ? '#' : `/today?date=${day.date}`}
                    className={`
                      aspect-square rounded-md border transition-all duration-200
                      flex items-center justify-center
                      ${getScoreColor(day.score, day.isFuture)}
                    `}
                    onClick={(e) => day.isFuture && e.preventDefault()}
                  >
                    <span className={`text-sm ${getScoreTextColor(day.score, day.isFuture)}`}>
                      {day.isFuture ? '—' : day.score}
                    </span>
                  </Link>
                ))}

                {/* Week Total */}
                <div className="flex items-center justify-center">
                  <div className="text-sm font-bold text-text-primary">
                    {week.weekTotal}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary Stats */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-success">
                  {scorecard.weeks.reduce((sum, week) => 
                    sum + week.days.filter(d => !d.isFuture && d.score === 5).length, 0
                  )}
                </div>
                <div className="text-xs text-text-secondary mt-1">Perfect Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-warning">
                  {scorecard.weeks.reduce((sum, week) => 
                    sum + week.days.filter(d => !d.isFuture && d.score >= 3 && d.score < 5).length, 0
                  )}
                </div>
                <div className="text-xs text-text-secondary mt-1">Good Days</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-error">
                  {scorecard.weeks.reduce((sum, week) => 
                    sum + week.days.filter(d => !d.isFuture && d.score > 0 && d.score < 3).length, 0
                  )}
                </div>
                <div className="text-xs text-text-secondary mt-1">Needs Work</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-text-primary">
                  {scorecard.weeks.reduce((sum, week) => sum + week.weekTotal, 0)}
                </div>
                <div className="text-xs text-text-secondary mt-1">Total Points</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}