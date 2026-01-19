"use client"

import { AlertTriangle, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

interface StatusBannerProps {
  status?: "open" | "paused" | "closed"
  onReopen?: () => void
}

export function StatusBanner({ status, onReopen }: StatusBannerProps) {
  if (status === "paused") {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 sm:p-4 flex items-center gap-3">
        <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
        </div>
        <div className="min-w-0">
          <p className="text-sm sm:text-base font-semibold text-amber-800">Queue Paused</p>
          <p className="text-xs sm:text-sm text-amber-600">Patients are waiting. Resume to continue.</p>
        </div>
      </div>
    )
  }

  if (status === "closed") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 sm:p-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-gray-200 flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500" />
          </div>
          <div className="min-w-0">
            <p className="text-sm sm:text-base font-semibold text-gray-700">Queue Closed</p>
            <p className="text-xs sm:text-sm text-gray-500">Today&apos;s queue has ended.</p>
          </div>
        </div>
        {onReopen && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReopen}
            className="shrink-0 h-9 text-xs sm:text-sm font-medium"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
            <span className="hidden xs:inline">Reopen</span>
            <span className="xs:hidden">Open</span>
          </Button>
        )}
      </div>
    )
  }

  return null
}
