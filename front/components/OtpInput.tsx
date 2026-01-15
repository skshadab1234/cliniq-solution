'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot
} from '@/components/ui/input-otp'
import { Label } from '@/components/ui/label'
import { Loader2, Repeat } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OtpInputProps {
  otp: string
  setOtp: (value: string) => void
  verifyOtp: () => void
  resendOtp: () => void
  loading?: boolean
  error?: string
  cooldown?: number
}

export function OtpInput ({
  otp,
  setOtp,
  verifyOtp,
  resendOtp,
  loading = false,
  error,
  cooldown = 60
}: OtpInputProps) {
  const [touched, setTouched] = React.useState(false)
  const [counter, setCounter] = React.useState(cooldown)

  React.useEffect(() => {
    if (counter > 0) {
      const timer = setTimeout(() => setCounter(counter - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [counter])

  const handleVerify = () => {
    setTouched(true)
    if (otp.length === 6) {
      verifyOtp()
    }
  }

  const handleResend = () => {
    if (counter === 0) {
      resendOtp()
      setOtp('') // clear OTP input on resend
      setCounter(cooldown)
      setTouched(false) // reset touched so error disappears
    }
  }

  return (
    <div className='space-y-6 w-full max-w-md mx-auto'>
      {/* Label */}
      <div className='space-y-2'>
        <Label htmlFor='otp' className='font-semibold text-base sm:text-lg'>
          Enter OTP
        </Label>

        {/* OTP Slots */}
        <InputOTP maxLength={6} value={otp} onChange={value => setOtp(value)}>
          <InputOTPGroup className='flex justify-center gap-2 sm:gap-3'>
            {Array.from({ length: 6 }).map((_, i) => (
              <InputOTPSlot
                key={i}
                index={i}
                className={cn(
                  i !== 0 ? 'ml-2 sm:ml-3' : '',
                  'w-11 h-11 sm:w-14 sm:h-14 text-lg sm:text-xl rounded-md border text-center',
                  'focus:ring-2 focus:ring-primary',
                  touched && otp.length < 6
                    ? 'border-red-500 focus:ring-red-500'
                    : 'border-input'
                )}
              />
            ))}
          </InputOTPGroup>
        </InputOTP>

        {/* Error */}
        {touched && otp.length < 6 && (
          <p className='text-sm text-red-500 mt-1'>
            Please enter a valid 6-digit OTP.
          </p>
        )}
        {error && <p className='text-sm text-red-500 mt-1'>{error}</p>}
      </div>

      {/* Verify Button */}
      <Button
        className='w-full h-12 sm:h-14 text-base sm:text-lg font-medium flex items-center justify-center gap-2'
        onClick={handleVerify}
        disabled={loading || otp.length < 6}
      >
        {loading && <Loader2 className='w-4 h-4 sm:w-5 sm:h-5 animate-spin' />}
        {loading ? 'Verifying...' : 'Verify OTP'}
      </Button>

      {/* Resend OTP */}
      <Button
        variant='outline'
        className='w-full h-12 sm:h-14 text-base sm:text-lg flex items-center justify-center gap-2'
        onClick={handleResend}
        disabled={counter > 0}
      >
        <Repeat className='w-4 h-4 sm:w-5 sm:h-5' />
        {counter > 0 ? `Resend OTP in ${counter}s` : 'Resend OTP'}
      </Button>
    </div>
  )
}
