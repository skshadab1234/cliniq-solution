'use client'

import { Stethoscope, Calendar, Clock, Users, Wifi, WifiOff } from 'lucide-react'
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
  }).format(now)

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top accent bar */}
      <div className="h-1 bg-teal-500" />

      <div className="p-4 sm:p-5">
        {/* Top Row - Doctor Info + Connection */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-full bg-teal-500 flex items-center justify-center flex-shrink-0">
              <Stethoscope className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Dr. {doctorName}</h1>
              <p className="text-xs sm:text-sm text-gray-500 flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">{readableDate}</span>
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className={cn(
            'flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium flex-shrink-0',
            isConnected ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
          )}>
            {isConnected ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isConnected ? 'Online' : 'Offline'}</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {/* Time */}
          <div className="bg-gray-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-gray-400 text-[10px] sm:text-xs font-medium mb-1">
              <Clock className="h-3 w-3" />
              <span>TIME</span>
            </div>
            <p className="text-base sm:text-lg font-bold text-gray-900 font-mono">{timeString}</p>
          </div>

          {/* Waiting */}
          <div className="bg-teal-50 rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 text-teal-600 text-[10px] sm:text-xs font-medium mb-1">
              <Users className="h-3 w-3" />
              <span>WAITING</span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-teal-700">{waitingCount}</p>
          </div>

          {/* Status */}
          <div className={cn(
            'rounded-xl p-3 text-center',
            queueStatus === 'open' && 'bg-emerald-50',
            queueStatus === 'paused' && 'bg-amber-50',
            queueStatus === 'closed' && 'bg-gray-100'
          )}>
            <div className={cn(
              'text-[10px] sm:text-xs font-medium mb-1',
              queueStatus === 'open' && 'text-emerald-600',
              queueStatus === 'paused' && 'text-amber-600',
              queueStatus === 'closed' && 'text-gray-500'
            )}>
              STATUS
            </div>
            <div className="flex items-center justify-center gap-1.5">
              <span className={cn(
                'h-2 w-2 rounded-full',
                queueStatus === 'open' && 'bg-emerald-500 animate-pulse',
                queueStatus === 'paused' && 'bg-amber-500',
                queueStatus === 'closed' && 'bg-gray-400'
              )} />
              <span className={cn(
                'text-sm sm:text-base font-bold capitalize',
                queueStatus === 'open' && 'text-emerald-700',
                queueStatus === 'paused' && 'text-amber-700',
                queueStatus === 'closed' && 'text-gray-600'
              )}>
                {queueStatus === 'open' ? 'Live' : queueStatus}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
