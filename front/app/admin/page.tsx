'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/context/AdminAuthContext'
import { Loader2 } from 'lucide-react'

export default function AdminPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAdminAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated) {
      router.push('/admin/dashboard')
    } else {
      router.push('/admin/login')
    }
  }, [isAuthenticated, isLoading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
    </div>
  )
}
