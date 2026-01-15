'use client'

import { useNetworkStatus } from '@/app/hooks/useNetworkStatus'
import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { CheckCircle, WifiOff, AlertTriangle } from 'lucide-react'

export default function NetworkToast () {
  const status = useNetworkStatus()
  const prev = useRef(status)

  useEffect(() => {
    // Helper: detect low network
    const isLow = (s: typeof status) => {
      if (!s.isOnline) return false
      if (s.effectiveType && ['2g', 'slow-2g', '3g'].includes(s.effectiveType))
        return true
      if (s.downlink !== undefined && s.downlink < 1) return true
      if (s.rtt !== undefined && s.rtt > 500) return true
      return false
    }

    const wasLow = isLow(prev.current)
    const nowLow = isLow(status)

    // Case 1: Went offline
    if (prev.current.isOnline && !status.isOnline) {
      toast(
        <div className='flex items-center gap-2'>
          <WifiOff className='text-red-500 w-5 h-5' />
          <div>
            <strong>No Internet Connection</strong>
            <div className='text-sm text-gray-600'>
              Some features may not work offline.
            </div>
          </div>
        </div>,
        { duration: 5000 }
      )
    }

    // Case 2: Came back online
    if (!prev.current.isOnline && status.isOnline) {
      toast(
        <div className='flex items-center gap-2'>
          <CheckCircle className='text-green-500 w-5 h-5' />
          <div>
            <strong>Back Online</strong>
            <div className='text-sm text-gray-600'>
              All features are working.
            </div>
          </div>
        </div>,
        { duration: 3000 }
      )
    }

    // Case 3: Normal → Low
    if (!wasLow && nowLow) {
      toast(
        <div className='flex items-center gap-2'>
          <AlertTriangle className='text-yellow-500 w-5 h-5' />
          <div>
            <strong>Weak Network</strong>
            <div className='text-sm text-gray-600'>
              Your connection is unstable. Some features may lag.
            </div>
          </div>
        </div>,
        { duration: 4000 }
      )
    }

    // Case 4: Low → Normal
    if (wasLow && !nowLow && status.isOnline) {
      toast(
        <div className='flex items-center gap-2'>
          <CheckCircle className='text-green-500 w-5 h-5' />
          <div>
            <strong>Connection Stable</strong>
            <div className='text-sm text-gray-600'>
              You're back to good speed.
            </div>
          </div>
        </div>,
        { duration: 3000 }
      )
    }

    prev.current = status // update tracker
  }, [status])

  return null
}
