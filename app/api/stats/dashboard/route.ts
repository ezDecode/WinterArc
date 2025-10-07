import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/server'
import { calculateStreaks } from '@/lib/utils/streak'
import { calculateTargetCompletion } from '@/lib/utils/scoring'
import type { DailyEntry, DashboardStats } from '@/types'

/**
 * GET /api/stats/dashboard
 * Returns aggregated dashboard metrics
 */
export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user profile
    const profileResponse = await supabaseAdmin
      .from('profiles')
      .select('id, arc_start_date')
      .eq('clerk_user_id', userId)
      .single()

    if (profileResponse.error || !profileResponse.data) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // @ts-expect-error - Supabase type narrowing issue
    const profile = profileResponse.data

    // Fetch all daily entries
    const { data: entries, error: entriesError } = await supabaseAdmin
      .from('daily_entries')
      .select('*')
      .eq('user_id', profile.id)
      .gte('entry_date', profile.arc_start_date)
      .order('entry_date', { ascending: true })

    if (entriesError) {
      console.error('Error fetching entries:', entriesError)
      return NextResponse.json({ error: 'Failed to fetch entries' }, { status: 500 })
    }

    const dailyEntries = entries as DailyEntry[]

    // Calculate arc progress
    const arcStartDate = new Date(profile.arc_start_date)
    const today = new Date()
    const daysSinceStart = Math.floor((today.getTime() - arcStartDate.getTime()) / (1000 * 60 * 60 * 24))
    const totalDays = Math.min(daysSinceStart, 90)
    const completedDays = dailyEntries.filter(e => e.daily_score === 5).length
    const completionPercentage = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

    // Calculate streaks
    const { currentStreak, longestStreak } = calculateStreaks(dailyEntries)

    // Calculate target completion rates
    const targetCompletionRates = {
      study: calculateTargetCompletion(dailyEntries, 'study'),
      reading: calculateTargetCompletion(dailyEntries, 'reading'),
      pushups: calculateTargetCompletion(dailyEntries, 'pushups'),
      meditation: calculateTargetCompletion(dailyEntries, 'meditation'),
      water: calculateTargetCompletion(dailyEntries, 'water'),
    }

    // Calculate weekly average score
    const totalScore = dailyEntries.reduce((sum, entry) => sum + entry.daily_score, 0)
    const weeklyAverageScore = dailyEntries.length > 0 
      ? parseFloat((totalScore / dailyEntries.length).toFixed(2))
      : 0

    // Build trend data for charts (last 30 days)
    const last30Days = dailyEntries.slice(-30)
    const trendData = last30Days.map(entry => ({
      date: entry.entry_date,
      score: entry.daily_score,
    }))

    const dashboardStats: DashboardStats & { trendData: typeof trendData } = {
      totalDays,
      completedDays,
      completionPercentage,
      currentStreak,
      longestStreak,
      targetCompletionRates,
      weeklyAverageScore,
      trendData,
    }
    
    return NextResponse.json(dashboardStats)
  } catch (error) {
    console.error('Error in GET /api/stats/dashboard:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}