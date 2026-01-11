'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useUser } from '@clerk/nextjs'
import { authApi, User } from '@/lib/api'

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  isPending: boolean
  isBlocked: boolean
  needsRegistration: boolean
  error: string | null
  refetch: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser()
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isPending, setIsPending] = useState(false)
  const [isBlocked, setIsBlocked] = useState(false)
  const [needsRegistration, setNeedsRegistration] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const verifyUser = async () => {
    if (!clerkUser) {
      setUser(null)
      setToken(null)
      setIsLoading(false)
      setIsPending(false)
      setIsBlocked(false)
      setNeedsRegistration(false)
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.verify(
        clerkUser.id,
        clerkUser.primaryEmailAddress?.emailAddress,
        clerkUser.fullName || clerkUser.firstName || 'User'
      )

      setUser(response.user)
      setToken(response.token)
      setIsPending(false)
      setIsBlocked(false)
      setNeedsRegistration(false)

      // Store token in localStorage
      localStorage.setItem('clinic_token', response.token)
    } catch (err: unknown) {
      const error = err as { status?: number; code?: string; message?: string }
      if (error.status === 404 || error.code === 'NOT_FOUND') {
        setNeedsRegistration(true)
        setUser(null)
        setToken(null)
      } else if (error.status === 403) {
        if (error.code === 'PENDING_APPROVAL') {
          setIsPending(true)
        } else if (error.code === 'BLOCKED') {
          setIsBlocked(true)
        }
        setUser(null)
        setToken(null)
      } else {
        setError(error.message || 'Authentication failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (clerkLoaded) {
      verifyUser()
    }
  }, [clerkLoaded, clerkUser?.id])

  // Check for stored token on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('clinic_token')
    if (storedToken && !token) {
      setToken(storedToken)
    }
  }, [])

  const value: AuthContextType = {
    user,
    token,
    isLoading: !clerkLoaded || isLoading,
    isAuthenticated: !!user && !!token && user.status === 'approved',
    isPending,
    isBlocked,
    needsRegistration,
    error,
    refetch: verifyUser
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
