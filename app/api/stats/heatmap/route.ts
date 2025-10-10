import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get query params
    const { searchParams } = new URL(request.url)
    const daysParam = searchParams.get('days')
    const days = daysParam ? parseInt(daysParam) : 90

    // Calculate date range
    const endDate = new Date()
    endDate.setHours(23, 59, 59, 999)
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)
    startDate.setHours(0, 0, 0, 0)

    // Fetch entries in date range
    const entries = await prisma.dailyEntry.findMany({
      where: {
        userId,
        entry_date: {
          gte: startDate,
          lte: endDate
        }
      },
      select: {
        entry_date: true,
        daily_score: true,
        is_complete: true
      },
      orderBy: {
        entry_date: 'asc'
      }
    })

    // Create a map for quick lookup
    const entryMap = new Map(
      entries.map(entry => [
        entry.entry_date.toISOString().split('T')[0],
        {
          score: entry.daily_score,
          isComplete: entry.is_complete
        }
      ])
    )

    // Generate all dates in range with data
    const heatmapData = []
    const currentDate = new Date(startDate)

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      const entryData = entryMap.get(dateStr)

      heatmapData.push({
        date: dateStr,
        score: entryData?.score ?? 0,
        isComplete: entryData?.isComplete ?? false
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      days,
      data: heatmapData
    })

  } catch (error) {
    console.error('Heatmap API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch heatmap data' },
      { status: 500 }
    )
  }
}
