'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { reportsApi, DailyReport, ReportSummary } from '@/lib/api'
import { toast } from 'sonner'
import {
  Loader2,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Zap,
  FileText,
  TrendingUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatCard } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDateDisplay } from '@/lib/utils'

export default function ReportsPage() {
  const { token } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [history, setHistory] = useState<ReportSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [viewMode, setViewMode] = useState<'daily' | 'history'>('daily')
  const dateInputRef = useRef<HTMLInputElement | null>(null)

  const fetchReport = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      const response = await reportsApi.getDaily(token, selectedDate)
      setReport(response.report)
    } catch {
      toast.error('Failed to load report')
    } finally {
      setIsLoading(false)
    }
  }, [token, selectedDate])

  const fetchHistory = useCallback(async () => {
    if (!token) return
    setIsLoading(true)
    try {
      // Get last 30 days
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const response = await reportsApi.getHistory(token, startDate, endDate)
      setHistory(response.history)
    } catch {
      toast.error('Failed to load history')
    } finally {
      setIsLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (viewMode === 'daily') {
      fetchReport()
    } else {
      fetchHistory()
    }
  }, [viewMode, fetchReport, fetchHistory])

  const handleDownload = async () => {
    if (!token) return
    setIsDownloading(true)
    try {
      await reportsApi.downloadCSV(token, selectedDate)
      toast.success('Report downloaded')
    } catch {
      toast.error('Failed to download report')
    } finally {
      setIsDownloading(false)
    }
  }

  const changeDate = (days: number) => {
    const current = new Date(selectedDate)
    current.setDate(current.getDate() + days)
    setSelectedDate(current.toISOString().split('T')[0])
  }

  const formatDuration = (value: string | null | undefined) => {
    if (!value) return '-'

    const raw = String(value).trim()
    if (!raw) return '-'

    // Extract minutes from common backend formats (e.g., "222 mins", "15 min", "222")
    let minutes: number | null = null

    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly && digitsOnly.length === raw.length) {
      minutes = Number(raw)
    } else {
      const minMatch = raw.match(/(\d+)\s*(min|mins|minute|minutes)\b/i)
      if (minMatch) minutes = Number(minMatch[1])
    }

    if (minutes === null || Number.isNaN(minutes)) return raw

    if (minutes < 60) return `${minutes} min`

    const totalHours = Math.floor(minutes / 60)
    const remMinutes = minutes % 60
    if (totalHours < 24) {
      return remMinutes > 0 ? `${totalHours}h ${String(remMinutes).padStart(2, '0')}m` : `${totalHours}h`
    }

    const days = Math.floor(totalHours / 24)
    const remHours = totalHours % 24
    const dayPart = `${days}d`
    const hourPart = remHours > 0 ? ` ${remHours}h` : ''
    const minutePart = remMinutes > 0 ? ` ${String(remMinutes).padStart(2, '0')}m` : ''
    return `${dayPart}${hourPart}${minutePart}`.trim()
  }

  const formatStatusLabel = (status: string) => {
    return status
      .split('_')
      .filter(Boolean)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-green-100 text-green-700',
      waiting: 'bg-yellow-100 text-yellow-700',
      called: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-purple-100 text-purple-700',
      skipped: 'bg-gray-100 text-gray-700',
      no_show: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500">View and download daily queue reports</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'daily' ? 'default' : 'outline'}
            onClick={() => setViewMode('daily')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Daily
          </Button>
          <Button
            variant={viewMode === 'history' ? 'default' : 'outline'}
            onClick={() => setViewMode('history')}
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            History
          </Button>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Date Selector */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={() => changeDate(-1)}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Previous day</TooltipContent>
              </Tooltip>

              <div className="flex items-center gap-3">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="sr-only"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-12 px-4 rounded-xl shadow-sm bg-white"
                  onClick={() => {
                    const input = dateInputRef.current
                    if (!input) return
                    input.focus()
                    const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker
                    if (showPicker) showPicker.call(input)
                    else input.click()
                  }}
                >
                  <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                  <span className="font-semibold text-gray-900">{formatDateDisplay(selectedDate) || selectedDate}</span>
                </Button>
              </div>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => changeDate(1)}
                    disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Next day</TooltipContent>
              </Tooltip>
            </div>

            {report?.clinic && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  {report.clinic.name} {report.doctor && `• Dr. ${report.doctor.name}`}
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <StatCard
              label="Total Patients"
              value={report?.summary.total || 0}
              icon={<Users className="h-5 w-5" />}
              variant="info"
            />
            <StatCard
              label="Completed"
              value={report?.summary.completed || 0}
              icon={<CheckCircle2 className="h-5 w-5" />}
              variant="success"
            />
            <StatCard
              label="Skipped"
              value={report?.summary.skipped || 0}
              icon={<XCircle className="h-5 w-5" />}
              variant="default"
            />
            <StatCard
              label="No Show"
              value={report?.summary.noShow || 0}
              icon={<AlertTriangle className="h-5 w-5" />}
              variant="danger"
            />
            <StatCard
              label="Avg Wait"
              value={formatDuration(report?.summary.avgWaitTime)}
              icon={<Clock className="h-5 w-5" />}
              variant="warning"
            />
            <StatCard
              label="Avg Consult"
              value={formatDuration(report?.summary.avgConsultationTime)}
              icon={<Clock className="h-5 w-5" />}
              variant="info"
            />
          </div>

          {/* Download Button */}
          {report && report.tokens.length > 0 && (
            <div className="flex justify-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Download CSV
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Download full report as spreadsheet</TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* Tokens Table */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900">Patient Details</h2>
            </div>

            {!report || report.tokens.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <FileText className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                <p>No patient records for this date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Token</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Called</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Started</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Wait</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Consult</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {report.tokens.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900">#{t.tokenNumber}</span>
                            {t.isEmergency && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Zap className="h-4 w-4 text-orange-500" />
                                </TooltipTrigger>
                                <TooltipContent>Emergency case</TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-900">{t.patientName}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500">{t.patientPhone}</td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={cn('px-2 py-1 rounded-full text-xs font-medium', getStatusColor(t.status))}>
                            {formatStatusLabel(t.status)}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{t.addedAt || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{t.calledAt || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{t.startedAt || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{t.completedAt || '-'}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{formatDuration(t.waitTime)}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-gray-500 text-sm">{formatDuration(t.consultationTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* History View */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Last 30 Days</h2>
          </div>

          {history.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <TrendingUp className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>No reports available</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Skipped</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No Show</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {history.map((h) => (
                    <tr key={h.queueId} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap font-medium text-gray-900">
                        {formatDateDisplay(h.date)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-900">{h.total}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-green-600 font-medium">{h.completed}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-gray-600">{h.skipped}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-red-600">{h.noShow}</td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDate(h.date)
                            setViewMode('daily')
                          }}
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
