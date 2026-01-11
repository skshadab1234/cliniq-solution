'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignOutButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Clock, RefreshCw, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PendingPage() {
  const router = useRouter()
  const { isAuthenticated, isPending, refetch } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, router])

  const handleCheckStatus = async () => {
    await refetch()
  }

  if (!isPending) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 to-orange-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-yellow-100 rounded-full flex items-center justify-center">
          <Clock className="h-8 w-8 text-yellow-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Pending Approval
        </h1>

        <p className="text-gray-600 mb-6">
          Your registration request has been submitted. An administrator will review and approve your account shortly.
        </p>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-yellow-800">
            You&apos;ll be able to access your dashboard once your account is approved.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCheckStatus}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Check Status
          </Button>

          <SignOutButton>
            <Button variant="ghost" className="w-full text-gray-500">
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}
