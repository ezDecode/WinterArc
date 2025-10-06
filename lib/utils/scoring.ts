import type { DailyEntry, StudyBlock, Reading, Pushups, Meditation } from '@/types'

/**
 * Calculate the daily score based on completed targets
 * Each target = 1 point, max 5 points per day
 */
export function calculateDailyScore(entry: Partial<DailyEntry>): number {
  let score = 0

  // Study: All 4 blocks must be checked = 1 point
  if (entry.study_blocks && Array.isArray(entry.study_blocks)) {
    const studyBlocks = entry.study_blocks as StudyBlock[]
    if (studyBlocks.length === 4 && studyBlocks.every(block => block.checked)) {
      score += 1
    }
  }

  // Reading: Checkbox must be checked = 1 point
  if (entry.reading && typeof entry.reading === 'object') {
    const reading = entry.reading as Reading
    if (reading.checked) {
      score += 1
    }
  }

  // Pushups: First 3 sets must be checked = 1 point
  if (entry.pushups && typeof entry.pushups === 'object') {
    const pushups = entry.pushups as Pushups
    if (pushups.set1 && pushups.set2 && pushups.set3) {
      score += 1
    }
  }

  // Meditation: Checkbox must be checked = 1 point
  if (entry.meditation && typeof entry.meditation === 'object') {
    const meditation = entry.meditation as Meditation
    if (meditation.checked) {
      score += 1
    }
  }

  // Water: All 8 bottles must be checked = 1 point
  if (entry.water_bottles && Array.isArray(entry.water_bottles)) {
    if (entry.water_bottles.length === 8 && entry.water_bottles.every(bottle => bottle)) {
      score += 1
    }
  }

  return score
}

/**
 * Check if a day is complete (all 5 targets hit)
 */
export function isDayComplete(entry: Partial<DailyEntry>): boolean {
  return calculateDailyScore(entry) === 5
}

/**
 * Calculate completion percentage for a specific target across multiple days
 */
export function calculateTargetCompletion(
  entries: DailyEntry[],
  target: 'study' | 'reading' | 'pushups' | 'meditation' | 'water'
): number {
  if (entries.length === 0) return 0

  let completedCount = 0

  entries.forEach(entry => {
    let isTargetComplete = false

    switch (target) {
      case 'study':
        if (Array.isArray(entry.study_blocks)) {
          const studyBlocks = entry.study_blocks as StudyBlock[]
          isTargetComplete = studyBlocks.length === 4 && studyBlocks.every(block => block.checked)
        }
        break
      case 'reading':
        if (typeof entry.reading === 'object') {
          const reading = entry.reading as Reading
          isTargetComplete = reading.checked
        }
        break
      case 'pushups':
        if (typeof entry.pushups === 'object') {
          const pushups = entry.pushups as Pushups
          isTargetComplete = pushups.set1 && pushups.set2 && pushups.set3
        }
        break
      case 'meditation':
        if (typeof entry.meditation === 'object') {
          const meditation = entry.meditation as Meditation
          isTargetComplete = meditation.checked
        }
        break
      case 'water':
        if (Array.isArray(entry.water_bottles)) {
          isTargetComplete = entry.water_bottles.length === 8 && entry.water_bottles.every(bottle => bottle)
        }
        break
    }

    if (isTargetComplete) {
      completedCount++
    }
  })

  return Math.round((completedCount / entries.length) * 100)
}
