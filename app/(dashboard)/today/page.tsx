'use client'

import { useState } from 'react'
import { useDailyEntry } from '@/hooks/useDailyEntry'
import { useKeyboardShortcuts, useTodayShortcuts } from '@/hooks/useKeyboardShortcuts'
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

export default function TodayPage() {
  const { entry, isLoading, error, updateEntry, refreshEntry, isSaving, lastSaved } =
    useDailyEntry()
  const [showShortcuts, setShowShortcuts] = useState(false)

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
    <div className="space-y-6">
      {/* Keyboard Shortcuts Modal */}
      <KeyboardShortcutsModal
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={shortcuts}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary">Today&apos;s Tracker</h1>
          <p className="text-sm sm:text-base text-text-secondary mt-1">
            Track your daily habits and reach 5/5 points
          </p>
          <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} error={null} />
            <button
              onClick={() => setShowShortcuts(true)}
              className="text-xs sm:text-sm text-text-secondary hover:text-text-primary transition-colors self-start"
              title="Keyboard shortcuts"
            >
              Press <kbd className="px-2 py-1 text-xs font-mono bg-surface border border-border rounded">?</kbd> for shortcuts
            </button>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-sm text-text-secondary">Date</div>
          <div className="text-base sm:text-lg font-medium text-text-primary">
            {new Date(entry.entry_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
        {/* Left Column - Trackers */}
        <div className="xl:col-span-2 space-y-4 sm:space-y-6">
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
          <div className="sticky top-20 sm:top-24">
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
