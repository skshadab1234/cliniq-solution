'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { adminAuthApi, AdminUser } from '@/lib/adminApi'

interface AdminAuthContextType {
  admin: AdminUser | null
  token: string | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminUser | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount (with SSR safety check)
  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsLoading(false)
      return
    }
    const storedToken = localStorage.getItem('admin_token')
    if (storedToken) {
      verifyToken(storedToken)
    } else {
      setIsLoading(false)
    }
  }, [])

  const verifyToken = async (storedToken: string) => {
    try {
      const response = await adminAuthApi.me(storedToken)
      setAdmin(response.admin)
      setToken(storedToken)
    } catch {
      // Token invalid, clear storage
      localStorage.removeItem('admin_token')
      setAdmin(null)
      setToken(null)
    } finally {
      setIsLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    const response = await adminAuthApi.login(email, password)
    setAdmin(response.admin)
    setToken(response.token)
    localStorage.setItem('admin_token', response.token)
  }

  const logout = () => {
    setAdmin(null)
    setToken(null)
    localStorage.removeItem('admin_token')
  }

  const value: AdminAuthContextType = {
    admin,
    token,
    isLoading,
    isAuthenticated: !!admin && !!token,
    login,
    logout
  }

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}
