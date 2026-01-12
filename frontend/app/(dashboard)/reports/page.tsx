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
  TrendingUp,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn, formatDateDisplay } from '@/lib/utils'
import { PatientTrendChart, StatusPieChart, WeeklyComparisonChart } from '@/components/charts'

export default function ReportsPage() {
  const { token } = useAuth()
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0])
  const [report, setReport] = useState<DailyReport | null>(null)
  const [history, setHistory] = useState<ReportSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDownloading, setIsDownloading] = useState(false)
  const [viewMode, setViewMode] = useState<'daily' | 'analytics'>('daily')
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

    let minutes: number | null = null
    const digitsOnly = raw.replace(/\D/g, '')
    if (digitsOnly && digitsOnly.length === raw.length) {
      minutes = Number(raw)
    } else {
      const minMatch = raw.match(/(\d+)\s*(min|mins|minute|minutes)\b/i)
      if (minMatch) minutes = Number(minMatch[1])
    }

    if (minutes === null || Number.isNaN(minutes)) return raw
    if (minutes < 60) return `${minutes}m`

    const totalHours = Math.floor(minutes / 60)
    const remMinutes = minutes % 60
    return remMinutes > 0 ? `${totalHours}h ${remMinutes}m` : `${totalHours}h`
  }

  const formatStatusLabel = (status: string) => {
    return status.split('_').filter(Boolean).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      completed: 'bg-emerald-100 text-emerald-700',
      waiting: 'bg-amber-100 text-amber-700',
      called: 'bg-blue-100 text-blue-700',
      in_progress: 'bg-violet-100 text-violet-700',
      skipped: 'bg-gray-100 text-gray-700',
      no_show: 'bg-red-100 text-red-700',
      cancelled: 'bg-gray-100 text-gray-500'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  // Calculate analytics summary
  const analyticsSummary = {
    totalPatients: history.reduce((sum, h) => sum + h.total, 0),
    totalCompleted: history.reduce((sum, h) => sum + h.completed, 0),
    avgDaily: history.length > 0 ? Math.round(history.reduce((sum, h) => sum + h.total, 0) / history.length) : 0,
    completionRate: history.length > 0
      ? Math.round((history.reduce((sum, h) => sum + h.completed, 0) / Math.max(1, history.reduce((sum, h) => sum + h.total, 0))) * 100)
      : 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    )
  }

  return (
    <div className="space-y-4 sm:space-y-6 px-1 sm:px-0">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-1 bg-teal-500" />
        <div className="p-4 sm:p-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl bg-teal-500 flex items-center justify-center">
                <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Reports & Analytics</h1>
                <p className="text-xs sm:text-sm text-gray-500">Track performance and patient statistics</p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex bg-gray-100 rounded-xl p-1 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('daily')}
                className={cn(
                  'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
                  viewMode === 'daily'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Daily
              </button>
              <button
                onClick={() => setViewMode('analytics')}
                className={cn(
                  'flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all',
                  viewMode === 'analytics'
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <TrendingUp className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                Analytics
              </button>
            </div>
          </div>
        </div>
      </div>

      {viewMode === 'daily' ? (
        <>
          {/* Date Selector */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-3 sm:p-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => changeDate(-1)}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              <div className="flex items-center gap-2">
                <input
                  ref={dateInputRef}
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="sr-only"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = dateInputRef.current
                    if (!input) return
                    input.focus()
                    const showPicker = (input as HTMLInputElement & { showPicker?: () => void }).showPicker
                    if (showPicker) showPicker.call(input)
                    else input.click()
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-teal-600" />
                  <span className="font-semibold text-gray-900 text-sm sm:text-base">{formatDateDisplay(selectedDate) || selectedDate}</span>
                </button>
              </div>

              <button
                onClick={() => changeDate(1)}
                disabled={selectedDate >= new Date().toISOString().split('T')[0]}
                className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {report?.clinic && (
              <div className="mt-3 pt-3 border-t border-gray-100 text-center">
                <p className="text-xs sm:text-sm text-gray-500">
                  {report.clinic.name} {report.doctor && `• Dr. ${report.doctor.name}`}
                </p>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Total</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-900">{report?.summary.total || 0}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-emerald-600 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Completed</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-emerald-600">{report?.summary.completed || 0}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-gray-500 mb-1">
                <XCircle className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Skipped</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-gray-600">{report?.summary.skipped || 0}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-red-500 mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">No Show</span>
              </div>
              <p className="text-xl sm:text-2xl font-bold text-red-600">{report?.summary.noShow || 0}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-amber-500 mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Avg Wait</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatDuration(report?.summary.avgWaitTime)}</p>
            </div>

            <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-100 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-teal-500 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Avg Consult</span>
              </div>
              <p className="text-lg sm:text-xl font-bold text-gray-900">{formatDuration(report?.summary.avgConsultationTime)}</p>
            </div>
          </div>

          {/* Charts Row - Daily View */}
          {report && report.summary.total > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900">Status Distribution</h3>
              </div>
              <StatusPieChart
                completed={report.summary.completed}
                skipped={report.summary.skipped}
                noShow={report.summary.noShow}
                cancelled={report.summary.cancelled}
                waiting={report.summary.waiting}
              />
            </div>
          )}

          {/* Download Button */}
          {report && report.tokens.length > 0 && (
            <div className="flex justify-end">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-white rounded-xl font-medium text-sm hover:bg-teal-600 transition-colors disabled:opacity-50"
              >
                {isDownloading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Download CSV
              </button>
            </div>
          )}

          {/* Patients Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Patient Details</h2>
            </div>

            {!report || report.tokens.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm sm:text-base">No patient records for this date</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Token</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Patient</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Phone</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Status</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Wait</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden md:table-cell">Consult</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {report.tokens.map((t) => (
                      <tr key={t.id} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-gray-900 text-sm">#{t.tokenNumber}</span>
                            {t.isEmergency && <Zap className="h-3.5 w-3.5 text-orange-500" />}
                          </div>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-900 text-sm">{t.patientName}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-500 text-sm hidden sm:table-cell">{t.patientPhone}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                          <span className={cn('px-2 py-1 rounded-full text-[10px] sm:text-xs font-medium', getStatusColor(t.status))}>
                            {formatStatusLabel(t.status)}
                          </span>
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-500 text-sm hidden md:table-cell">{formatDuration(t.waitTime)}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-500 text-sm hidden md:table-cell">{formatDuration(t.consultationTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        /* Analytics View */
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <Users className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">30 Day Total</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{analyticsSummary.totalPatients}</p>
              <p className="text-xs opacity-80 mt-1">patients</p>
            </div>

            <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <CheckCircle2 className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Completed</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{analyticsSummary.totalCompleted}</p>
              <p className="text-xs opacity-80 mt-1">consultations</p>
            </div>

            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <Activity className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Daily Avg</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{analyticsSummary.avgDaily}</p>
              <p className="text-xs opacity-80 mt-1">patients/day</p>
            </div>

            <div className="bg-gradient-to-br from-violet-500 to-violet-600 rounded-xl sm:rounded-2xl p-4 sm:p-5 text-white">
              <div className="flex items-center gap-2 opacity-80 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] sm:text-xs font-medium uppercase">Success Rate</span>
              </div>
              <p className="text-2xl sm:text-3xl font-bold">{analyticsSummary.completionRate}%</p>
              <p className="text-xs opacity-80 mt-1">completion</p>
            </div>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {/* Patient Trend Chart */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Patient Trend (30 Days)</h3>
              </div>
              <PatientTrendChart data={history} />
            </div>

            {/* Weekly Comparison */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Weekly Comparison</h3>
              </div>
              <WeeklyComparisonChart data={history} />
            </div>
          </div>

          {/* Status Distribution for Last 30 Days */}
          {history.length > 0 && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-4">
                <PieChart className="h-5 w-5 text-teal-600" />
                <h3 className="font-semibold text-gray-900 text-sm sm:text-base">Overall Status Distribution</h3>
              </div>
              <div className="max-w-md mx-auto">
                <StatusPieChart
                  completed={analyticsSummary.totalCompleted}
                  skipped={history.reduce((sum, h) => sum + h.skipped, 0)}
                  noShow={history.reduce((sum, h) => sum + h.noShow, 0)}
                  cancelled={history.reduce((sum, h) => sum + (h.cancelled || 0), 0)}
                />
              </div>
            </div>
          )}

          {/* History Table */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-gray-100">
              <h2 className="font-semibold text-gray-900 text-sm sm:text-base">Daily History</h2>
            </div>

            {history.length === 0 ? (
              <div className="p-8 sm:p-12 text-center text-gray-500">
                <TrendingUp className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-gray-300 mb-3" />
                <p className="text-sm sm:text-base">No reports available</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Date</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Total</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase">Done</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">Skip</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase hidden sm:table-cell">No Show</th>
                      <th className="px-3 sm:px-4 py-2.5 sm:py-3 text-left text-[10px] sm:text-xs font-medium text-gray-500 uppercase"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {history.map((h) => (
                      <tr key={h.queueId} className="hover:bg-gray-50">
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap font-medium text-gray-900 text-sm">
                          {formatDateDisplay(h.date)}
                        </td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-900 text-sm">{h.total}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-emerald-600 font-medium text-sm">{h.completed}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-gray-600 text-sm hidden sm:table-cell">{h.skipped}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap text-red-600 text-sm hidden sm:table-cell">{h.noShow}</td>
                        <td className="px-3 sm:px-4 py-2.5 sm:py-3 whitespace-nowrap">
                          <button
                            onClick={() => {
                              setSelectedDate(h.date)
                              setViewMode('daily')
                            }}
                            className="text-xs text-teal-600 font-medium hover:text-teal-700"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
