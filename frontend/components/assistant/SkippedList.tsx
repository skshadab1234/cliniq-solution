'use client'

import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Token } from '@/lib/api'
import { RotateCcw } from 'lucide-react'

interface SkippedListProps {
  tokens: Token[]
  onReadd: (id: number) => void
}

export function SkippedList({ tokens, onReadd }: SkippedListProps) {
  if (tokens.length === 0) return null

  return (
    <div className="bg-white rounded-lg border">
      <div className="px-4 py-3 border-b">
        <h2 className="font-semibold text-gray-900">Skipped ({tokens.length})</h2>
      </div>
      <div className="divide-y">
        {tokens.map((t) => (
          <div key={t.id} className="px-4 py-3 flex items-center justify-between hover:bg-gray-50">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-gray-400 w-12">#{t.tokenNumber}</span>
              <div>
                <p className="font-medium text-gray-600">{t.patient?.name}</p>
                <p className="text-sm text-gray-400">{t.patient?.phone}</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" onClick={() => onReadd(t.id)}>
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Re-add
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add skipped patient back to queue</TooltipContent>
            </Tooltip>
          </div>
        ))}
      </div>
    </div>
  )
}
