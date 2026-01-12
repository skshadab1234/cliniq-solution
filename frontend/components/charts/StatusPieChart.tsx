'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

type StatusPieChartProps = {
  completed: number
  skipped: number
  noShow: number
  cancelled?: number
  waiting?: number
}

const COLORS = {
  completed: '#10b981',
  skipped: '#6b7280',
  noShow: '#ef4444',
  cancelled: '#9ca3af',
  waiting: '#f59e0b'
}

const LABELS = {
  completed: 'Completed',
  skipped: 'Skipped',
  noShow: 'No Show',
  cancelled: 'Cancelled',
  waiting: 'Waiting'
}

export function StatusPieChart({ completed, skipped, noShow, cancelled = 0, waiting = 0 }: StatusPieChartProps) {
  const data = [
    { name: 'Completed', value: completed, color: COLORS.completed },
    { name: 'Skipped', value: skipped, color: COLORS.skipped },
    { name: 'No Show', value: noShow, color: COLORS.noShow },
    { name: 'Cancelled', value: cancelled, color: COLORS.cancelled },
    { name: 'Waiting', value: waiting, color: COLORS.waiting },
  ].filter(d => d.value > 0)

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400">
        No data available
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
          dataKey="value"
          stroke="white"
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [`${value} (${((value / total) * 100).toFixed(0)}%)`, name]}
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
            fontSize: '13px'
          }}
        />
        <Legend
          layout="horizontal"
          verticalAlign="bottom"
          align="center"
          iconType="circle"
          iconSize={8}
          formatter={(value: string) => <span className="text-xs text-gray-600">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  )
}
