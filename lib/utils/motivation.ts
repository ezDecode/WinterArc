/**
 * Motivation System Utilities
 * 
 * Provides motivational messages, celebrations, and encouragement
 * to help users complete their daily tasks and maintain momentum.
 */

export interface MotivationMessage {
  message: string
  emoji: string
  intensity: 'low' | 'medium' | 'high' | 'celebration'
  type: 'completion' | 'progress' | 'encouragement' | 'celebration'
}

export interface TaskMotivationMessages {
  completion: MotivationMessage[]
  progress: MotivationMessage[]
  encouragement: MotivationMessage[]
}

// Task-specific motivation messages
export const TASK_MOTIVATION: Record<string, TaskMotivationMessages> = {
  study: {
    completion: [
      { message: "Brain gains unlocked! Knowledge is power!", emoji: "🧠", intensity: 'high', type: 'completion' },
      { message: "Study session complete! Your future self thanks you!", emoji: "📚", intensity: 'high', type: 'completion' },
      { message: "Another hour of wisdom gained! Keep building!", emoji: "🎯", intensity: 'medium', type: 'completion' },
      { message: "Learning machine mode activated! +1 point earned!", emoji: "🚀", intensity: 'high', type: 'completion' },
      { message: "Knowledge level up! Your mind is expanding!", emoji: "✨", intensity: 'medium', type: 'completion' },
    ],
    progress: [
      { message: "Great start! Keep the momentum going!", emoji: "🔥", intensity: 'medium', type: 'progress' },
      { message: "You're on fire! More hours await!", emoji: "💪", intensity: 'medium', type: 'progress' },
      { message: "Progress is progress! Every hour counts!", emoji: "⏰", intensity: 'low', type: 'progress' },
      { message: "Building that study streak! Don't stop now!", emoji: "📈", intensity: 'medium', type: 'progress' },
    ],
    encouragement: [
      { message: "Your future depends on what you do today!", emoji: "🌟", intensity: 'medium', type: 'encouragement' },
      { message: "4 hours of study = 1 step closer to your dreams!", emoji: "🎯", intensity: 'medium', type: 'encouragement' },
      { message: "Champions are made through consistent effort!", emoji: "🏆", intensity: 'high', type: 'encouragement' },
    ]
  },
  reading: {
    completion: [
      { message: "Pages turned, wisdom earned! Reading complete!", emoji: "📖", intensity: 'high', type: 'completion' },
      { message: "Another book session conquered! Knowledge flows!", emoji: "🌊", intensity: 'medium', type: 'completion' },
      { message: "Reading goal smashed! Your mind is expanding!", emoji: "🧠", intensity: 'high', type: 'completion' },
      { message: "Words absorbed, growth achieved! Well done!", emoji: "✨", intensity: 'medium', type: 'completion' },
      { message: "Reading warrior status: ACTIVE! +1 point!", emoji: "⚔️", intensity: 'high', type: 'completion' },
    ],
    progress: [
      { message: "Page by page, you're growing stronger!", emoji: "📚", intensity: 'medium', type: 'progress' },
      { message: "Every word counts toward your growth!", emoji: "🌱", intensity: 'low', type: 'progress' },
    ],
    encouragement: [
      { message: "Leaders are readers! Complete your session!", emoji: "👑", intensity: 'medium', type: 'encouragement' },
      { message: "Your reading habit is your superpower!", emoji: "🦸", intensity: 'high', type: 'encouragement' },
    ]
  },
  pushups: {
    completion: [
      { message: "Strength gained! Those pushups are paying off!", emoji: "💪", intensity: 'high', type: 'completion' },
      { message: "Push-up champion! Your body thanks you!", emoji: "🏆", intensity: 'high', type: 'completion' },
      { message: "Upper body powered up! Feeling strong!", emoji: "⚡", intensity: 'medium', type: 'completion' },
      { message: "Pushup mission accomplished! +1 point!", emoji: "✅", intensity: 'medium', type: 'completion' },
      { message: "Beast mode activated! All sets complete!", emoji: "🦍", intensity: 'high', type: 'completion' },
    ],
    progress: [
      { message: "Set by set, building strength!", emoji: "🔨", intensity: 'medium', type: 'progress' },
      { message: "Keep pushing! You're getting stronger!", emoji: "💪", intensity: 'medium', type: 'progress' },
      { message: "One more set! You've got this!", emoji: "🎯", intensity: 'medium', type: 'progress' },
    ],
    encouragement: [
      { message: "Strong body, strong mind! Finish those sets!", emoji: "🧠", intensity: 'medium', type: 'encouragement' },
      { message: "3 sets = unstoppable confidence!", emoji: "🚀", intensity: 'high', type: 'encouragement' },
    ]
  },
  meditation: {
    completion: [
      { message: "Inner peace achieved! Mind reset complete!", emoji: "🧘", intensity: 'high', type: 'completion' },
      { message: "Zen master mode! Meditation goal conquered!", emoji: "☯️", intensity: 'medium', type: 'completion' },
      { message: "Mindful warrior! Your peace practice pays off!", emoji: "🌸", intensity: 'medium', type: 'completion' },
      { message: "Mental clarity unlocked! +1 point earned!", emoji: "✨", intensity: 'high', type: 'completion' },
      { message: "Calm mind, powerful life! Session complete!", emoji: "🌊", intensity: 'medium', type: 'completion' },
    ],
    progress: [],
    encouragement: [
      { message: "Your mind needs this! Take time to meditate!", emoji: "🧠", intensity: 'medium', type: 'encouragement' },
      { message: "Inner peace = outer success! Meditate today!", emoji: "🌟", intensity: 'medium', type: 'encouragement' },
    ]
  },
  water: {
    completion: [
      { message: "Hydration hero! All 8 bottles conquered!", emoji: "💧", intensity: 'high', type: 'completion' },
      { message: "Water warrior! Your body is thanking you!", emoji: "🏆", intensity: 'high', type: 'completion' },
      { message: "Fully hydrated! Energy levels optimal!", emoji: "⚡", intensity: 'medium', type: 'completion' },
      { message: "H2O champion! +1 point for health!", emoji: "💎", intensity: 'medium', type: 'completion' },
      { message: "8 bottles down! Your cells are celebrating!", emoji: "🎉", intensity: 'high', type: 'completion' },
    ],
    progress: [
      { message: "Keep sipping! Your body craves more!", emoji: "💧", intensity: 'low', type: 'progress' },
      { message: "Bottle by bottle, health improves!", emoji: "📈", intensity: 'medium', type: 'progress' },
      { message: "Halfway there! Keep the flow going!", emoji: "🌊", intensity: 'medium', type: 'progress' },
    ],
    encouragement: [
      { message: "8 bottles = optimal performance! Drink up!", emoji: "🚀", intensity: 'medium', type: 'encouragement' },
      { message: "Your body is 60% water - feed it well!", emoji: "💧", intensity: 'low', type: 'encouragement' },
    ]
  }
}

// Overall progress motivation messages
export const OVERALL_PROGRESS_MOTIVATION: MotivationMessage[] = [
  { message: "Incredible progress! You're building an unstoppable routine!", emoji: "🔥", intensity: 'high', type: 'progress' },
  { message: "Step by step, you're becoming your best self!", emoji: "🚀", intensity: 'medium', type: 'progress' },
  { message: "Every completed task is a victory! Keep going!", emoji: "🏆", intensity: 'medium', type: 'progress' },
  { message: "You're not just tracking habits, you're building a legacy!", emoji: "✨", intensity: 'high', type: 'progress' },
  { message: "Champions aren't made overnight, but daily! Amazing work!", emoji: "💪", intensity: 'high', type: 'progress' },
]

// Daily completion celebration messages
export const DAILY_COMPLETION_MESSAGES: MotivationMessage[] = [
  { message: "PERFECT DAY ACHIEVED! You're absolutely unstoppable!", emoji: "🎉", intensity: 'celebration', type: 'celebration' },
  { message: "5/5 LEGENDARY STATUS! You've conquered every goal!", emoji: "👑", intensity: 'celebration', type: 'celebration' },
  { message: "FLAWLESS VICTORY! Today was your masterpiece!", emoji: "🏆", intensity: 'celebration', type: 'celebration' },
  { message: "INCREDIBLE! 100% completion - you're a habit machine!", emoji: "🤖", intensity: 'celebration', type: 'celebration' },
  { message: "PHENOMENAL! Every single goal crushed! Tomorrow awaits!", emoji: "🚀", intensity: 'celebration', type: 'celebration' },
  { message: "BEAST MODE COMPLETE! You've officially won the day!", emoji: "🦍", intensity: 'celebration', type: 'celebration' },
]

// Motivational push messages based on remaining tasks
export const REMAINING_TASKS_MOTIVATION: Record<number, MotivationMessage[]> = {
  4: [
    { message: "Just getting started! 4 more wins await you!", emoji: "💫", intensity: 'medium', type: 'encouragement' },
    { message: "The journey of excellence begins now! 4 to go!", emoji: "🎯", intensity: 'medium', type: 'encouragement' },
  ],
  3: [
    { message: "1 down, 3 to go! You're building momentum!", emoji: "🔥", intensity: 'medium', type: 'encouragement' },
    { message: "Great start! 3 more victories to claim today!", emoji: "⚡", intensity: 'medium', type: 'encouragement' },
  ],
  2: [
    { message: "Halfway there! 2 more tasks to dominate!", emoji: "💪", intensity: 'high', type: 'encouragement' },
    { message: "You're crushing it! Just 2 more to perfect day!", emoji: "🚀", intensity: 'high', type: 'encouragement' },
    { message: "The finish line is in sight! 2 tasks remaining!", emoji: "🏁", intensity: 'high', type: 'encouragement' },
  ],
  1: [
    { message: "SO CLOSE! Just 1 more task for a perfect day!", emoji: "🎯", intensity: 'high', type: 'encouragement' },
    { message: "Final boss battle! 1 task stands between you and victory!", emoji: "⚔️", intensity: 'high', type: 'encouragement' },
    { message: "You can taste the victory! 1 more task to go!", emoji: "🏆", intensity: 'high', type: 'encouragement' },
    { message: "Don't stop now! Perfect day is 1 task away!", emoji: "🔥", intensity: 'high', type: 'encouragement' },
  ]
}

// Time-based motivational messages
export const TIME_BASED_MOTIVATION: Record<string, MotivationMessage[]> = {
  morning: [
    { message: "Good morning, champion! Today is your canvas!", emoji: "🌅", intensity: 'medium', type: 'encouragement' },
    { message: "Rise and grind! Your future self is cheering you on!", emoji: "💪", intensity: 'high', type: 'encouragement' },
  ],
  afternoon: [
    { message: "Afternoon power time! Keep the momentum strong!", emoji: "⚡", intensity: 'medium', type: 'encouragement' },
    { message: "Midday motivation! You're halfway to greatness!", emoji: "🚀", intensity: 'medium', type: 'encouragement' },
  ],
  evening: [
    { message: "Evening excellence! Finish strong today!", emoji: "🌟", intensity: 'high', type: 'encouragement' },
    { message: "Don't let the day slip away! Complete what matters!", emoji: "⏰", intensity: 'high', type: 'encouragement' },
  ]
}

/**
 * Get a random motivation message for task completion
 */
export function getTaskCompletionMessage(taskType: string): MotivationMessage {
  const taskMessages = TASK_MOTIVATION[taskType.toLowerCase()]
  if (!taskMessages || !taskMessages.completion.length) {
    return { 
      message: "Task completed! Great work!", 
      emoji: "✅", 
      intensity: 'medium', 
      type: 'completion' 
    }
  }
  
  const messages = taskMessages.completion
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get a random motivation message for task progress
 */
export function getTaskProgressMessage(taskType: string): MotivationMessage {
  const taskMessages = TASK_MOTIVATION[taskType.toLowerCase()]
  if (!taskMessages || !taskMessages.progress.length) {
    return { 
      message: "Great progress! Keep going!", 
      emoji: "📈", 
      intensity: 'medium', 
      type: 'progress' 
    }
  }
  
  const messages = taskMessages.progress
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get encouragement message for incomplete task
 */
export function getTaskEncouragementMessage(taskType: string): MotivationMessage {
  const taskMessages = TASK_MOTIVATION[taskType.toLowerCase()]
  if (!taskMessages || !taskMessages.encouragement.length) {
    return { 
      message: "You can do this! Don't give up!", 
      emoji: "💪", 
      intensity: 'medium', 
      type: 'encouragement' 
    }
  }
  
  const messages = taskMessages.encouragement
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get motivation based on remaining tasks count
 */
export function getRemainingTasksMotivation(remainingCount: number): MotivationMessage {
  if (remainingCount === 0) {
    return DAILY_COMPLETION_MESSAGES[Math.floor(Math.random() * DAILY_COMPLETION_MESSAGES.length)]
  }
  
  const messages = REMAINING_TASKS_MOTIVATION[remainingCount] || REMAINING_TASKS_MOTIVATION[4]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get overall progress motivation
 */
export function getOverallProgressMotivation(): MotivationMessage {
  return OVERALL_PROGRESS_MOTIVATION[Math.floor(Math.random() * OVERALL_PROGRESS_MOTIVATION.length)]
}

/**
 * Get time-based motivation message
 */
export function getTimeBasedMotivation(): MotivationMessage {
  const hour = new Date().getHours()
  let timeOfDay: string
  
  if (hour < 12) {
    timeOfDay = 'morning'
  } else if (hour < 17) {
    timeOfDay = 'afternoon'
  } else {
    timeOfDay = 'evening'
  }
  
  const messages = TIME_BASED_MOTIVATION[timeOfDay]
  return messages[Math.floor(Math.random() * messages.length)]
}

/**
 * Get celebration message for completing all daily tasks
 */
export function getDailyCompletionCelebration(): MotivationMessage {
  return DAILY_COMPLETION_MESSAGES[Math.floor(Math.random() * DAILY_COMPLETION_MESSAGES.length)]
}

/**
 * Check if a motivation message should be high priority/attention grabbing
 */
export function isHighImpactMessage(message: MotivationMessage): boolean {
  return message.intensity === 'high' || message.intensity === 'celebration'
}

/**
 * Format motivation message for display
 */
export function formatMotivationMessage(message: MotivationMessage, includeEmoji: boolean = true): string {
  return includeEmoji ? `${message.emoji} ${message.message}` : message.message
}