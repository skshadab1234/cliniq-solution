'use client'

import { Loader2, PhoneCall, Play, CheckCircle2, FileText } from 'lucide-react'
import { Token } from '@/lib/api'
import { cn } from '@/lib/utils'

type ActionButtonsProps = {
  nextToken: Token | null
  isActing: boolean
  canCallNext: boolean
  canStart: boolean
  canComplete: boolean
  canPrescribe: boolean
  onCallNext: () => void
  onStart: () => void
  onComplete: () => void
  onPrescription: () => void
}

export function ActionButtons({
  nextToken,
  isActing,
  canCallNext,
  canStart,
  canComplete,
  canPrescribe,
  onCallNext,
  onStart,
  onComplete,
  onPrescription,
}: ActionButtonsProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {/* Call Next */}
        <button
          onClick={onCallNext}
          disabled={!canCallNext || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[90px] sm:min-h-[110px]',
            canCallNext
              ? 'bg-blue-500 hover:bg-blue-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          )}
        >
          {isActing && !canStart && !canComplete ? (
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin mb-1.5" />
          ) : (
            <div className={cn(
              'h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2',
              canCallNext ? 'bg-white/20' : 'bg-gray-200'
            )}>
              <PhoneCall className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          )}
          <span className="font-semibold text-xs sm:text-sm">Call Next</span>
          {nextToken && canCallNext && (
            <span className="text-[10px] sm:text-xs mt-0.5 opacity-80">#{nextToken.tokenNumber}</span>
          )}
        </button>

        {/* Start */}
        <button
          onClick={onStart}
          disabled={!canStart || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[90px] sm:min-h-[110px]',
            canStart
              ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          )}
        >
          {isActing && canStart ? (
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin mb-1.5" />
          ) : (
            <div className={cn(
              'h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2',
              canStart ? 'bg-white/20' : 'bg-gray-200'
            )}>
              <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          )}
          <span className="font-semibold text-xs sm:text-sm">Start</span>
          <span className="text-[10px] sm:text-xs mt-0.5 opacity-80">Begin Consult</span>
        </button>

        {/* Prescription */}
        <button
          onClick={onPrescription}
          disabled={!canPrescribe || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[90px] sm:min-h-[110px]',
            canPrescribe
              ? 'bg-violet-500 hover:bg-violet-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          )}
        >
          <div className={cn(
            'h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2',
            canPrescribe ? 'bg-white/20' : 'bg-gray-200'
          )}>
            <FileText className="h-4 w-4 sm:h-5 sm:w-5" />
          </div>
          <span className="font-semibold text-xs sm:text-sm">Prescription</span>
          <span className="text-[10px] sm:text-xs mt-0.5 opacity-80">Write Rx</span>
        </button>

        {/* Complete */}
        <button
          onClick={onComplete}
          disabled={!canComplete || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl transition-all duration-200 min-h-[90px] sm:min-h-[110px]',
            canComplete
              ? 'bg-teal-500 hover:bg-teal-600 text-white shadow-md hover:shadow-lg active:scale-[0.98]'
              : 'bg-gray-50 text-gray-400 cursor-not-allowed'
          )}
        >
          {isActing && canComplete ? (
            <Loader2 className="h-6 w-6 sm:h-7 sm:w-7 animate-spin mb-1.5" />
          ) : (
            <div className={cn(
              'h-9 w-9 sm:h-11 sm:w-11 rounded-full flex items-center justify-center mb-1.5 sm:mb-2',
              canComplete ? 'bg-white/20' : 'bg-gray-200'
            )}>
              <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
          )}
          <span className="font-semibold text-xs sm:text-sm">Complete</span>
          <span className="text-[10px] sm:text-xs mt-0.5 opacity-80">Finish Consult</span>
        </button>
      </div>
    </div>
  )
}
