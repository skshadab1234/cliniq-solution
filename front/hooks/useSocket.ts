'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

interface SocketEvents {
  'queue:paused': { queueId: number }
  'queue:resumed': { queueId: number }
  'queue:closed': { queueId: number; stats: unknown }
  'token:added': { token: unknown }
  'token:called': { tokenId: number; tokenNumber: number; patientName: string; isEmergency: boolean }
  'token:status': { tokenId: number; tokenNumber: number; status: string; position?: number }
  'token:cancelled': { tokenId: number; tokenNumber: number }
}

export function useSocket(queueId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!queueId) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join:queue', queueId)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('leave:queue', queueId)
      newSocket.disconnect()
    }
  }, [queueId])

  const subscribe = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) => {
    if (!socket) return () => {}

    socket.on(event, callback)
    return () => {
      socket.off(event, callback)
    }
  }, [socket])

  return { socket, isConnected, subscribe }
}

export function usePublicSocket(queueId: number | null) {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!queueId) return

    const newSocket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    })

    newSocket.on('connect', () => {
      setIsConnected(true)
      newSocket.emit('join:queue', queueId)
    })

    newSocket.on('disconnect', () => {
      setIsConnected(false)
    })

    setSocket(newSocket)

    return () => {
      newSocket.emit('leave:queue', queueId)
      newSocket.disconnect()
    }
  }, [queueId])

  const subscribe = useCallback(<K extends keyof SocketEvents>(
    event: K,
    callback: (data: SocketEvents[K]) => void
  ) => {
    if (!socket) return () => {}

    socket.on(event, callback)
    return () => {
      socket.off(event, callback)
    }
  }, [socket])

  return { isConnected, subscribe }
}
