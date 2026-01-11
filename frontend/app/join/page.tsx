'use client'

import { useUser, SignOutButton } from '@clerk/nextjs'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import { authApi } from '@/lib/api'
import { toast } from 'sonner'
import { Loader2, UserPlus, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export default function JoinPage() {
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const { isAuthenticated, isPending, refetch } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'doctor' as 'doctor' | 'assistant'
  })
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; phone?: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const isValidEmail = (value: string) => {
    const v = value.trim()
    if (!v) return false
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
  }

  const normalizeIndianMobile = (raw: string) => {
    const digits = raw.replace(/\D/g, '')
    if (digits.startsWith('91') && digits.length === 12) return digits.slice(2)
    if (digits.startsWith('0') && digits.length === 11) return digits.slice(1)
    return digits
  }

  const isValidIndianMobile = (raw: string) => {
    const digits = normalizeIndianMobile(raw)
    return /^[6-9]\d{9}$/.test(digits)
  }

  const validateForm = () => {
    const errors: { name?: string; email?: string; phone?: string } = {}

    if (!formData.name.trim()) {
      errors.name = 'Full name is required'
    }

    if (!isValidEmail(formData.email)) {
      errors.email = 'Enter a valid email address'
    }

    if (!isValidIndianMobile(formData.phone)) {
      errors.phone = 'Enter a valid Indian mobile number (10 digits, starts with 6–9)'
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  useEffect(() => {
    if (clerkUser) {
      setFormData(prev => ({
        ...prev,
        name: clerkUser.fullName || clerkUser.firstName || '',
        email: clerkUser.primaryEmailAddress?.emailAddress || '',
        phone: clerkUser.primaryPhoneNumber?.phoneNumber || '',
      }))
    }
  }, [clerkUser])

  const canSubmit =
    !!formData.name.trim() &&
    isValidEmail(formData.email) &&
    isValidIndianMobile(formData.phone) &&
    !isSubmitting

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/')
    } else if (isPending) {
      router.push('/pending')
    }
  }, [isAuthenticated, isPending, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (name === 'name' && formErrors.name) setFormErrors(prev => ({ ...prev, name: undefined }))
    if (name === 'email' && formErrors.email) setFormErrors(prev => ({ ...prev, email: undefined }))
    if (name === 'phone' && formErrors.phone) setFormErrors(prev => ({ ...prev, phone: undefined }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!clerkUser) return

    const isValid = validateForm()
    if (!isValid) {
      toast.error('Please fix the highlighted fields')
      return
    }

    setIsSubmitting(true)

    try {
      await authApi.register({
        clerkId: clerkUser.id,
        email: formData.email,
        name: formData.name,
        phone: formData.phone,
        role: formData.role
      })

      setSubmitted(true)
      toast.success('Registration submitted successfully')

      // Refetch auth to update state
      await refetch()
    } catch (error: unknown) {
      const err = error as { message?: string; code?: string }
      if (err.code === 'CONFLICT') {
        toast.error('You have already submitted a registration request')
        setSubmitted(true)
      } else {
        toast.error(err.message || 'Registration failed')
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <UserPlus className="h-8 w-8 text-green-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Registration Submitted
          </h1>

          <p className="text-gray-600 mb-6">
            Your request has been submitted successfully. An administrator will review and approve your account shortly.
          </p>

          <div className="space-y-3">
            <Button
              className="w-full"
              onClick={() => router.push('/pending')}
            >
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Join Cliniq</h1>
          <p className="text-gray-600 mt-2">
            Complete your registration to get started
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              aria-invalid={!!formErrors.name}
              aria-describedby={formErrors.name ? 'join-name-error' : undefined}
              className={cn(formErrors.name && 'border-red-500 focus-visible:ring-red-500')}
            />
            {formErrors.name && (
              <p id="join-name-error" className="text-xs text-red-600 mt-1">
                {formErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              readOnly
              aria-invalid={!!formErrors.email}
              aria-describedby={formErrors.email ? 'join-email-error' : undefined}
              className={cn(
                'bg-gray-50 cursor-not-allowed',
                formErrors.email && 'border-red-500 focus-visible:ring-red-500'
              )}
            />
            <p className="text-xs text-gray-500 mt-1">From your Clerk account</p>
            {formErrors.email && (
              <p id="join-email-error" className="text-xs text-red-600 mt-1">
                {formErrors.email}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="10-digit Indian mobile (e.g., 9876543210)"
              inputMode="numeric"
              aria-invalid={!!formErrors.phone}
              aria-describedby={formErrors.phone ? 'join-phone-error' : undefined}
              className={cn(formErrors.phone && 'border-red-500 focus-visible:ring-red-500')}
            />
            {formErrors.phone && (
              <p id="join-phone-error" className="text-xs text-red-600 mt-1">
                {formErrors.phone}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="role">I am a</Label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="doctor">Doctor</option>
              <option value="assistant">Assistant / Receptionist</option>
            </select>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={!canSubmit}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <UserPlus className="h-4 w-4 mr-2" />
                Submit Registration
              </>
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <SignOutButton>
            <button className="text-sm text-gray-500 hover:text-gray-700">
              Sign out and use a different account
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  )
}
