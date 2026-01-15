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
  const buttonStyles = {
    callNext: {
      active: 'bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 hover:-translate-y-0.5',
      inactive: 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100',
      iconBg: 'bg-white/20',
      iconBgInactive: 'bg-gray-200',
    },
    start: {
      active: 'bg-gradient-to-br from-emerald-500 via-emerald-600 to-green-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 hover:-translate-y-0.5',
      inactive: 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100',
      iconBg: 'bg-white/20',
      iconBgInactive: 'bg-gray-200',
    },
    prescription: {
      active: 'bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:-translate-y-0.5',
      inactive: 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100',
      iconBg: 'bg-white/20',
      iconBgInactive: 'bg-gray-200',
    },
    complete: {
      active: 'bg-gradient-to-br from-teal-500 via-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-500/30 hover:shadow-xl hover:shadow-teal-500/40 hover:-translate-y-0.5',
      inactive: 'bg-gray-50 text-gray-400 cursor-not-allowed border border-gray-100',
      iconBg: 'bg-white/20',
      iconBgInactive: 'bg-gray-200',
    },
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-100 p-4 sm:p-5 shadow-[0_1px_3px_rgba(0,0,0,0.02),0_4px_12px_rgba(0,0,0,0.04)]">
      {/* Decorative gradient */}
      <div className="absolute -top-20 -right-20 w-40 h-40 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full blur-3xl opacity-60 pointer-events-none" />

      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Call Next */}
        <button
          onClick={onCallNext}
          disabled={!canCallNext || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]',
            canCallNext ? buttonStyles.callNext.active : buttonStyles.callNext.inactive,
            canCallNext && 'active:scale-[0.97]'
          )}
        >
          {/* Shimmer effect on active */}
          {canCallNext && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          )}

          {isActing && !canStart && !canComplete ? (
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin mb-2" />
          ) : (
            <div className={cn(
              'h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-transform group-hover:scale-110',
              canCallNext ? buttonStyles.callNext.iconBg : buttonStyles.callNext.iconBgInactive
            )}>
              <PhoneCall className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
          <span className="font-semibold text-sm sm:text-base">Call Next</span>
          {nextToken && canCallNext && (
            <span className="text-xs mt-1 opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
              #{nextToken.tokenNumber}
            </span>
          )}
        </button>

        {/* Start */}
        <button
          onClick={onStart}
          disabled={!canStart || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]',
            canStart ? buttonStyles.start.active : buttonStyles.start.inactive,
            canStart && 'active:scale-[0.97]'
          )}
        >
          {/* Shimmer effect on active */}
          {canStart && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          )}

          {isActing && canStart ? (
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin mb-2" />
          ) : (
            <div className={cn(
              'h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-transform group-hover:scale-110',
              canStart ? buttonStyles.start.iconBg : buttonStyles.start.iconBgInactive
            )}>
              <Play className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
          <span className="font-semibold text-sm sm:text-base">Start</span>
          <span className="text-xs mt-1 opacity-80">Begin Consult</span>
        </button>

        {/* Prescription */}
        <button
          onClick={onPrescription}
          disabled={!canPrescribe || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]',
            canPrescribe ? buttonStyles.prescription.active : buttonStyles.prescription.inactive,
            canPrescribe && 'active:scale-[0.97]'
          )}
        >
          {/* Shimmer effect on active */}
          {canPrescribe && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          )}

          <div className={cn(
            'h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-transform group-hover:scale-110',
            canPrescribe ? buttonStyles.prescription.iconBg : buttonStyles.prescription.iconBgInactive
          )}>
            <FileText className="h-5 w-5 sm:h-6 sm:w-6" />
          </div>
          <span className="font-semibold text-sm sm:text-base">Prescription</span>
          <span className="text-xs mt-1 opacity-80">Write Rx</span>
        </button>

        {/* Complete */}
        <button
          onClick={onComplete}
          disabled={!canComplete || isActing}
          className={cn(
            'group relative flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl transition-all duration-300 min-h-[100px] sm:min-h-[120px]',
            canComplete ? buttonStyles.complete.active : buttonStyles.complete.inactive,
            canComplete && 'active:scale-[0.97]'
          )}
        >
          {/* Shimmer effect on active */}
          {canComplete && (
            <div className="absolute inset-0 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </div>
          )}

          {isActing && canComplete ? (
            <Loader2 className="h-7 w-7 sm:h-8 sm:w-8 animate-spin mb-2" />
          ) : (
            <div className={cn(
              'h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center mb-2 sm:mb-3 transition-transform group-hover:scale-110',
              canComplete ? buttonStyles.complete.iconBg : buttonStyles.complete.iconBgInactive
            )}>
              <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          )}
          <span className="font-semibold text-sm sm:text-base">Complete</span>
          <span className="text-xs mt-1 opacity-80">Finish Consult</span>
        </button>
      </div>
    </div>
  )
}
