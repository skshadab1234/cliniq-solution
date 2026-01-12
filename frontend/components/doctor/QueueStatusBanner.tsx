'use client'

import { PauseCircle, XCircle } from 'lucide-react'

type QueueStatusBannerProps = {
  queueStatus: string
}

export function QueueStatusBanner({ queueStatus }: QueueStatusBannerProps) {
  if (queueStatus === 'open') return null

  return (
    <>
      {queueStatus === 'paused' && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
            <PauseCircle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-amber-800 text-sm sm:text-base">Queue Paused</p>
            <p className="text-xs sm:text-sm text-amber-600">Patients cannot be called. Resume to continue.</p>
          </div>
        </div>
      )}
      {queueStatus === 'closed' && (
        <div className="bg-gray-100 border border-gray-200 rounded-2xl p-3 sm:p-4 flex items-center gap-3 sm:gap-4">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-700 text-sm sm:text-base">Queue Closed</p>
            <p className="text-xs sm:text-sm text-gray-500">Today&apos;s queue has ended. See you tomorrow!</p>
          </div>
        </div>
      )}
    </>
  )
}
