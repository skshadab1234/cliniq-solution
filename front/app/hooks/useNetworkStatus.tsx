import { useEffect, useState } from 'react'

type NetworkStatus = {
  isOnline: boolean
  effectiveType?: string // like '4g', '3g', '2g', 'slow-2g'
  downlink?: number // Mbps approx
  rtt?: number // latency ms
}

type NetworkInformation = EventTarget & {
  effectiveType?: string
  downlink?: number
  rtt?: number
}

type NavigatorWithConnection = Navigator & {
  connection?: NetworkInformation
  mozConnection?: NetworkInformation
  webkitConnection?: NetworkInformation
}

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>({
    isOnline: true,
    effectiveType: '4g',
    downlink: undefined,
    rtt: undefined
  })

  const updateNetwork = () => {
    const nav = navigator as NavigatorWithConnection
    const connection = nav.connection || nav.mozConnection || nav.webkitConnection
    setStatus({
      isOnline: navigator.onLine,
      effectiveType: connection?.effectiveType,
      downlink: connection?.downlink,
      rtt: connection?.rtt
    })
  }

  useEffect(() => {
    updateNetwork()

    window.addEventListener('online', updateNetwork)
    window.addEventListener('offline', updateNetwork)

    const connection = (navigator as NavigatorWithConnection).connection
    if (connection) {
      connection.addEventListener('change', updateNetwork)
    }

    return () => {
      window.removeEventListener('online', updateNetwork)
      window.removeEventListener('offline', updateNetwork)
      if (connection) {
        connection.removeEventListener('change', updateNetwork)
      }
    }
  }, [])

  return status
}
