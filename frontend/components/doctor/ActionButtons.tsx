'use client'

import { Loader2, PhoneCall, Play, CheckCircle2 } from 'lucide-react'
import { Token } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type ActionButtonsProps = {
  nextToken: Token | null
  isActing: boolean
  canCallNext: boolean
  canStart: boolean
  canComplete: boolean
  onCallNext: () => void
  onStart: () => void
  onComplete: () => void
}

export function ActionButtons({
  nextToken,
  isActing,
  canCallNext,
  canStart,
  canComplete,
  onCallNext,
  onStart,
  onComplete,
}: ActionButtonsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className="h-24 sm:h-28 text-base sm:text-lg flex-col gap-2 rounded-xl shadow-sm"
            disabled={!canCallNext || isActing}
            onClick={onCallNext}
            variant={canCallNext ? 'default' : 'outline'}
          >
            {isActing && !canStart && !canComplete ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-semibold">Calling…</span>
              </>
            ) : (
              <>
                <PhoneCall className="h-6 w-6" />
                <span className="font-semibold">Call Next</span>
                {nextToken && <span className="text-xs opacity-80">Next: #{nextToken.tokenNumber}</span>}
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Call the next waiting patient</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className={cn(
              'h-24 sm:h-28 text-base sm:text-lg flex-col gap-2 rounded-xl shadow-sm',
              canStart && 'bg-green-600 hover:bg-green-700'
            )}
            disabled={!canStart || isActing}
            onClick={onStart}
            variant={canStart ? 'default' : 'outline'}
          >
            {isActing && canStart ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-semibold">Starting…</span>
              </>
            ) : (
              <>
                <Play className="h-6 w-6" />
                <span className="font-semibold">Start</span>
                <span className="text-xs opacity-80">Begin consult</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Begin consultation with called patient</TooltipContent>
      </Tooltip>

      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="lg"
            className={cn(
              'h-24 sm:h-28 text-base sm:text-lg flex-col gap-2 rounded-xl shadow-sm',
              canComplete && 'bg-purple-600 hover:bg-purple-700'
            )}
            disabled={!canComplete || isActing}
            onClick={onComplete}
            variant={canComplete ? 'default' : 'outline'}
          >
            {isActing && canComplete ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="font-semibold">Completing…</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="h-6 w-6" />
                <span className="font-semibold">Complete</span>
                <span className="text-xs opacity-80">Finish consult</span>
              </>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mark consultation as finished</TooltipContent>
      </Tooltip>
    </div>
  )
}
