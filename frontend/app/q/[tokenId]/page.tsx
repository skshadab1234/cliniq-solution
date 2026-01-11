'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { usePublicSocket } from '@/hooks/useSocket'
import { publicApi } from '@/lib/api'
import { Loader2, Clock, User, Zap, CheckCircle, AlertCircle, XCircle } from 'lucide-react'
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
      // Extract queueId from the response if needed
    } catch (err: unknown) {
      const error = err as { message?: string }
      setError(error.message || 'Token not found')
    } finally {
      setIsLoading(false)
    }
  }, [tokenId])

  useEffect(() => {
    fetchToken()
    // Refresh every 30 seconds as backup
    const interval = setInterval(fetchToken, 30000)
    return () => clearInterval(interval)
  }, [fetchToken])

  // Socket events
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
        <div className="text-center">
          <XCircle className="h-16 w-16 mx-auto text-red-400 mb-4" />
          <h1 className="text-xl font-bold text-gray-900">Token Not Found</h1>
          <p className="text-gray-500 mt-2">{error || 'This token may have expired or been cancelled.'}</p>
        </div>
      </div>
    )
  }

  const getStatusDisplay = () => {
    switch (data.status) {
      case 'waiting':
        return {
          icon: <Clock className="h-8 w-8 text-yellow-500" />,
          text: 'Waiting',
          color: 'text-yellow-600',
          bg: 'bg-yellow-50',
          border: 'border-yellow-200'
        }
      case 'called':
        return {
          icon: <AlertCircle className="h-8 w-8 text-blue-500 animate-pulse" />,
          text: 'YOUR TURN!',
          color: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-300'
        }
      case 'in_progress':
        return {
          icon: <User className="h-8 w-8 text-purple-500" />,
          text: 'In Consultation',
          color: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        }
      case 'completed':
        return {
          icon: <CheckCircle className="h-8 w-8 text-green-500" />,
          text: 'Completed',
          color: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        }
      case 'skipped':
        return {
          icon: <AlertCircle className="h-8 w-8 text-orange-500" />,
          text: 'Skipped',
          color: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200'
        }
      case 'no_show':
        return {
          icon: <XCircle className="h-8 w-8 text-red-500" />,
          text: 'No Show',
          color: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        }
      default:
        return {
          icon: <Clock className="h-8 w-8 text-gray-500" />,
          text: data.status,
          color: 'text-gray-600',
          bg: 'bg-gray-50',
          border: 'border-gray-200'
        }
    }
  }

  const status = getStatusDisplay()

  // Calculate progress
  const totalWait = (data.position || 1) + (data.currentToken ? data.tokenNumber - data.currentToken : 0)
  const progress = data.position ? Math.max(0, 100 - (data.position / Math.max(totalWait, 1)) * 100) : 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto space-y-6 pt-8">
        {/* Clinic Info */}
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-900">{data.clinicName}</h1>
          <p className="text-gray-500">{data.doctorName}</p>
          {isConnected && (
            <span className="inline-flex items-center gap-1 text-xs text-green-600 mt-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Live Updates
            </span>
          )}
        </div>

        {/* Token Card */}
        <div className={cn('rounded-2xl p-8 text-center border-2', status.bg, status.border)}>
          <p className="text-sm font-medium text-gray-500 uppercase mb-2">Your Token</p>
          <div className="flex items-center justify-center gap-2">
            <p className="text-7xl font-bold text-gray-900">#{data.tokenNumber}</p>
            {data.isEmergency && <Zap className="h-10 w-10 text-orange-500" />}
          </div>
        </div>

        {/* Status */}
        <div className={cn('rounded-xl p-6 border-2 text-center', status.bg, status.border)}>
          <div className="flex items-center justify-center gap-3 mb-2">
            {status.icon}
            <span className={cn('text-2xl font-bold', status.color)}>{status.text}</span>
          </div>

          {data.status === 'called' && (
            <p className="text-lg text-blue-800 animate-pulse">
              Please proceed to the doctor&apos;s room
            </p>
          )}

          {data.status === 'skipped' && (
            <p className="text-orange-700">
              Please contact the reception desk
            </p>
          )}
        </div>

        {/* Position & Wait Time */}
        {data.status === 'waiting' && data.position && (
          <>
            {/* Progress Bar */}
            <div className="bg-white rounded-xl p-6 border">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Queue Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-6 border text-center">
                <p className="text-3xl font-bold text-gray-900">{data.currentToken || '-'}</p>
                <p className="text-sm text-gray-500">Currently Serving</p>
              </div>
              <div className="bg-white rounded-xl p-6 border text-center">
                <p className="text-3xl font-bold text-blue-600">{data.position}</p>
                <p className="text-sm text-gray-500">Your Position</p>
              </div>
            </div>

            {/* Estimated Wait */}
            {data.estimatedWait && (
              <div className="bg-white rounded-xl p-6 border text-center">
                <div className="flex items-center justify-center gap-2">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <span className="text-gray-500">Estimated Wait</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">{data.estimatedWait}</p>
              </div>
            )}
          </>
        )}

        {/* Queue Status */}
        {data.queueStatus === 'paused' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <p className="text-yellow-800">Queue is temporarily paused</p>
          </div>
        )}
        {data.queueStatus === 'closed' && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-gray-800">Queue is closed for today</p>
          </div>
        )}

        {/* Auto-refresh notice */}
        <p className="text-center text-xs text-gray-400">
          This page updates automatically
        </p>
      </div>
    </div>
  )
}
