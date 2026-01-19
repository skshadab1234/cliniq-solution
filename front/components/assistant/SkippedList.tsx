'use client'

import { Button } from '@/components/ui/button'
import { Token } from '@/lib/api'
import { Phone, RotateCcw } from 'lucide-react'

interface SkippedListProps {
  tokens: Token[]
  onReadd: (id: number) => void
}

export function SkippedList({ tokens, onReadd }: SkippedListProps) {
  if (tokens.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
        <h2 className="text-base sm:text-lg font-semibold text-gray-900">Skipped</h2>
        <span className="inline-flex items-center justify-center h-7 px-2.5 rounded-full bg-gray-200 text-gray-700 text-xs sm:text-sm font-semibold">
          {tokens.length}
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-gray-100">
        {tokens.map((t) => (
          <div key={t.id} className="p-3 sm:p-4 hover:bg-gray-50/50 transition-colors">
            <div className="flex items-center gap-3">
              {/* Token Badge */}
              <span
                className="inline-flex items-center justify-center h-10 w-14 sm:w-16 rounded-lg bg-gray-100 text-base sm:text-lg font-bold text-gray-500"
                style={{ fontFeatureSettings: '"tnum"' }}
              >
                #{t.tokenNumber}
              </span>

              {/* Patient Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-700 truncate">
                  {t.patient?.name}
                </p>
                <a
                  href={`tel:${t.patient?.phone}`}
                  className="inline-flex items-center gap-1 text-xs sm:text-sm text-gray-400 hover:text-gray-600"
                >
                  <Phone className="h-3 w-3" />
                  {t.patient?.phone}
                </a>
              </div>

              {/* Re-add Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onReadd(t.id)}
                className="h-9 text-xs sm:text-sm font-medium shrink-0"
              >
                <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
                Re-add
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
