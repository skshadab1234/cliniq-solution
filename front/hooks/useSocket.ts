'use client'

import { useEffect, useState, useCallback } from 'react'
import { io, Socket } from 'socket.io-client'

const SOCKET_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

interface ServerToClientEvents {
  'queue:paused': (data: { queueId: number }) => void
  'queue:resumed': (data: { queueId: number }) => void
  'queue:closed': (data: { queueId: number; stats: unknown }) => void
  'token:added': (data: { token: unknown }) => void
  'token:called': (data: { tokenId: number; tokenNumber: number; patientName: string; isEmergency: boolean }) => void
  'token:status': (data: { tokenId: number; tokenNumber: number; status: string; position?: number }) => void
  'token:cancelled': (data: { tokenId: number; tokenNumber: number }) => void
}

interface ClientToServerEvents {
  'join:queue': (queueId: number) => void
  'leave:queue': (queueId: number) => void
}

export function useSocket(queueId: number | null) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!queueId) return

    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
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

  const subscribe = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) => {
    if (!socket) return () => {}

    socket.on(event as any, callback as any)
    return () => {
      socket.off(event as any, callback as any)
    }
  }, [socket])

  return { socket, isConnected, subscribe }
}

export function usePublicSocket(queueId: number | null) {
  const [socket, setSocket] = useState<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!queueId) return

    const newSocket: Socket<ServerToClientEvents, ClientToServerEvents> = io(SOCKET_URL, {
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

  const subscribe = useCallback(<K extends keyof ServerToClientEvents>(
    event: K,
    callback: ServerToClientEvents[K]
  ) => {
    if (!socket) return () => {}

    socket.on(event as any, callback as any)
    return () => {
      socket.off(event as any, callback as any)
    }
  }, [socket])

  return { isConnected, subscribe }
}
