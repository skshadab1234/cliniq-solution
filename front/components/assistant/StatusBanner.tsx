"use client"

import { AlertTriangle, Clock, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import React from "react"

interface StatusBannerProps {
  status?: "open" | "paused" | "closed"
  onReopen?: () => void
}

export function StatusBanner({ status, onReopen }: StatusBannerProps) {
  if (status === "paused") {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-yellow-600" />
        <span className="text-yellow-800">Queue is paused. Patients are waiting.</span>
      </div>
    )
  }

  if (status === "closed") {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-gray-600" />
          <span className="text-gray-800">Queue is closed for today.</span>
        </div>
        {onReopen && (
          <Button
            variant="outline"
            size="sm"
            onClick={onReopen}
            className="gap-2"
          >
            <RotateCcw className="h-4 w-4" />
            Reopen Queue
          </Button>
        )}
      </div>
    )
  }

  return null
}
