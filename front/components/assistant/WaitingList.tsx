'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Token } from '@/lib/api'
import { cn } from '@/lib/utils'
import { ChevronsRight, Phone, User, UserX, X, Zap } from 'lucide-react'

interface WaitingListProps {
  tokens: Token[]
  onSkip: (id: number) => void
  onNoShow: (id: number) => void
  onCancel: (id: number) => void
}

export function WaitingList({ tokens, onSkip, onNoShow, onCancel }: WaitingListProps) {
  const count = tokens.length

  const handleCancel = (token: Token) => {
    const tokenLabel = token?.tokenNumber ? `Token #${token.tokenNumber}` : 'this token'
    const patientName = token?.patient?.name
    const message = patientName
      ? `Cancel ${tokenLabel} for ${patientName}?`
      : `Cancel ${tokenLabel}?`

    if (window.confirm(message)) {
      onCancel(token.id)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <CardTitle className="text-[15px] font-semibold">Waiting</CardTitle>
            <p className="mt-1 text-sm text-gray-500">
              {count} {count === 1 ? 'patient' : 'patients'}
            </p>
          </div>
          <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700">
            {count}
          </span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {count === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50/60 p-10 text-center">
            <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-gray-500 shadow-sm">
              <User className="h-5 w-5" />
            </div>
            <p className="font-medium text-gray-900">No patients waiting</p>
            <p className="mt-1 text-sm text-gray-500">New tokens will appear here once added to the queue.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-gray-200">
            <div className="hidden grid-cols-12 gap-3 border-b border-gray-200 bg-gray-50/60 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500 sm:grid">
              <div className="col-span-3">Token</div>
              <div className="col-span-5">Patient</div>
              <div className="col-span-4 text-right">Actions</div>
            </div>

            <div className="divide-y">
              {tokens.map((t) => {
                const patientName = t.patient?.name || 'Unknown'
                const patientPhone = t.patient?.phone || '—'

                return (
                  <div
                    key={t.id}
                    className="group grid grid-cols-1 gap-3 px-4 py-3 transition-colors hover:bg-gray-50/60 sm:grid-cols-12 sm:items-center"
                  >
                    <div className="sm:col-span-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={cn(
                            'inline-flex items-center rounded-md px-2 py-1 text-sm font-semibold tracking-tight',
                            t.isEmergency ? 'bg-orange-50 text-orange-700' : 'bg-gray-100 text-gray-900'
                          )}
                        >
                          #{t.tokenNumber}
                        </span>
                        {t.isEmergency && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-700">
                            <Zap className="h-3 w-3" />
                            Emergency
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="sm:col-span-5 min-w-0">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg text-sm font-semibold text-white',
                            t.isEmergency ? 'bg-orange-600' : 'bg-gray-900'
                          )}
                          aria-hidden
                        >
                          {patientName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{patientName}</p>
                          <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                            <Phone className="h-3.5 w-3.5" />
                            <span className="truncate">{patientPhone}</span>
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="sm:col-span-4 flex items-center justify-start gap-1.5 sm:justify-end">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-700 hover:bg-gray-100"
                            onClick={() => onSkip(t.id)}
                          >
                            <ChevronsRight className="h-4 w-4" />
                            <span className="sm:hidden">Skip</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Move to skipped list - can re-add later</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600 hover:bg-red-50 hover:text-red-700"
                            onClick={() => onNoShow(t.id)}
                          >
                            <UserX className="h-4 w-4" />
                            <span className="sm:hidden">No Show</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Patient didn't arrive when called</TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                            onClick={() => handleCancel(t)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Cancel this token</TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
