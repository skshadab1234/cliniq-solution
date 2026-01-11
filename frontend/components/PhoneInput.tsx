'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input/input'
import 'react-phone-number-input/style.css'
import { cn } from '@/lib/utils'
import { Label } from './ui/label'
import { error } from 'console'

interface PhoneInputProps {
  phone: string
  setPhone: (value: string) => void
  sendOtp: () => void
  setError: (value: string) => void
  error?: string
}

export function PhoneInputComponent ({
  phone,
  setPhone,
  sendOtp,
  setError,
  error
}: PhoneInputProps) {
  // validate number live
  const validatePhone = (value: string) => {
    if (!value) {
      setError('Phone number is required.')
      return false
    }

    if (!isValidPhoneNumber(value)) {
      setError('Enter a valid Indian phone number.')
      return false
    }

    if (!value.startsWith('+91') || value.length !== 13) {
      setError('Only valid 10-digit Indian numbers are allowed.')
      return false
    }

    setError('')
    return true
  }

  const handleChange = (value: string | undefined) => {
    const val = value || ''
    setPhone(val)
    validatePhone(val)
  }

  const handleSendOtp = () => {
    if (validatePhone(phone)) {
      sendOtp()
    }
  }

  return (
    <div className='space-y-4'>
      {/* Phone Input */}
      <div className='space-y-2'>
        <Label htmlFor='phone' className='font-semibold'>
          Your Number
        </Label>
        <PhoneInput
          value={phone}
          onChange={handleChange}
          placeholder='Enter 10-digit mobile number'
          country='IN'
          international={false}
          className={cn(
            'w-full rounded-md border px-4 py-3 text-base',
            'focus:outline-none focus:ring-2 focus:ring-primary',
            error
              ? 'border-red-500 focus:ring-red-500'
              : 'border-input bg-background text-foreground'
          )}
        />
        {error && <p className='text-sm text-red-500'>{error}</p>}
      </div>

      {/* Send Button */}
      <Button
        type='button'
        disabled={!!error || !phone} // disable if invalid
        className='w-full h-14 text-base font-medium'
        onClick={handleSendOtp}
      >
        Send OTP
      </Button>
    </div>
  )
}
