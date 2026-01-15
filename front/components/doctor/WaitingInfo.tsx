'use client'

import { Users, AlertCircle, ArrowRight } from 'lucide-react'
import { Token } from '@/lib/api'

type WaitingInfoProps = {
  waitingCount: number
  nextToken: Token | null
}

export function WaitingInfo({ waitingCount, nextToken }: WaitingInfoProps) {
  if (waitingCount === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
        <div className="text-center">
          <div className="h-10 w-10 sm:h-12 sm:w-12 mx-auto rounded-full bg-gray-100 flex items-center justify-center mb-2 sm:mb-3">
            <Users className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium text-sm sm:text-base">No patients waiting</p>
          <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1">Queue is empty</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-xs sm:text-sm text-gray-500">Waiting in Queue</p>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{waitingCount} patient{waitingCount !== 1 ? 's' : ''}</p>
            </div>
          </div>
        </div>

        {nextToken && (
          <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100">
            <div className="flex items-center gap-2.5 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl">
              <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm sm:text-base flex-shrink-0">
                #{nextToken.tokenNumber}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
                  <p className="font-medium text-gray-900 truncate text-sm sm:text-base">{nextToken.patient?.name}</p>
                  {nextToken.isEmergency && (
                    <span className="inline-flex items-center gap-0.5 sm:gap-1 px-1.5 sm:px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-[10px] sm:text-xs font-semibold">
                      <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      Urgent
                    </span>
                  )}
                </div>
                <p className="text-xs sm:text-sm text-gray-500">Next in queue</p>
              </div>
              <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 flex-shrink-0" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
