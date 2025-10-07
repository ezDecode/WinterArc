'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { StreakCounter } from '@/components/analytics/StreakCounter'
import { SkeletonStats, SkeletonChart } from '@/components/ui/Skeleton'
import type { DashboardStats } from '@/types'

// Dynamic import for chart to reduce initial bundle size
const ProgressChart = dynamic(
  () => import('@/components/analytics/ProgressChart').then(mod => ({ default: mod.ProgressChart })),
  {
    loading: () => <SkeletonChart />,
    ssr: false
  }
)

type DashboardData = DashboardStats & {
  trendData: Array<{ date: string; score: number }>
}

export default function ProgressPage() {
  const [dashboard, setDashboard] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const response = await fetch('/api/stats/dashboard')
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        const data = await response.json()
        setDashboard(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard')
      } finally {
        setLoading(false)
      }
    }

    fetchDashboard()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Progress Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Track your streaks, completion rates, and trends
          </p>
        </div>
        <SkeletonStats />
        <SkeletonChart />
      </div>
    )
  }

  if (error || !dashboard) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Progress Dashboard</h1>
          <p className="text-text-secondary mt-1">
            Track your streaks, completion rates, and trends
          </p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-8">
          <p className="text-error text-center">{error || 'Failed to load dashboard'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Progress Dashboard</h1>
        <p className="text-text-secondary mt-1">
          Track your streaks, completion rates, and trends
        </p>
      </div>

      {/* Streak Counters */}
      <StreakCounter
        currentStreak={dashboard.currentStreak}
        longestStreak={dashboard.longestStreak}
      />

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm text-text-secondary">Days Completed</div>
          <div className="text-3xl font-bold text-text-primary mt-2">
            {dashboard.completedDays}/{dashboard.totalDays}
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            {dashboard.completionPercentage}% of journey
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm text-text-secondary">Average Score</div>
          <div className="text-3xl font-bold text-warning mt-2">
            {dashboard.weeklyAverageScore.toFixed(1)}/5
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            Overall performance
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm text-text-secondary">Study Completion</div>
          <div className="text-3xl font-bold text-success mt-2">
            {dashboard.targetCompletionRates.study}%
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            4 blocks per day
          </div>
        </div>

        <div className="bg-surface border border-border rounded-lg p-6">
          <div className="text-sm text-text-secondary">Water Intake</div>
          <div className="text-3xl font-bold text-success mt-2">
            {dashboard.targetCompletionRates.water}%
          </div>
          <div className="text-xs text-text-tertiary mt-1">
            8 bottles per day
          </div>
        </div>
      </div>

      {/* Target Completion Breakdown */}
      <div className="bg-surface border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Target Completion Rates
        </h3>
        <div className="space-y-4">
          {[
            { name: 'Study (4 blocks)', rate: dashboard.targetCompletionRates.study, icon: '📚' },
            { name: 'Reading (10+ pages)', rate: dashboard.targetCompletionRates.reading, icon: '📖' },
            { name: 'Pushups (50+)', rate: dashboard.targetCompletionRates.pushups, icon: '💪' },
            { name: 'Meditation (10-20 min)', rate: dashboard.targetCompletionRates.meditation, icon: '🧘' },
            { name: 'Water (8 bottles)', rate: dashboard.targetCompletionRates.water, icon: '💧' },
          ].map((target) => (
            <div key={target.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-primary">
                  {target.icon} {target.name}
                </span>
                <span className="font-semibold text-text-primary">
                  {target.rate}%
                </span>
              </div>
              <div className="w-full bg-background rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-success transition-all duration-500 rounded-full"
                  style={{ width: `${target.rate}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProgressChart trendData={dashboard.trendData} type="line" />
        <ProgressChart trendData={dashboard.trendData} type="bar" />
      </div>

      {/* Summary Message */}
      {dashboard.currentStreak > 0 && (
        <div className="bg-success/10 border border-success/20 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <div className="text-3xl">🔥</div>
            <div>
              <h4 className="text-lg font-semibold text-success">
                {dashboard.currentStreak === 1 ? 'Great start!' : `${dashboard.currentStreak} days strong!`}
              </h4>
              <p className="text-sm text-text-secondary mt-1">
                {dashboard.currentStreak < 7
                  ? "Keep going! You're building momentum."
                  : dashboard.currentStreak < 14
                  ? "You're on fire! This is becoming a habit."
                  : "Incredible streak! You're a consistency champion."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}