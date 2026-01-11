'use client'

import { cn } from '@/lib/utils'

type DoctorHeaderProps = {
  doctorName?: string | null
  now: Date
  timeString: string
  queueStatus: string
  isConnected: boolean
  waitingCount: number
}

export function DoctorHeader({
  doctorName,
  now,
  timeString,
  queueStatus,
  isConnected,
  waitingCount,
}: DoctorHeaderProps) {
  const readableDate = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(now)

  const statusTone: Record<string, string> = {
    open: 'bg-green-100 text-green-700 border-green-200',
    paused: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    closed: 'bg-gray-100 text-gray-700 border-gray-200',
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 leading-tight">Dr. {doctorName}</h1>
        <p className="text-gray-600 text-sm sm:text-base">Today&apos;s Queue • {readableDate}</p>
        <p className="text-gray-900 text-xl font-semibold font-mono tracking-tight">{timeString}</p>
      </div>
      <div className="flex flex-col items-start sm:items-end gap-2">
        <div className={cn('px-3 py-1 rounded-full text-sm font-semibold border', statusTone[queueStatus] || statusTone.open)}>
          {queueStatus === 'open' && 'Live'}
          {queueStatus === 'paused' && 'Paused'}
          {queueStatus === 'closed' && 'Closed'}
        </div>
        {isConnected && (
          <span className="text-green-600 text-sm font-medium flex items-center gap-1">
            <span className="h-2 w-2 rounded-full bg-green-500" /> Connected
          </span>
        )}
        <div className="text-xs text-gray-500">Waiting: <span className="font-semibold text-gray-900">{waitingCount}</span></div>
      </div>
    </div>
  )
}
