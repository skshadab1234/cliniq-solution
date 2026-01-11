'use client'

type QueueStatusBannerProps = {
  queueStatus: string
}

export function QueueStatusBanner({ queueStatus }: QueueStatusBannerProps) {
  return (
    <>
      {queueStatus === 'paused' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-yellow-800 font-medium">Queue is paused</p>
        </div>
      )}
      {queueStatus === 'closed' && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-800 font-medium">Queue is closed for today</p>
        </div>
      )}
    </>
  )
}
