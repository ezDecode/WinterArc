'use client'

import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { SkeletonCard } from '@/components/ui/Skeleton'
import type { WeeklyReview } from '@/types'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

export default function ReviewPage() {
  const [currentWeek, setCurrentWeek] = useState<number>(1)
  const [reviews, setReviews] = useState<WeeklyReview[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    days_hit_all: 0,
    what_helped: '',
    what_blocked: '',
    next_week_change: '',
  })

  // Calculate current week based on user's arc start date
  useEffect(() => {
    async function fetchProfile() {
      try {
        const response = await fetch('/api/profile')
        if (!response.ok) throw new Error('Failed to fetch profile')
        
        const profile = await response.json()
        const arcStartDate = new Date(profile.arc_start_date)
        const today = new Date()
        const daysSinceStart = Math.floor((today.getTime() - arcStartDate.getTime()) / (1000 * 60 * 60 * 24))
        const weekNumber = Math.min(Math.floor(daysSinceStart / 7) + 1, 13)
        
        setCurrentWeek(weekNumber)
      } catch (err) {
        console.error('Error fetching profile:', err)
        setCurrentWeek(1)
      }
    }

    fetchProfile()
  }, [])

  // Fetch existing reviews
  useEffect(() => {
    async function fetchReviews() {
      try {
        const response = await fetch('/api/reviews')
        if (!response.ok) throw new Error('Failed to fetch reviews')
        
        const data = await response.json()
        setReviews(data)
        
        // If there's a review for current week, populate the form
        const currentWeekReview = data.find((r: WeeklyReview) => r.week_number === currentWeek)
        if (currentWeekReview) {
          setFormData({
            days_hit_all: currentWeekReview.days_hit_all,
            what_helped: currentWeekReview.what_helped || '',
            what_blocked: currentWeekReview.what_blocked || '',
            next_week_change: currentWeekReview.next_week_change || '',
          })
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load reviews')
      } finally {
        setLoading(false)
      }
    }

    if (currentWeek > 0) {
      fetchReviews()
    }
  }, [currentWeek])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccessMessage(null)

    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week_number: currentWeek,
          review_date: new Date().toISOString().split('T')[0],
          ...formData,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to save review')
      }

      const savedReview = await response.json()
      
      // Update reviews list
      setReviews(prev => {
        const filtered = prev.filter(r => r.week_number !== currentWeek)
        return [...filtered, savedReview].sort((a, b) => a.week_number - b.week_number)
      })

      setSuccessMessage('Weekly review saved successfully!')
      toast.success('Weekly review saved successfully!', {
        description: `Week ${currentWeek} - ${formData.days_hit_all}/7 perfect days`,
      })
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save review'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: string, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const loadWeekReview = (weekNumber: number) => {
    setCurrentWeek(weekNumber)
    const review = reviews.find(r => r.week_number === weekNumber)
    
    if (review) {
      setFormData({
        days_hit_all: review.days_hit_all,
        what_helped: review.what_helped || '',
        what_blocked: review.what_blocked || '',
        next_week_change: review.next_week_change || '',
      })
    } else {
      setFormData({
        days_hit_all: 0,
        what_helped: '',
        what_blocked: '',
        next_week_change: '',
      })
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Weekly Review</h1>
          <p className="text-text-secondary mt-1">
            Reflect on your week and plan improvements
          </p>
        </div>
        <SkeletonCard />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Weekly Review</h1>
        <p className="text-text-secondary mt-1">
          Reflect on your week and plan improvements
        </p>
      </div>

      {/* Week Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-text-secondary mr-2">Week:</span>
        {[...Array(13)].map((_, i) => {
          const weekNum = i + 1
          const hasReview = reviews.some(r => r.week_number === weekNum)
          const isSelected = currentWeek === weekNum
          
          return (
            <button
              key={weekNum}
              onClick={() => loadWeekReview(weekNum)}
              className={`
                px-3 py-1.5 rounded-md text-sm font-medium transition-all
                ${isSelected 
                  ? 'bg-accent text-background' 
                  : hasReview
                    ? 'bg-success/20 text-success border border-success/30 hover:bg-success/30'
                    : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover'
                }
              `}
            >
              W{weekNum}
            </button>
          )
        })}
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="bg-surface border border-border rounded-lg p-6 md:p-8">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              Week {currentWeek} Review
            </h2>
          </div>

          {/* Days Hit All Targets */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-text-primary">
              How many days did you hit all 5 targets this week?
            </label>
            <div className="flex gap-2">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleInputChange('days_hit_all', num)}
                  className={`
                    px-4 py-2 rounded-md font-semibold transition-all
                    ${formData.days_hit_all === num
                      ? 'bg-success text-white'
                      : 'bg-background text-text-secondary border border-border hover:bg-surface'
                    }
                  `}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* What Helped */}
          <div className="space-y-3">
            <label htmlFor="what_helped" className="block text-sm font-medium text-text-primary">
              What helped you stay consistent this week?
            </label>
            <textarea
              id="what_helped"
              value={formData.what_helped}
              onChange={(e) => handleInputChange('what_helped', e.target.value)}
              rows={4}
              placeholder="Reflect on what strategies, habits, or circumstances helped you succeed..."
              className="w-full bg-background border border-border rounded-lg p-4 text-text-primary placeholder:text-text-tertiary focus:outline-none   focus:ring-accent/50 resize-none"
            />
          </div>

          {/* What Blocked */}
          <div className="space-y-3">
            <label htmlFor="what_blocked" className="block text-sm font-medium text-text-primary">
              What got in the way of your progress?
            </label>
            <textarea
              id="what_blocked"
              value={formData.what_blocked}
              onChange={(e) => handleInputChange('what_blocked', e.target.value)}
              rows={4}
              placeholder="Identify obstacles, challenges, or patterns that hindered your consistency..."
              className="w-full bg-background border border-border rounded-lg p-4 text-text-primary placeholder:text-text-tertiary focus:outline-none   focus:ring-accent/50 resize-none"
            />
          </div>

          {/* Next Week Change */}
          <div className="space-y-3">
            <label htmlFor="next_week_change" className="block text-sm font-medium text-text-primary">
              What will you change or improve next week?
            </label>
            <textarea
              id="next_week_change"
              value={formData.next_week_change}
              onChange={(e) => handleInputChange('next_week_change', e.target.value)}
              rows={4}
              placeholder="Commit to one specific change or adjustment for better results..."
              className="w-full bg-background border border-border rounded-lg p-4 text-text-primary placeholder:text-text-tertiary focus:outline-none   focus:ring-accent/50 resize-none"
            />
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-4">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}
          
          {successMessage && (
            <div className="bg-success/10 border border-success/20 rounded-lg p-4">
              <p className="text-sm text-success">{successMessage}</p>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={saving}
            className="w-full bg-accent text-background font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Saving...' : 'Save Review'}
          </button>
        </div>
      </form>

      {/* Previous Reviews Summary */}
      {reviews.length > 0 && (
        <div className="bg-surface border border-border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Review History
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {reviews.map((review) => (
              <button
                key={review.id}
                onClick={() => loadWeekReview(review.week_number)}
                className="bg-background border border-border rounded-lg p-4 hover:bg-surface transition-colors text-left"
              >
                <div className="text-xs text-text-secondary">Week {review.week_number}</div>
                <div className="text-2xl font-bold text-success mt-1">
                  {review.days_hit_all}/7
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}