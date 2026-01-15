"use client"

import { AlertTriangle, Clock } from "lucide-react"
import React from "react"

interface StatusBannerProps {
  status?: "open" | "paused" | "closed"
}

export function StatusBanner({ status }: StatusBannerProps) {
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
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 flex items-center gap-3">
        <Clock className="h-5 w-5 text-gray-600" />
        <span className="text-gray-800">Queue is closed for today.</span>
      </div>
    )
  }

  return null
}
