'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { usePublicSocket } from '@/hooks/useSocket'
import { publicApi } from '@/lib/api'
import { Loader2, Clock, User, Zap, CheckCircle, AlertCircle, XCircle, Wifi } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TokenData {
  tokenNumber: number
  status: string
  position: number | null
  currentToken: number | null
  estimatedWait: string | null
  queueStatus: string
  clinicName: string
  doctorName: string
  isEmergency?: boolean
}

export default function PatientQueueView() {
  const params = useParams()
  const tokenId = params.tokenId as string
  const [data, setData] = useState<TokenData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [queueId, setQueueId] = useState<number | null>(null)

  const { isConnected, subscribe } = usePublicSocket(queueId)

  const fetchToken = useCallback(async () => {
    try {
      const response = await publicApi.getToken(parseInt(tokenId))
      setData(response)
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Token not found')
    } finally {
      setIsLoading(false)
    }
  }, [tokenId])

  useEffect(() => {
    fetchToken()
    const interval = setInterval(fetchToken, 30000)
    return () => clearInterval(interval)
  }, [fetchToken])

  useEffect(() => {
    if (!subscribe) return

    const unsubs = [
      subscribe('token:called', () => fetchToken()),
      subscribe('token:status', () => fetchToken()),
      subscribe('queue:paused', () => fetchToken()),
      subscribe('queue:resumed', () => fetchToken()),
    ]

    return () => unsubs.forEach(unsub => unsub())
  }, [subscribe, fetchToken])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm text-gray-500 mt-3">Loading your token...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-50 p-4">
        <div className="text-center max-w-xs">
          <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-500" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">Token Not Found</h1>
          <p className="text-sm text-gray-500 mt-2 leading-relaxed">
            {error || 'This token may have expired or been cancelled.'}
          </p>
        </div>
      </div>
    )
  }

  const getStatusConfig = () => {
    switch (data.status) {
      case 'waiting':
        return {
          icon: <Clock className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: 'Waiting',
          color: 'text-amber-600',
          bg: 'bg-amber-50',
          border: 'border-amber-200',
          iconBg: 'bg-amber-100 text-amber-600'
        }
      case 'called':
        return {
          icon: <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 animate-pulse" />,
          text: 'YOUR TURN!',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-300',
          iconBg: 'bg-blue-100 text-blue-600'
        }
      case 'in_progress':
        return {
          icon: <User className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: 'In Consultation',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200',
          iconBg: 'bg-purple-100 text-purple-600'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: 'Completed',
          color: 'text-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-600'
        }
      case 'skipped':
        return {
          icon: <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: 'Skipped',
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200',
          iconBg: 'bg-orange-100 text-orange-600'
        }
      case 'no_show':
        return {
          icon: <XCircle className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: 'No Show',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200',
          iconBg: 'bg-red-100 text-red-600'
        }
      default:
        return {
          icon: <Clock className="h-6 w-6 sm:h-8 sm:w-8" />,
          text: data.status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200',
          iconBg: 'bg-gray-100 text-gray-600'
        }
    }
  }

  const status = getStatusConfig()

  const totalWait = (data.position || 1) + (data.currentToken ? data.tokenNumber - data.currentToken : 0)
  const progress = data.position ? Math.max(0, 100 - (data.position / Math.max(totalWait, 1)) * 100) : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Safe area padding for mobile */}
      <div className="max-w-md mx-auto px-4 py-6 pb-8 space-y-4">

        {/* Header - Clinic Info */}
        <div className="text-center pt-2">
          <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
            {data.clinicName}
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{data.doctorName}</p>
          {isConnected && (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mt-2">
              <Wifi className="h-3 w-3" />
              Live Updates
            </span>
          )}
        </div>

        {/* Token Display Card */}
        <div className={cn(
          'rounded-3xl p-6 sm:p-8 text-center border-2 shadow-sm',
          status.bg,
          status.border
        )}>
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Your Token
          </p>
          <div className="flex items-center justify-center gap-3">
            <p
              className="text-6xl sm:text-7xl font-black text-gray-900 leading-none"
              style={{ fontFeatureSettings: '"tnum"' }}
            >
              #{data.tokenNumber}
            </p>
            {data.isEmergency && (
              <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Zap className="h-5 w-5 text-orange-500" />
              </div>
            )}
          </div>
        </div>

        {/* Status Card */}
        <div className={cn(
          'rounded-2xl p-4 sm:p-5 border-2 shadow-sm',
          status.bg,
          status.border
        )}>
          <div className="flex items-center justify-center gap-3">
            <div className={cn('h-10 w-10 sm:h-12 sm:w-12 rounded-xl flex items-center justify-center', status.iconBg)}>
              {status.icon}
            </div>
            <span className={cn('text-xl sm:text-2xl font-bold', status.color)}>
              {status.text}
            </span>
          </div>

          {data.status === 'called' && (
            <p className="text-center text-sm sm:text-base text-blue-700 font-medium mt-3 animate-pulse">
              Please proceed to the doctor&apos;s room
            </p>
          )}

          {data.status === 'skipped' && (
            <p className="text-center text-sm text-orange-700 mt-3">
              Please contact the reception desk
            </p>
          )}
        </div>

        {/* Waiting Progress Section */}
        {data.status === 'waiting' && data.position && (
          <>
            {/* Progress Bar */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center text-sm mb-2">
                <span className="font-medium text-gray-700">Queue Progress</span>
                <span className="font-bold text-indigo-600">{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Position Cards */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm text-center">
                <p
                  className="text-3xl sm:text-4xl font-black text-gray-900"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {data.currentToken || '-'}
                </p>
                <p className="text-xs sm:text-sm font-medium text-gray-500 mt-1">
                  Now Serving
                </p>
              </div>
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-indigo-200 shadow-sm text-center bg-gradient-to-br from-indigo-50 to-purple-50">
                <p
                  className="text-3xl sm:text-4xl font-black text-indigo-600"
                  style={{ fontFeatureSettings: '"tnum"' }}
                >
                  {data.position}
                </p>
                <p className="text-xs sm:text-sm font-medium text-indigo-600 mt-1">
                  Your Position
                </p>
              </div>
            </div>

            {/* Estimated Wait */}
            {data.estimatedWait && (
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Estimated Wait</span>
                </div>
                <p className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mt-1">
                  {data.estimatedWait}
                </p>
              </div>
            )}
          </>
        )}

        {/* Queue Status Alerts */}
        {data.queueStatus === 'paused' && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-amber-800">
              Queue is temporarily paused
            </p>
          </div>
        )}

        {data.queueStatus === 'closed' && (
          <div className="bg-gray-100 border border-gray-200 rounded-2xl p-4 text-center">
            <p className="text-sm font-medium text-gray-700">
              Queue is closed for today
            </p>
          </div>
        )}

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 pt-2">
          This page updates automatically
        </p>
      </div>
    </div>
  )
}
