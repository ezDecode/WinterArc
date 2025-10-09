'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { toast } from 'sonner'

export default function OnboardingPage() {
  const router = useRouter()
  const { user } = useUser()
  const [loading, setLoading] = useState(false)
  const [timezone, setTimezone] = useState(() => {
    // Default to browser's timezone
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  })

  const handleComplete = async () => {
    try {
      setLoading(true)

      // Update user's profile with timezone
      const profileResponse = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timezone }),
      })

      if (!profileResponse.ok) {
        throw new Error('Failed to save preferences')
      }

      // Create today's entry to ensure user starts tracking immediately
      // This prevents the issue where scorecard shows no data on first visit
      const entryResponse = await fetch('/api/daily/today', {
        method: 'GET',
      })

      if (!entryResponse.ok) {
        // Log the error but don't block onboarding
        console.error('Failed to create initial entry:', entryResponse.statusText)
      }

      toast.success('Welcome to Winter Arc Tracker!', {
        description: 'Your preferences have been saved. Ready to start tracking!',
      })

      // Redirect to today's tracker
      router.push('/today')
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error('Failed to complete onboarding. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Common timezones for quick selection
  const commonTimezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Kolkata',
    'Australia/Sydney',
  ]

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">
            Welcome to Winter Arc Tracker! 🎯
          </h1>
          <p className="text-lg text-text-secondary">
            Let&apos;s get you set up for your 90-day transformation journey
          </p>
        </div>

        {/* Onboarding Card */}
        <div className="bg-surface border border-border rounded-lg p-8 space-y-8">
          {/* User Info */}
          <div className="text-center pb-6 border-b border-border">
            <p className="text-text-secondary">
              Hello, <span className="text-text-primary font-semibold">{user?.firstName || 'there'}</span>!
            </p>
          </div>

          {/* What is Winter Arc */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">
              What is the Winter Arc?
            </h2>
            <p className="text-text-secondary leading-relaxed">
              The Winter Arc is a 90-day challenge to build consistent habits and transform yourself. 
              Track 5 daily targets and watch your progress unfold week by week.
            </p>
          </div>

          {/* Daily Targets */}
          <div className="space-y-3">
            <h2 className="text-xl font-semibold text-text-primary">
              Your Daily Targets (5/5)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-2xl mb-2">📚</div>
                <div className="text-sm font-medium text-text-primary">Study Blocks</div>
                <div className="text-xs text-text-secondary">Complete 4 focused study sessions</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-2xl mb-2">📖</div>
                <div className="text-sm font-medium text-text-primary">Reading</div>
                <div className="text-xs text-text-secondary">Read 10+ pages daily</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-2xl mb-2">💪</div>
                <div className="text-sm font-medium text-text-primary">Pushups</div>
                <div className="text-xs text-text-secondary">Complete 3 sets (50+ total)</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4">
                <div className="text-2xl mb-2">🧘</div>
                <div className="text-sm font-medium text-text-primary">Meditation</div>
                <div className="text-xs text-text-secondary">10-20 minutes of practice</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 md:col-span-2">
                <div className="text-2xl mb-2">💧</div>
                <div className="text-sm font-medium text-text-primary">Water Intake</div>
                <div className="text-xs text-text-secondary">Drink 8 bottles of water</div>
              </div>
            </div>
          </div>

          {/* Timezone Selection */}
          <div className="space-y-3">
            <label htmlFor="timezone" className="block text-lg font-semibold text-text-primary">
              Select Your Timezone
            </label>
            <p className="text-sm text-text-secondary">
              This helps us show you accurate dates and send daily reminders at the right time.
            </p>
            
            {/* Common Timezones */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
              {commonTimezones.map((tz) => (
                <button
                  key={tz}
                  type="button"
                  onClick={() => setTimezone(tz)}
                  className={`
                    px-3 py-2 rounded-md text-sm transition-all border
                    ${timezone === tz
                      ? 'bg-accent text-background border-accent'
                      : 'bg-background text-text-secondary border-border hover:bg-surface'
                    }
                  `}
                >
                  {tz.replace(/_/g, ' ')}
                </button>
              ))}
            </div>

            {/* Custom Timezone Selector */}
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full bg-background border border-border rounded-lg p-3 text-text-primary focus:outline-none   focus:ring-accent/50"
            >
              {Intl.supportedValuesOf('timeZone').map((tz) => (
                <option key={tz} value={tz}>
                  {tz.replace(/_/g, ' ')}
                </option>
              ))}
            </select>
          </div>

          {/* Tips */}
          <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-accent mb-2">💡 Pro Tips</h3>
            <ul className="text-sm text-text-secondary space-y-1">
              <li>• Track your progress daily for best results</li>
              <li>• Aim for 5/5 points each day</li>
              <li>• Use weekly reviews to reflect and improve</li>
              <li>• Build streaks to stay motivated</li>
            </ul>
          </div>

          {/* Action Button */}
          <button
            onClick={handleComplete}
            disabled={loading}
            className="w-full bg-accent text-background font-semibold py-4 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed text-lg"
          >
            {loading ? 'Setting up...' : 'Start My Winter Arc Journey 🚀'}
          </button>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-sm text-text-tertiary">
            Ready to transform your next 90 days?
          </p>
        </div>
      </div>
    </div>
  )
}