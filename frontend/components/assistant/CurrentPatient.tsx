import { Token } from "@/lib/api"
import { User, Phone, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface CurrentPatientProps {
  currentToken: Token | null | undefined
  getStatusBadge: (status: Token["status"]) => string
}

export function CurrentPatient({ currentToken, getStatusBadge }: CurrentPatientProps) {
  if (!currentToken) return null

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-blue-600 font-medium uppercase">Currently Serving</p>
          <p className="text-3xl font-bold text-blue-900">Token #{currentToken.tokenNumber}</p>
          <p className="text-lg text-blue-800">{currentToken.patient?.name}</p>
        </div>
        <span className={cn("px-3 py-1 rounded-full text-sm font-medium", getStatusBadge(currentToken.status))}>
          {currentToken.status.replace("_", " ")}
        </span>
      </div>
      <p className="text-gray-500 flex items-center gap-1 mt-2">
        <Phone className="h-4 w-4" />
        {currentToken.patient?.phone}
      </p>
      {currentToken.isEmergency && (
        <div className="mt-2 flex items-center gap-2 text-orange-600 text-sm font-medium">
          <Zap className="h-4 w-4" /> Emergency case
        </div>
      )}
    </div>
  )
}
