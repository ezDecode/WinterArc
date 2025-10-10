'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { HeatmapDay } from '@/types'

interface CalendarHeatmapProps {
  data: HeatmapDay[]
  startDate: string
  endDate: string
}

export function CalendarHeatmap({ data, startDate, endDate }: CalendarHeatmapProps) {
  const [hoveredDay, setHoveredDay] = useState<HeatmapDay | null>(null)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })

  // Get color based on score
  const getColor = (score: number) => {
    if (score === 0) return 'bg-border hover:bg-border/70'
    if (score === 1) return 'bg-success/20 hover:bg-success/30'
    if (score === 2) return 'bg-success/40 hover:bg-success/50'
    if (score === 3) return 'bg-success/60 hover:bg-success/70'
    if (score === 4) return 'bg-success/80 hover:bg-success/90'
    return 'bg-success hover:bg-success/90' // score === 5
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { 
      weekday: 'short',
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get weekday for a date (0 = Sunday, 6 = Saturday)
  const getWeekday = (dateStr: string) => {
    return new Date(dateStr).getDay()
  }

  // Organize data by weeks
  const organizeByWeeks = () => {
    const weeks: HeatmapDay[][] = []
    let currentWeek: HeatmapDay[] = []
    
    // Add empty cells for the first week if it doesn't start on Sunday
    const firstWeekday = getWeekday(data[0]?.date)
    for (let i = 0; i < firstWeekday; i++) {
      currentWeek.push({ date: '', score: -1, isComplete: false })
    }

    data.forEach((day, index) => {
      currentWeek.push(day)
      
      // If Sunday or last day, start new week
      if (getWeekday(day.date) === 6 || index === data.length - 1) {
        weeks.push([...currentWeek])
        currentWeek = []
      }
    })

    return weeks
  }

  const weeks = organizeByWeeks()

  // Get months for labels
  const getMonths = () => {
    const months: { name: string; startCol: number }[] = []
    let currentMonth = ''
    
    data.forEach((day, index) => {
      if (day.date) {
        const month = new Date(day.date).toLocaleDateString('en-US', { month: 'short' })
        if (month !== currentMonth) {
          currentMonth = month
          const weekIndex = Math.floor((index + getWeekday(data[0]?.date)) / 7)
          months.push({ name: month, startCol: weekIndex })
        }
      }
    })
    
    return months
  }

  const months = getMonths()

  const handleMouseEnter = (day: HeatmapDay, event: React.MouseEvent) => {
    if (day.date) {
      setHoveredDay(day)
      const rect = event.currentTarget.getBoundingClientRect()
      setTooltipPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }
  }

  const handleMouseLeave = () => {
    setHoveredDay(null)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-5 sm:p-6 lg:p-8 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-text-primary flex items-center gap-2">
            <span>📅</span>
            Activity Heatmap
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary mt-1">
            Last {data.length} days of progress
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-border rounded-sm" />
            <div className="w-3 h-3 bg-success/20 rounded-sm" />
            <div className="w-3 h-3 bg-success/40 rounded-sm" />
            <div className="w-3 h-3 bg-success/60 rounded-sm" />
            <div className="w-3 h-3 bg-success/80 rounded-sm" />
            <div className="w-3 h-3 bg-success rounded-sm" />
          </div>
          <span>More</span>
        </div>
      </div>

      {/* Month Labels */}
      <div className="relative mb-2 h-5">
        <div className="flex gap-[3px]">
          {months.map((month, index) => (
            <div
              key={index}
              className="text-xs text-text-tertiary absolute"
              style={{ left: `${month.startCol * 14}px` }}
            >
              {month.name}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="overflow-x-auto pb-2">
        <div className="inline-flex flex-col gap-[3px] min-w-max">
          {/* Weekday Labels */}
          <div className="flex gap-[3px]">
            <div className="w-6 h-3" /> {/* Spacer for labels */}
            {weeks.map((_, weekIndex) => (
              <div key={weekIndex} className="w-3 h-3" />
            ))}
          </div>

          {/* Days grid */}
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, dayIndex) => (
            <div key={day} className="flex gap-[3px] items-center">
              <div className="w-6 text-[10px] text-text-tertiary text-right pr-1">
                {dayIndex % 2 === 1 ? day : ''}
              </div>
              {weeks.map((week, weekIndex) => {
                const dayData = week[dayIndex]
                if (!dayData || !dayData.date) {
                  return <div key={weekIndex} className="w-3 h-3" />
                }

                return (
                  <Link
                    key={weekIndex}
                    href={`/today?date=${dayData.date}`}
                    className={`w-3 h-3 rounded-sm transition-all duration-200 cursor-pointer ${getColor(
                      dayData.score
                    )} ${dayData.isComplete ? 'ring-1 ring-success/50' : ''}`}
                    onMouseEnter={(e) => handleMouseEnter(dayData, e)}
                    onMouseLeave={handleMouseLeave}
                    aria-label={`${formatDate(dayData.date)}: Score ${dayData.score}/5`}
                  />
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {hoveredDay && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            transform: 'translate(-50%, -100%)'
          }}
        >
          <div className="bg-surface-hover border border-border rounded-lg shadow-xl p-3 mb-2 min-w-[200px]">
            <div className="text-xs font-medium text-text-primary">
              {formatDate(hoveredDay.date)}
            </div>
            <div className="text-sm font-bold text-text-primary mt-1">
              {hoveredDay.score}/5 Points
            </div>
            {hoveredDay.isComplete && (
              <div className="text-xs text-success mt-1 flex items-center gap-1">
                <span>🎉</span>
                <span>Perfect Day!</span>
              </div>
            )}
            {hoveredDay.score === 0 && (
              <div className="text-xs text-text-tertiary mt-1">
                No activity
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
