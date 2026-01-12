'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { ReportSummary } from '@/lib/api'

type WeeklyComparisonChartProps = {
  data: ReportSummary[]
}

export function WeeklyComparisonChart({ data }: WeeklyComparisonChartProps) {
  // Get last 7 days
  const chartData = data
    .slice(0, 7)
    .reverse()
    .map(d => ({
      day: new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short' }),
      completed: d.completed,
      skipped: d.skipped,
      noShow: d.noShow,
    }))

  if (chartData.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={{ stroke: '#e5e7eb' }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#6b7280' }}
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontSize: '13px'
          }}
          cursor={{ fill: 'rgba(0, 0, 0, 0.04)' }}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
        />
        <Bar dataKey="completed" name="Completed" fill="#10b981" radius={[4, 4, 0, 0]} />
        <Bar dataKey="skipped" name="Skipped" fill="#6b7280" radius={[4, 4, 0, 0]} />
        <Bar dataKey="noShow" name="No Show" fill="#ef4444" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
