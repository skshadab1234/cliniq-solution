import { StatCard } from "@/components/ui/card"
import { Users, Clock, CheckCircle2, XCircle, UserX } from "lucide-react"
import { QueueStats } from "@/lib/api"

interface StatsGridProps {
  stats: QueueStats | null
}

export function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatCard label="Total" value={stats?.total || 0} icon={<Users className="h-5 w-5" />} variant="info" />
      <StatCard label="Waiting" value={stats?.waiting || 0} icon={<Clock className="h-5 w-5" />} variant="warning" />
      <StatCard label="Completed" value={stats?.completed || 0} icon={<CheckCircle2 className="h-5 w-5" />} variant="success" />
      <StatCard label="Skipped" value={stats?.skipped || 0} icon={<XCircle className="h-5 w-5" />} variant="default" />
      <StatCard label="No Show" value={stats?.noShow || 0} icon={<UserX className="h-5 w-5" />} variant="danger" />
    </div>
  )
}
