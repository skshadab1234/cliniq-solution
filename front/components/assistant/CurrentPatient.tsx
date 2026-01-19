import { Token } from "@/lib/api"
import { Phone, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrentPatientProps {
  currentToken: Token | null | undefined
  getStatusBadge: (status: Token["status"]) => string
}

export function CurrentPatient({ currentToken, getStatusBadge }: CurrentPatientProps) {
  if (!currentToken) return null

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="space-y-1">
          <p className="text-xs sm:text-sm text-blue-600 font-semibold uppercase tracking-wide">
            Currently Serving
          </p>
          <p className="text-3xl sm:text-4xl font-bold text-blue-900 leading-none" style={{ fontFeatureSettings: '"tnum"' }}>
            #{currentToken.tokenNumber}
          </p>
          <p className="text-base sm:text-lg font-medium text-blue-800">
            {currentToken.patient?.name}
          </p>
        </div>

        <span className={cn(
          "self-start sm:self-center px-3 py-1.5 rounded-full text-xs sm:text-sm font-semibold capitalize whitespace-nowrap",
          getStatusBadge(currentToken.status)
        )}>
          {currentToken.status.replace("_", " ")}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-blue-200/50">
        <a
          href={`tel:${currentToken.patient?.phone}`}
          className="inline-flex items-center gap-1.5 text-sm text-blue-700 hover:text-blue-800 transition-colors"
        >
          <Phone className="h-4 w-4" />
          <span>{currentToken.patient?.phone}</span>
        </a>

        {currentToken.isEmergency && (
          <span className="inline-flex items-center gap-1 text-xs sm:text-sm font-semibold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
            <Zap className="h-3.5 w-3.5" />
            Emergency
          </span>
        )}
      </div>
    </div>
  )
}
