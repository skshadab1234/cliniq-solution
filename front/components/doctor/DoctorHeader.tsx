'use client'

import { Stethoscope, Calendar, Clock, Users, Wifi, WifiOff, Activity } from 'lucide-react'
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
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04)]">
      {/* Premium gradient accent bar */}
      <div className="h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500" />

      {/* Decorative background */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-teal-50 to-emerald-50/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

      <div className="relative p-4 sm:p-6">
        {/* Top Row - Doctor Info + Connection */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div className="flex items-center gap-4 min-w-0">
            {/* Doctor Avatar */}
            <div className="relative">
              <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-500 flex items-center justify-center shadow-lg shadow-teal-500/25">
                <Stethoscope className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              {/* Online indicator */}
              {isConnected && (
                <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center shadow-md">
                  <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
                </div>
              )}
            </div>

            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">
                Dr. {doctorName}
              </h1>
              <p className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                <Calendar className="h-4 w-4 text-gray-400 flex-shrink-0" />
                <span className="truncate">{readableDate}</span>
              </p>
            </div>
          </div>

          {/* Connection Status */}
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold flex-shrink-0 transition-all duration-300',
            isConnected
              ? 'bg-gradient-to-r from-emerald-50 to-green-50 text-emerald-700 border border-emerald-200/60'
              : 'bg-gradient-to-r from-red-50 to-rose-50 text-red-700 border border-red-200/60'
          )}>
            {isConnected ? (
              <>
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="hidden sm:inline">Live</span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4" />
                <span className="hidden sm:inline">Offline</span>
              </>
            )}
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {/* Time */}
          <div className="relative overflow-hidden bg-gradient-to-br from-gray-50 to-slate-50 rounded-xl p-4 text-center border border-gray-100">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-center gap-1.5 text-gray-500 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                <Clock className="h-3.5 w-3.5" />
                <span>Time</span>
              </div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 tabular-nums tracking-tight">
                {timeString}
              </p>
            </div>
          </div>

          {/* Waiting */}
          <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 text-center border border-teal-200/60">
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
            <div className="relative">
              <div className="flex items-center justify-center gap-1.5 text-teal-600 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2">
                <Users className="h-3.5 w-3.5" />
                <span>Waiting</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold text-teal-700 tabular-nums">
                {waitingCount}
              </p>
            </div>
          </div>

          {/* Status */}
          <div className={cn(
            'relative overflow-hidden rounded-xl p-4 text-center border',
            queueStatus === 'open' && 'bg-gradient-to-br from-emerald-50 to-green-50 border-emerald-200/60',
            queueStatus === 'paused' && 'bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200/60',
            queueStatus === 'closed' && 'bg-gradient-to-br from-gray-50 to-slate-50 border-gray-200/60'
          )}>
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent pointer-events-none" />
            <div className="relative">
              <div className={cn(
                'flex items-center justify-center gap-1.5 text-[10px] sm:text-xs font-semibold uppercase tracking-wider mb-2',
                queueStatus === 'open' && 'text-emerald-600',
                queueStatus === 'paused' && 'text-amber-600',
                queueStatus === 'closed' && 'text-gray-500'
              )}>
                <Activity className="h-3.5 w-3.5" />
                <span>Status</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <span className={cn(
                  'h-2.5 w-2.5 rounded-full',
                  queueStatus === 'open' && 'bg-emerald-500 animate-pulse',
                  queueStatus === 'paused' && 'bg-amber-500',
                  queueStatus === 'closed' && 'bg-gray-400'
                )} />
                <span className={cn(
                  'text-base sm:text-lg font-bold capitalize',
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
    </div>
  )
}
