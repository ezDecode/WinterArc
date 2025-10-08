'use client'

import { TARGETS } from '@/lib/constants/targets'
import type { StudyBlock } from '@/types'
import { Plus, Trash2, Clock, Check } from 'lucide-react'

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

  const handleAddBlock = () => {
    onChange([...blocks, { checked: false, topic: '' }])
  }

  const handleRemoveBlock = (index: number) => {
    if (blocks.length <= 1) return // Keep at least 1 block
    const newBlocks = blocks.filter((_, i) => i !== index)
    onChange(newBlocks)
  }

  const checkedCount = blocks.filter((block) => block.checked).length
  const targetCount = Math.max(4, blocks.length)
  const isTargetMet = checkedCount >= 4
  const totalHours = blocks.length

  return (
    <div className="bg-surface border border-border rounded-lg p-4 sm:p-6 animate-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-xl sm:text-2xl">{TARGETS.STUDY.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base sm:text-lg font-semibold text-text-primary">
              {TARGETS.STUDY.name}
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary">
              {TARGETS.STUDY.description}
            </p>
          </div>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-xs sm:text-sm text-text-secondary">Progress</div>
          <div
            className={`text-xl sm:text-2xl font-bold ${
              isTargetMet ? 'text-success' : 'text-text-primary'
            }`}
          >
            {checkedCount}/{targetCount}
          </div>
          <div className="text-xs text-text-tertiary mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {totalHours}h total
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-5">
        <div className="h-3 bg-background rounded-full overflow-hidden shadow-inner">
          <div
            className="h-full bg-gradient-to-r from-purple-500 via-purple-400 to-pink-400 transition-all duration-500 ease-out relative overflow-hidden"
            style={{ width: `${(checkedCount / targetCount) * 100}%` }}
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
          </div>
        </div>
        <div className="mt-2 text-xs text-right">
          <span className={`font-medium ${isTargetMet ? 'text-success' : 'text-text-tertiary'}`}>
            Target: 4 hours minimum
          </span>
        </div>
      </div>

      <div className="space-y-3">
        {blocks.map((block, index) => (
          <div
            key={index}
            className="group relative"
          >
            <div
              className={`flex items-center space-x-3 p-3 sm:p-4 rounded-xl border-2 transition-all duration-200 ${
                block.checked
                  ? 'bg-gradient-to-r from-purple-50/10 to-pink-50/10 border-purple-400/50 shadow-md shadow-purple-500/10'
                  : 'bg-background border-border hover:border-purple-400/50'
              }`}
            >
              {/* Custom Checkbox */}
              <button
                onClick={() => handleCheckboxChange(index, !block.checked)}
                className="relative flex-shrink-0 group/checkbox min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label={`Toggle block ${index + 1}`}
              >
                <div
                  className={`w-7 h-7 rounded-lg border-2 transition-all duration-300 flex items-center justify-center ${
                    block.checked
                      ? 'bg-gradient-to-br from-purple-500 to-pink-500 border-purple-400 shadow-lg shadow-purple-500/50'
                      : 'bg-surface border-border group-hover/checkbox:border-purple-400 group-hover/checkbox:bg-purple-500/5'
                  }`}
                >
                  {block.checked && (
                    <Check 
                      className="w-5 h-5 text-white stroke-[3] animate-in" 
                      style={{ animationDuration: '200ms' }}
                    />
                  )}
                </div>
                {block.checked && (
                  <div className="absolute inset-0 rounded-lg bg-purple-500/30 animate-ping pointer-events-none"></div>
                )}
              </button>

              <input
                type="text"
                value={block.topic}
                onChange={(e) => handleTopicChange(index, e.target.value)}
                placeholder={`Block ${index + 1} topic`}
                className="flex-1 bg-transparent text-sm sm:text-base text-text-primary placeholder:text-text-tertiary focus:outline-none font-medium min-w-0"
              />
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full bg-purple-500/10 border border-purple-400/30">
                  <Clock className="w-3 h-3 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">1h</span>
                </div>
                {blocks.length > 1 && (
                  <button
                    onClick={() => handleRemoveBlock(index)}
                    className="w-8 h-8 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 min-h-[44px] min-w-[44px]"
                    aria-label="Remove block"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        
        {/* Add Button */}
        <button
          onClick={handleAddBlock}
          className="w-full p-3 sm:p-4 rounded-xl border-2 border-dashed border-border hover:border-purple-400 bg-background hover:bg-purple-50/5 transition-all duration-200 flex items-center justify-center gap-2 group min-h-[44px]"
          aria-label="Add study block"
        >
          <Plus className="w-5 h-5 text-text-tertiary group-hover:text-purple-400 transition-colors" />
          <span className="text-sm font-medium text-text-tertiary group-hover:text-purple-400 transition-colors">
            Add another hour
          </span>
        </button>
      </div>

      {isTargetMet && (
        <div className="mt-4 text-sm text-success text-center animate-in flex items-center justify-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <span>Study goal achieved! +1 point</span>
        </div>
      )}
    </div>
  )
}
