// server-api.ts - Server-side API utilities for SSR
import { cookies } from 'next/headers'
import { auth } from '@clerk/nextjs/server'

const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

// Server-side request function
async function serverRequest<T>(endpoint: string, token?: string): Promise<T> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    method: 'GET',
    headers,
    cache: 'no-store', // Always fresh data for SSR
  })

  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      ...data
    }
  }

  return data
}

// Get auth token from cookies or verify with Clerk
export async function getServerToken(): Promise<string | null> {
  try {
    // First check cookies
    const cookieStore = await cookies()
    const tokenFromCookie = cookieStore.get('clinic_token')?.value

    if (tokenFromCookie) {
      return tokenFromCookie
    }

    // If no cookie, try to verify with Clerk and get a fresh token
    const { userId } = await auth()
    if (!userId) return null

    // Verify with backend to get token
    const response = await fetch(`${API_URL}/api/auth/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clerkId: userId }),
      cache: 'no-store',
    })

    if (!response.ok) return null

    const data = await response.json()
    return data.token || null
  } catch {
    return null
  }
}

// Types for server responses
export interface DoctorCurrentResponse {
  success: boolean
  queueStatus: string
  currentToken: {
    id: number
    tokenNumber: number
    status: string
    isEmergency: boolean
    patient?: {
      id: number
      name: string
      phone: string
    }
  } | null
  nextToken: {
    id: number
    tokenNumber: number
    status: string
    isEmergency: boolean
    patient?: {
      id: number
      name: string
      phone: string
    }
  } | null
  waitingCount: number
  queueId?: number
  cached?: boolean
}

export interface QueueResponse {
  success: boolean
  queue: {
    id: number
    status: string
    date: string
    doctorId: number
    clinicId: number
  }
  stats?: {
    total: number
    waiting: number
    completed: number
  }
}

export interface UserResponse {
  success: boolean
  user: {
    id: number
    name: string
    email: string
    role: string
    status: string
  }
}

// Server-side API functions
export const serverApi = {
  // Get doctor's current state (for SSR)
  getDoctorCurrent: async (token: string): Promise<DoctorCurrentResponse | null> => {
    try {
      return await serverRequest<DoctorCurrentResponse>('/api/doctor/current', token)
    } catch {
      return null
    }
  },

  // Get today's queue (for SSR)
  getQueueToday: async (token: string): Promise<QueueResponse | null> => {
    try {
      return await serverRequest<QueueResponse>('/api/queues/today', token)
    } catch {
      return null
    }
  },

  // Get current user (for SSR)
  getCurrentUser: async (token: string): Promise<UserResponse | null> => {
    try {
      return await serverRequest<UserResponse>('/api/auth/me', token)
    } catch {
      return null
    }
  }
}

// Combined SSR data fetch for doctor dashboard
export async function getDoctorDashboardData() {
  const token = await getServerToken()

  if (!token) {
    return {
      isAuthenticated: false,
      token: null,
      user: null,
      initialData: null
    }
  }

  const [userResponse, currentResponse, queueResponse] = await Promise.all([
    serverApi.getCurrentUser(token),
    serverApi.getDoctorCurrent(token),
    serverApi.getQueueToday(token)
  ])

  return {
    isAuthenticated: true,
    token,
    user: userResponse?.user || null,
    initialData: currentResponse ? {
      queueId: queueResponse?.queue?.id || currentResponse.queueId || null,
      queueStatus: currentResponse.queueStatus,
      currentToken: currentResponse.currentToken,
      nextToken: currentResponse.nextToken,
      waitingCount: currentResponse.waitingCount,
      cached: currentResponse.cached
    } : null
  }
}
