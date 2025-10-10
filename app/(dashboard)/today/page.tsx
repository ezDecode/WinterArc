'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useDailyEntry } from '@/hooks/useDailyEntry'
import { useKeyboardShortcuts, useTodayShortcuts } from '@/hooks/useKeyboardShortcuts'
import { getDailyCompletionCelebration } from '@/lib/utils/motivation'
import { CelebrationNotification, useMotivationNotification } from '@/components/ui/MotivationNotification'
import { StudyBlocksTracker } from '@/components/tracker/StudyBlocksTracker'
import { ReadingTracker } from '@/components/tracker/ReadingTracker'
import { PushupsTracker } from '@/components/tracker/PushupsTracker'
import { MeditationTracker } from '@/components/tracker/MeditationTracker'
import { WaterBottlesTracker } from '@/components/tracker/WaterBottlesTracker'
import { DailyScoreDisplay } from '@/components/tracker/DailyScoreDisplay'
import { NotesSection } from '@/components/tracker/NotesSection'
import { SaveStatus } from '@/components/ui/SaveStatus'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { KeyboardShortcutsModal } from '@/components/ui/KeyboardShortcutsModal'
import { SkeletonPage } from '@/components/ui/Skeleton'
import type { StudyBlock, Reading, Pushups, Meditation, Notes } from '@/types'

// Force dynamic rendering - this page requires authentication
export const dynamic = 'force-dynamic'

// Component that uses searchParams - must be wrapped in Suspense
function TodayContent() {
  // Get date from URL query parameter if present
  const searchParams = useSearchParams()
  const dateParam = searchParams.get('date') // Will be YYYY-MM-DD or null
  
  const { entry, isLoading, error, updateEntry, refreshEntry, isSaving, lastSaved } =
    useDailyEntry(dateParam || undefined)
  const [showShortcuts, setShowShortcuts] = useState(false)
  const { currentMessage: globalMotivationMessage, showMessage: showGlobalMotivation, clearMessage: clearGlobalMotivation } = useMotivationNotification()

  // Track daily completion for celebration
  useEffect(() => {
    if (entry && entry.is_complete && entry.daily_score === 5) {
      // Show celebration for perfect day!
      const celebrationMessage = getDailyCompletionCelebration()
      showGlobalMotivation(celebrationMessage)
    }
  }, [entry, showGlobalMotivation])

  // Keyboard shortcuts - must be called before any conditional returns
  const shortcuts = useTodayShortcuts(
    () => {
      // Manual save trigger (auto-save already handles it)
      console.log('Save triggered via keyboard')
    },
    () => setShowShortcuts(!showShortcuts)
  )

  useKeyboardShortcuts({ shortcuts })

  // Early returns AFTER all hooks
  if (isLoading) {
    return <SkeletonPage />
  }

  if (error || !entry) {
    return <ErrorMessage message={error || 'Failed to load entry'} onRetry={refreshEntry} />
  }

  const handleStudyBlocksChange = (blocks: StudyBlock[]) => {
    updateEntry({ study_blocks: blocks })
  }

  const handleReadingChange = (reading: Reading) => {
    updateEntry({ reading })
  }

  const handlePushupsChange = (pushups: Pushups) => {
    updateEntry({ pushups })
  }

  const handleMeditationChange = (meditation: Meditation) => {
    updateEntry({ meditation })
  }

  const handleWaterBottlesChange = (bottles: boolean[]) => {
    updateEntry({ water_bottles: bottles })
  }

  const handleNotesChange = (notes: Notes) => {
    updateEntry({ notes })
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Global Motivation Notification */}
      {globalMotivationMessage && globalMotivationMessage.intensity === 'celebration' && (
        <CelebrationNotification
          message={globalMotivationMessage}
          onClose={clearGlobalMotivation}
        />
      )}
      
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 sm:gap-6">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">
            {dateParam ? 'Daily Tracker' : 'Today\'s Tracker'}
          </h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            {dateParam ? 'View and edit habits for this day' : 'Track your daily habits and reach 5/5 points'}
          </p>
          <div className="mt-3 sm:mt-2 flex flex-col xs:flex-row xs:items-center gap-3 sm:gap-4">
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} error={null} />
            <button
              onClick={() => setShowShortcuts(true)}
              className="text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors self-start xs:self-auto bg-surface/50 hover:bg-surface border border-border rounded-lg px-3 py-2 min-h-[44px] flex items-center gap-2"
              title="Keyboard shortcuts"
            >
              <span>Press</span>
              <kbd className="px-2 py-1 text-xs font-mono bg-background border border-border rounded">?</kbd>
              <span>for shortcuts</span>
            </button>
          </div>
        </div>
        <div className="text-center sm:text-right bg-surface/50 rounded-lg p-3 sm:p-4 border border-border/50 backdrop-blur-sm">
          <div className="text-xs sm:text-sm text-text-secondary font-medium">Date</div>
          <div className="text-base sm:text-lg font-semibold text-text-primary mt-1">
            {new Date(entry.entry_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column - Trackers */}
        <div className="xl:col-span-2 space-y-6 sm:space-y-8">
          <StudyBlocksTracker
            blocks={entry.study_blocks as StudyBlock[]}
            onChange={handleStudyBlocksChange}
          />

          <ReadingTracker
            reading={entry.reading as Reading}
            onChange={handleReadingChange}
          />

          <PushupsTracker
            pushups={entry.pushups as Pushups}
            onChange={handlePushupsChange}
          />

          <MeditationTracker
            meditation={entry.meditation as Meditation}
            onChange={handleMeditationChange}
          />

          <WaterBottlesTracker
            bottles={entry.water_bottles}
            onChange={handleWaterBottlesChange}
          />

          <NotesSection
            notes={entry.notes as Notes}
            onChange={handleNotesChange}
          />
        </div>

        {/* Right Column - Score Display */}
        <div className="xl:col-span-1">
          <div className="sticky top-24 sm:top-28">
            <DailyScoreDisplay
              score={entry.daily_score}
              isComplete={entry.is_complete}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Main page component with Suspense boundary
export default function TodayPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-text-secondary">Loading...</div>
      </div>
    }>
      <TodayContent />
    </Suspense>
  )
}
