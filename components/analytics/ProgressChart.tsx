'use client'

import { memo } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

interface TrendDataPoint {
  date: string
  score: number
}

interface ProgressChartProps {
  trendData: TrendDataPoint[]
  type?: 'line' | 'bar'
}

export const ProgressChart = memo(function ProgressChart({ trendData, type = 'line' }: ProgressChartProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Prepare chart data
  const chartData = trendData.map(d => ({
    date: formatDate(d.date),
    score: d.score,
  }))

  // Custom tooltip
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-surface border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm text-text-secondary">{payload[0].payload.date}</p>
          <p className="text-lg font-bold text-text-primary">
            Score: {payload[0].value}/5
          </p>
        </div>
      )
    }
    return null
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8">
        <p className="text-text-secondary text-center">
          No data available yet. Start tracking your daily progress!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {type === 'line' ? 'Progress Trend' : 'Daily Scores'}
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'line' ? (
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey="date" 
              stroke="#737373" 
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]}
              stroke="#737373"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }}
            />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#10b981" 
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
              name="Daily Score"
            />
          </LineChart>
        ) : (
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
            <XAxis 
              dataKey="date" 
              stroke="#737373"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              domain={[0, 5]} 
              ticks={[0, 1, 2, 3, 4, 5]}
              stroke="#737373"
              style={{ fontSize: '12px' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ fontSize: '12px', color: '#a3a3a3' }}
            />
            <Bar 
              dataKey="score" 
              fill="#10b981"
              name="Daily Score"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  )
})
