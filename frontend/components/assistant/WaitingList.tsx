'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Token } from '@/lib/api'
import { cn } from '@/lib/utils'
import { Phone, Zap, X } from 'lucide-react'

interface WaitingListProps {
  tokens: Token[]
  onSkip: (id: number) => void
  onNoShow: (id: number) => void
  onCancel: (id: number) => void
}

export function WaitingList({ tokens, onSkip, onNoShow, onCancel }: WaitingListProps) {
  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Waiting ({tokens.length})</h2>
      </div>
      {tokens.length === 0 ? (
        <div className="p-8 text-center text-gray-500">No patients waiting</div>
      ) : (
        <div className="divide-y">
          {tokens.map((t) => (
            <div key={t.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center gap-4">
                <span
                  className={cn(
                    'text-xl font-bold w-12',
                    t.isEmergency ? 'text-orange-600' : 'text-gray-900'
                  )}
                >
                  #{t.tokenNumber}
                  {t.isEmergency && <Zap className="h-4 w-4 inline ml-1 text-orange-500" />}
                </span>
                <div>
                  <p className="font-medium text-gray-900">{t.patient?.name}</p>
                  <p className="text-sm text-gray-500 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {t.patient?.phone}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" onClick={() => onSkip(t.id)}>
                      Skip
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Move to skipped list - can re-add later</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="outline" size="sm" className="text-red-600" onClick={() => onNoShow(t.id)}>
                      No Show
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Patient didn't arrive when called</TooltipContent>
                </Tooltip>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="text-gray-400" onClick={() => onCancel(t.id)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Cancel this token</TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
