"use client"

import { RefreshCw, Pause, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn, formatDateDisplay } from "@/lib/utils"

interface HeaderProps {
  clinicName?: string
  date: Date
  isConnected: boolean
  queueStatus?: "open" | "paused" | "closed"
  onRefresh: () => void
  onPauseResume: () => void
  onClose: () => void
  canClose: boolean
}

export function AssistantHeader({
  clinicName,
  date,
  isConnected,
  queueStatus,
  onRefresh,
  onPauseResume,
  onClose,
  canClose
}: HeaderProps) {
  const isPaused = queueStatus === "paused"
  const isClosed = queueStatus === "closed"

  return (
    <div className="flex flex-col gap-4">
      {/* Title Section */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 leading-tight">
            Queue Management
          </h1>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-sm sm:text-base text-gray-500 truncate">
              {clinicName || "Clinic"} &bull; {formatDateDisplay(date)}
            </p>
            {isConnected && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live
              </span>
            )}
          </div>
        </div>

        {/* Refresh button - always visible */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onRefresh}
          className="h-9 w-9 shrink-0"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Action Buttons */}
      {!isClosed && (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPauseResume}
            className={cn(
              "flex-1 sm:flex-none h-10 text-sm font-medium",
              isPaused
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                : "border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100"
            )}
          >
            {isPaused ? (
              <>
                <Play className="h-4 w-4 mr-1.5" />
                Resume Queue
              </>
            ) : (
              <>
                <Pause className="h-4 w-4 mr-1.5" />
                Pause Queue
              </>
            )}
          </Button>

          {canClose && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="flex-1 sm:flex-none h-10 text-sm font-medium border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
            >
              <X className="h-4 w-4 mr-1.5" />
              Close Queue
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
