import { Users, Clock, CheckCircle2, XCircle, UserX } from "lucide-react"
import { QueueStats } from "@/lib/api"
import { cn } from "@/lib/utils"

interface StatsGridProps {
  stats: QueueStats | null
}

interface MiniStatProps {
  label: string
  value: number
  icon: React.ReactNode
  variant: "info" | "warning" | "success" | "default" | "danger"
}

function MiniStat({ label, value, icon, variant }: MiniStatProps) {
  const variants = {
    info: "bg-blue-50 border-blue-100 text-blue-700",
    warning: "bg-amber-50 border-amber-100 text-amber-700",
    success: "bg-emerald-50 border-emerald-100 text-emerald-700",
    default: "bg-gray-50 border-gray-100 text-gray-700",
    danger: "bg-red-50 border-red-100 text-red-700",
  }

  const iconVariants = {
    info: "text-blue-500",
    warning: "text-amber-500",
    success: "text-emerald-500",
    default: "text-gray-500",
    danger: "text-red-500",
  }

  return (
    <div className={cn(
      "flex items-center gap-3 rounded-xl border p-3 sm:p-4",
      variants[variant]
    )}>
      <div className={cn("shrink-0", iconVariants[variant])}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xl sm:text-2xl font-bold leading-none" style={{ fontFeatureSettings: '"tnum"' }}>
          {value}
        </p>
        <p className="text-xs sm:text-sm font-medium mt-0.5 opacity-80 truncate">
          {label}
        </p>
      </div>
    </div>
  )
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3">
      <MiniStat
        label="Total"
        value={stats?.total || 0}
        icon={<Users className="h-5 w-5 sm:h-6 sm:w-6" />}
        variant="info"
      />
      <MiniStat
        label="Waiting"
        value={stats?.waiting || 0}
        icon={<Clock className="h-5 w-5 sm:h-6 sm:w-6" />}
        variant="warning"
      />
      <MiniStat
        label="Completed"
        value={stats?.completed || 0}
        icon={<CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6" />}
        variant="success"
      />
      <MiniStat
        label="Skipped"
        value={stats?.skipped || 0}
        icon={<XCircle className="h-5 w-5 sm:h-6 sm:w-6" />}
        variant="default"
      />
      <MiniStat
        label="No Show"
        value={stats?.noShow || 0}
        icon={<UserX className="h-5 w-5 sm:h-6 sm:w-6" />}
        variant="danger"
      />
    </div>
  )
}
