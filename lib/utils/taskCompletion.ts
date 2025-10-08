/**
 * Task Completion Detection Utilities
 * 
 * Analyzes daily entries to identify incomplete tasks
 * for email reminder purposes
 */

import type { DailyEntry } from '@/types'

export interface IncompleteTask {
  name: string
  details: string
}

/**
 * Analyze a daily entry to identify incomplete tasks
 */
export function getIncompleteTasks(entry: DailyEntry): IncompleteTask[] {
  const incompleteTasks: IncompleteTask[] = []

  // Check study blocks (any of 4 blocks unchecked)
  if (entry.study_blocks && Array.isArray(entry.study_blocks)) {
    const uncheckedBlocks = entry.study_blocks.filter(block => !block.checked).length
    if (uncheckedBlocks > 0) {
      incompleteTasks.push({
        name: 'Study Blocks',
        details: `${uncheckedBlocks} of 4 study blocks remaining`
      })
    }
  } else {
    // No study blocks data means all 4 are incomplete
    incompleteTasks.push({
      name: 'Study Blocks',
      details: '4 study blocks need to be completed'
    })
  }

  // Check reading completion
  if (!entry.reading?.checked) {
    incompleteTasks.push({
      name: 'Reading',
      details: 'Daily reading session not completed'
    })
  }

  // Check pushups (any of 3 sets incomplete)
  if (entry.pushups) {
    const incompleteSets: string[] = []
    if (!entry.pushups.set1) incompleteSets.push('Set 1')
    if (!entry.pushups.set2) incompleteSets.push('Set 2')
    if (!entry.pushups.set3) incompleteSets.push('Set 3')

    if (incompleteSets.length > 0) {
      incompleteTasks.push({
        name: 'Pushups',
        details: `${incompleteSets.join(', ')} not completed (${incompleteSets.length} of 3 sets remaining)`
      })
    }
  } else {
    incompleteTasks.push({
      name: 'Pushups',
      details: '3 pushup sets need to be completed'
    })
  }

  // Check meditation completion
  if (!entry.meditation?.checked) {
    incompleteTasks.push({
      name: 'Meditation',
      details: 'Daily meditation session not completed'
    })
  }

  // Check water intake (any of 8 bottles not consumed)
  if (entry.water_bottles && Array.isArray(entry.water_bottles)) {
    const emptyBottles = entry.water_bottles.filter(bottle => !bottle).length
    if (emptyBottles > 0) {
      incompleteTasks.push({
        name: 'Water Intake',
        details: `${emptyBottles} of 8 water bottles remaining (${entry.water_bottles.length - emptyBottles}/8 completed)`
      })
    }
  } else {
    // No water bottles data means all 8 are incomplete
    incompleteTasks.push({
      name: 'Water Intake',
      details: '8 water bottles need to be consumed'
    })
  }

  return incompleteTasks
}

/**
 * Check if a daily entry has any incomplete tasks
 */
export function hasIncompleteTasks(entry: DailyEntry): boolean {
  return getIncompleteTasks(entry).length > 0
}

/**
 * Get a summary of incomplete tasks for display
 */
export function getIncompleteTasksSummary(entry: DailyEntry): {
  totalTasks: number
  completedTasks: number
  incompleteTasks: number
  completionRate: number
} {
  const totalTasks = 5 // Study, Reading, Pushups, Meditation, Water
  const incompleteTasksArray = getIncompleteTasks(entry)
  const incompleteTasks = incompleteTasksArray.length
  const completedTasks = totalTasks - incompleteTasks
  const completionRate = Math.round((completedTasks / totalTasks) * 100)

  return {
    totalTasks,
    completedTasks,
    incompleteTasks,
    completionRate
  }
}

/**
 * Check if entry is complete enough to skip reminder
 * (e.g., if user has completed 4 out of 5 tasks, maybe skip reminder)
 */
export function shouldSkipReminder(entry: DailyEntry, threshold = 0.8): boolean {
  const { completionRate } = getIncompleteTasksSummary(entry)
  return completionRate >= (threshold * 100)
}

/**
 * Get task completion details for analytics
 */
export function getTaskCompletionDetails(entry: DailyEntry): {
  studyBlocks: { completed: number; total: number }
  reading: boolean
  pushups: { completed: number; total: number }
  meditation: boolean
  waterBottles: { completed: number; total: number }
} {
  // Study blocks analysis
  let studyCompleted = 0
  if (entry.study_blocks && Array.isArray(entry.study_blocks)) {
    studyCompleted = entry.study_blocks.filter(block => block.checked).length
  }

  // Pushups analysis
  let pushupsCompleted = 0
  if (entry.pushups) {
    if (entry.pushups.set1) pushupsCompleted++
    if (entry.pushups.set2) pushupsCompleted++
    if (entry.pushups.set3) pushupsCompleted++
  }

  // Water bottles analysis
  let waterCompleted = 0
  if (entry.water_bottles && Array.isArray(entry.water_bottles)) {
    waterCompleted = entry.water_bottles.filter(bottle => bottle).length
  }

  return {
    studyBlocks: { completed: studyCompleted, total: 4 },
    reading: Boolean(entry.reading?.checked),
    pushups: { completed: pushupsCompleted, total: 3 },
    meditation: Boolean(entry.meditation?.checked),
    waterBottles: { completed: waterCompleted, total: 8 }
  }
}

/**
 * Format incomplete tasks for email display
 */
export function formatTasksForEmail(incompleteTasks: IncompleteTask[]): string {
  if (incompleteTasks.length === 0) {
    return 'All tasks completed! 🎉'
  }

  if (incompleteTasks.length === 1) {
    return `You have 1 incomplete task: ${incompleteTasks[0].name}`
  }

  const taskNames = incompleteTasks.map(task => task.name)
  const lastTask = taskNames.pop()
  
  return `You have ${incompleteTasks.length} incomplete tasks: ${taskNames.join(', ')} and ${lastTask}`
}

/**
 * Priority-based task ordering for reminders
 */
export function prioritizeIncompleteTasks(incompleteTasks: IncompleteTask[]): IncompleteTask[] {
  // Define priority order (higher number = higher priority)
  const priorityMap: Record<string, number> = {
    'Study Blocks': 5,
    'Reading': 4,
    'Meditation': 3,
    'Pushups': 2,
    'Water Intake': 1
  }

  return [...incompleteTasks].sort((a, b) => {
    const priorityA = priorityMap[a.name] || 0
    const priorityB = priorityMap[b.name] || 0
    return priorityB - priorityA
  })
}