'use client'

import { User, Phone, Zap } from 'lucide-react'
import { Token } from '@/lib/api'
import { cn } from '@/lib/utils'

type CurrentPatientCardProps = {
  currentToken: Token | null
}

export function CurrentPatientCard({ currentToken }: CurrentPatientCardProps) {
  return (
    <div
      className={cn(
        'rounded-xl p-8 text-center border-2',
        currentToken
          ? currentToken.status === 'in_progress'
            ? 'bg-purple-50 border-purple-200'
            : 'bg-blue-50 border-blue-200'
          : 'bg-gray-50 border-gray-200'
      )}
    >
      {currentToken ? (
        <>
          <p className="text-sm font-medium text-gray-500 uppercase mb-2">
            {currentToken.status === 'in_progress' ? 'In Consultation' : 'Called'}
          </p>
          <div className="flex items-center justify-center gap-2 mb-2">
            <p className="text-5xl font-bold text-gray-900">#{currentToken.tokenNumber}</p>
            {currentToken.isEmergency && <Zap className="h-8 w-8 text-orange-500" />}
          </div>
          <p className="text-xl text-gray-700 flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            {currentToken.patient?.name}
          </p>
          <p className="text-gray-500 flex items-center justify-center gap-1 mt-1">
            <Phone className="h-4 w-4" />
            {currentToken.patient?.phone}
          </p>
        </>
      ) : (
        <div className="py-8">
          <User className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No patient currently</p>
        </div>
      )}
    </div>
  )
}
