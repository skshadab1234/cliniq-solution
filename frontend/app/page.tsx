'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, SignInButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'

export default function HomePage() {
  const router = useRouter()
  const { user, isLoading, isAuthenticated, isPending, isBlocked, needsRegistration } = useAuth()

  useEffect(() => {
    if (isLoading) return

    if (isAuthenticated && user) {
      switch (user.role) {
        case 'admin':
          router.push('/admin')
          break
        case 'doctor':
          router.push('/doctor')
          break
        case 'assistant':
          router.push('/assistant')
          break
        default:
          break
      }
    } else if (isPending) {
      router.push('/pending')
    } else if (isBlocked) {
      router.push('/blocked')
    } else if (needsRegistration) {
      router.push('/join')
    }
  }, [isLoading, isAuthenticated, isPending, isBlocked, needsRegistration, user, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <SignedOut>
        <motion.div
          className="text-center space-y-6 p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="space-y-2">
            <h1 className="text-5xl font-bold text-gray-900">Cliniq</h1>
            <p className="text-xl text-gray-600">Real-time Queue Management for Clinics</p>
          </div>
          <div className="space-y-4 pt-4">
            <p className="text-gray-500">Sign in to manage your clinic queue</p>
            <SignInButton mode="modal">
              <Button size="lg" className="px-8 py-6 text-lg">
                Get Started
              </Button>
            </SignInButton>
          </div>
          <div className="pt-8 grid grid-cols-3 gap-6 max-w-md mx-auto text-center">
            <div>
              <p className="text-3xl font-bold text-blue-600">0</p>
              <p className="text-sm text-gray-500">Wait Chaos</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">Live</p>
              <p className="text-sm text-gray-500">Updates</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-blue-600">Easy</p>
              <p className="text-sm text-gray-500">To Use</p>
            </div>
          </div>
        </motion.div>
      </SignedOut>

      <SignedIn>
        <motion.div
          className="flex flex-col items-center gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </motion.div>
      </SignedIn>
    </div>
  )
}
