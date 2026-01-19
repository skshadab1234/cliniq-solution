'use client'

import { Button } from '@/components/ui/button'
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
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">Waiting</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {count} {count === 1 ? 'patient' : 'patients'} in queue
          </p>
        </div>
        <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold">
          {count}
        </span>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-100">
        {count === 0 ? (
          <div className="p-8 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <User className="h-6 w-6 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900">No patients waiting</p>
            <p className="text-xs text-gray-500 mt-1">New patients will appear here</p>
          </div>
        ) : (
          tokens.map((t) => {
            const patientName = t.patient?.name || 'Unknown'
            const patientPhone = t.patient?.phone || '—'

            return (
              <div
                key={t.id}
                className="p-3 sm:p-4 hover:bg-gray-50/50 transition-colors"
              >
                {/* Mobile Layout */}
                <div className="flex items-start gap-3">
                  {/* Avatar */}
                  <div
                    className={cn(
                      'flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white',
                      t.isEmergency ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-gradient-to-br from-gray-700 to-gray-900'
                    )}
                  >
                    {patientName.charAt(0).toUpperCase()}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={cn(
                          'inline-flex items-center rounded-lg px-2 py-0.5 text-sm font-bold',
                          t.isEmergency
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-gray-100 text-gray-900'
                        )}
                        style={{ fontFeatureSettings: '"tnum"' }}
                      >
                        #{t.tokenNumber}
                      </span>
                      {t.isEmergency && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-orange-100 px-2 py-0.5 text-xs font-semibold text-orange-700">
                          <Zap className="h-3 w-3" />
                          Emergency
                        </span>
                      )}
                    </div>

                    <p className="text-sm sm:text-base font-medium text-gray-900 mt-1 truncate">
                      {patientName}
                    </p>

                    <a
                      href={`tel:${patientPhone}`}
                      className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700 mt-0.5"
                    >
                      <Phone className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                      {patientPhone}
                    </a>
                  </div>
                </div>

                {/* Action Buttons - Full width on mobile */}
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs sm:text-sm font-medium text-gray-700 hover:bg-gray-100"
                    onClick={() => onSkip(t.id)}
                  >
                    <ChevronsRight className="h-4 w-4 mr-1" />
                    Skip
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-9 text-xs sm:text-sm font-medium text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                    onClick={() => onNoShow(t.id)}
                  >
                    <UserX className="h-4 w-4 mr-1" />
                    No Show
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                    onClick={() => handleCancel(t)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
