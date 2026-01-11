'use client'

import { SignOutButton } from '@clerk/nextjs'
import { XCircle, LogOut, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function BlockedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 bg-red-100 rounded-full flex items-center justify-center">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Account Blocked
        </h1>

        <p className="text-gray-600 mb-6">
          Your account has been blocked by an administrator. If you believe this is an error, please contact support.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-red-800">
            You cannot access the application until your account is unblocked.
          </p>
        </div>

        <div className="space-y-3">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.location.href = 'mailto:support@cliniq.com'}
          >
            <Mail className="h-4 w-4 mr-2" />
            Contact Support
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
