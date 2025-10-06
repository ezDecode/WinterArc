'use client'

import { useDailyEntry } from '@/hooks/useDailyEntry'
import { StudyBlocksTracker } from '@/components/tracker/StudyBlocksTracker'
import { ReadingTracker } from '@/components/tracker/ReadingTracker'
import { PushupsTracker } from '@/components/tracker/PushupsTracker'
import { MeditationTracker } from '@/components/tracker/MeditationTracker'
import { WaterBottlesTracker } from '@/components/tracker/WaterBottlesTracker'
import { DailyScoreDisplay } from '@/components/tracker/DailyScoreDisplay'
import { NotesSection } from '@/components/tracker/NotesSection'
import { SaveStatus } from '@/components/ui/SaveStatus'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import type { StudyBlock, Reading, Pushups, Meditation, Notes } from '@/types'

export default function TodayPage() {
  const { entry, isLoading, error, updateEntry, refreshEntry, isSaving, lastSaved } =
    useDailyEntry()

  if (isLoading) {
    return <LoadingSpinner />
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">Today&apos;s Tracker</h1>
          <p className="text-text-secondary mt-1">
            Track your daily habits and reach 5/5 points
          </p>
          <div className="mt-2">
            <SaveStatus isSaving={isSaving} lastSaved={lastSaved} error={null} />
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Date</div>
          <div className="text-lg font-medium text-text-primary">
            {new Date(entry.entry_date).toLocaleDateString('en-US', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            })}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Trackers */}
        <div className="lg:col-span-2 space-y-6">
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
        <div className="lg:col-span-1">
          <div className="sticky top-24">
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
