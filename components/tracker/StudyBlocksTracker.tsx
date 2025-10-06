'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { StudyBlock } from '@/types'

interface StudyBlocksTrackerProps {
  blocks: StudyBlock[]
  onChange: (blocks: StudyBlock[]) => void
}

export function StudyBlocksTracker({ blocks, onChange }: StudyBlocksTrackerProps) {
  const handleCheckboxChange = (index: number, checked: boolean) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], checked }
    onChange(newBlocks)
  }

  const handleTopicChange = (index: number, topic: string) => {
    const newBlocks = [...blocks]
    newBlocks[index] = { ...newBlocks[index], topic }
    onChange(newBlocks)
  }

  const allChecked = blocks.every((block) => block.checked)
  const checkedCount = blocks.filter((block) => block.checked).length

  return (
    <div className="bg-surface border border-border rounded-lg p-6 animate-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <span className="text-2xl">{TARGETS.STUDY.icon}</span>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {TARGETS.STUDY.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {TARGETS.STUDY.description}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm text-text-secondary">Progress</div>
          <div
            className={`text-2xl font-bold ${
              allChecked ? 'text-success' : 'text-text-primary'
            }`}
          >
            {checkedCount}/4
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="flex items-center space-x-3 p-3 bg-background rounded-lg border border-border hover:border-text-tertiary transition-colors"
          >
            <input
              type="checkbox"
              checked={block.checked}
              onChange={(e) => handleCheckboxChange(index, e.target.checked)}
              className="w-5 h-5 rounded border-border bg-surface text-accent focus:ring-2 focus:ring-accent focus:ring-offset-0 cursor-pointer"
            />
            <input
              type="text"
              value={block.topic}
              onChange={(e) => handleTopicChange(index, e.target.value)}
              placeholder={`Block ${index + 1} topic (e.g., Mathematics)`}
              className="flex-1 bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none"
            />
            <span className="text-xs text-text-tertiary">1h</span>
          </div>
        ))}
      </div>

      {allChecked && (
        <div className="mt-4 text-sm text-success text-center animate-in">
          ✓ All study blocks completed! +1 point
        </div>
      )}
    </div>
  )
}
