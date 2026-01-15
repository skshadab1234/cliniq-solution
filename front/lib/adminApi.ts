const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3002'

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, token } = options

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const config: RequestInit = {
    method,
    headers,
  }

  if (body) {
    config.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_URL}${endpoint}`, config)
  const data = await response.json()

  if (!response.ok) {
    throw {
      status: response.status,
      ...data
    }
  }

  return data
}

export interface AdminUser {
  id: number
  email: string
  name: string
}

export interface User {
  id: number
  name: string
  email: string
  phone?: string
  role: 'doctor' | 'assistant'
  status: 'pending' | 'approved' | 'blocked'
  createdAt: string
}

export interface Clinic {
  id: number
  name: string
  address?: string
  phone?: string
}

export const adminAuthApi = {
  login: (email: string, password: string) =>
    request<{ success: boolean; token: string; admin: AdminUser }>('/api/admin-auth/login', {
      method: 'POST',
      body: { email, password }
    }),

  me: (token: string) =>
    request<{ success: boolean; admin: AdminUser }>('/api/admin-auth/me', { token }),

  getUsers: (token: string, status?: string) =>
    request<{ success: boolean; users: User[] }>(`/api/admin-auth/users${status ? `?status=${status}` : ''}`, { token }),

  approveUser: (token: string, userId: number, role: 'doctor' | 'assistant') =>
    request<{ success: boolean; user: User }>(`/api/admin-auth/users/${userId}/approve`, {
      method: 'PATCH',
      body: { role },
      token
    }),

  rejectUser: (token: string, userId: number) =>
    request<{ success: boolean }>(`/api/admin-auth/users/${userId}/reject`, {
      method: 'PATCH',
      token
    }),

  getClinics: (token: string) =>
    request<{ success: boolean; clinics: Clinic[] }>('/api/admin-auth/clinics', { token }),

  createClinic: (token: string, data: { name: string; address?: string; phone?: string }) =>
    request<{ success: boolean; clinic: Clinic }>('/api/admin-auth/clinics', {
      method: 'POST',
      body: data,
      token
    }),

  assignDoctor: (token: string, clinicId: number, userId: number) =>
    request<{ success: boolean }>('/api/admin-auth/assign-doctor', {
      method: 'POST',
      body: { clinicId, userId },
      token
    }),

  assignAssistant: (token: string, doctorId: number, assistantId: number) =>
    request<{ success: boolean }>('/api/admin-auth/assign-assistant', {
      method: 'POST',
      body: { doctorId, assistantId },
      token
    })
}
