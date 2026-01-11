"use client"

import { RefreshCw, Pause, Play, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
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
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Queue Management</h1>
        <p className="text-gray-500">
          {clinicName || "Clinic"} - {formatDateDisplay(date)}
          {isConnected && <span className="ml-2 text-green-500 text-sm">Live</span>}
        </p>
      </div>
      <div className="flex gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="outline" onClick={onRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh queue data</TooltipContent>
        </Tooltip>
        {!isClosed && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  onClick={onPauseResume}
                  className={cn(
                    isPaused ? "border-green-500 text-green-600" : "border-yellow-500 text-yellow-600"
                  )}
                >
                  {isPaused ? (
                    <>
                      <Play className="h-4 w-4 mr-2" /> Resume
                    </>
                  ) : (
                    <>
                      <Pause className="h-4 w-4 mr-2" /> Pause
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isPaused ? "Resume calling patients" : "Temporarily stop calling patients"}
              </TooltipContent>
            </Tooltip>
            {canClose && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="destructive" onClick={onClose}>
                    <X className="h-4 w-4 mr-2" />
                    Close
                  </Button>
                </TooltipTrigger>
                <TooltipContent>End queue for today</TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  )
}
