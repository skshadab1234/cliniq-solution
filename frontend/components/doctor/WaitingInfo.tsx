'use client'

import { Users, Zap } from 'lucide-react'
import { Token } from '@/lib/api'

type WaitingInfoProps = {
  waitingCount: number
  nextToken: Token | null
}

export function WaitingInfo({ waitingCount, nextToken }: WaitingInfoProps) {
  return (
    <div className="bg-white rounded-lg border p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-blue-600" />
          <span className="text-gray-700">Patients Waiting</span>
        </div>
        <span className="text-3xl font-bold text-blue-600">{waitingCount}</span>
      </div>
      {nextToken && waitingCount > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500">Next in queue:</p>
          <p className="font-medium text-gray-900">
            #{nextToken.tokenNumber} - {nextToken.patient?.name}
            {nextToken.isEmergency && <Zap className="h-4 w-4 inline ml-1 text-orange-500" />}
          </p>
        </div>
      )}
    </div>
  )
}
