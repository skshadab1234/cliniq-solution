'use client'

import { useState, useRef } from 'react'
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { Stethoscope, Loader2 } from 'lucide-react'
import { PhoneInputComponent } from './PhoneInput'
import { OtpInput } from './OtpInput'

export default function PhoneLogin () {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [confirmation, setConfirmation] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const recaptchaVerifier = useRef<RecaptchaVerifier | null>(null)

  const initRecaptcha = () => {
    if (!recaptchaVerifier.current) {
      recaptchaVerifier.current = new RecaptchaVerifier(
        auth as any,
        'recaptcha-container',
        { size: 'invisible' }
      )
      recaptchaVerifier.current.render()
    }
  }

  const sendOtp = async () => {
    if (!phone) return
    setLoading(true)
    try {
      initRecaptcha() // ensure recaptcha exists only once
      const result = await signInWithPhoneNumber(
        auth,
        phone,
        recaptchaVerifier.current!
      )
      setConfirmation(result)
    } catch (err) {
      console.error(err)
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const verifyOtp = async () => {
    if (!confirmation) return
    setLoading(true)
    try {
      await confirmation.confirm(otp)

      await storeSession()
    } catch (err) {
      console.error(err)
      setOtp('')
      setError('Invalid OTP')
    }
  }

  const storeSession = async () => {
    try {
      const user = auth.currentUser
      if (!user) return
      const session = {
        uid: user.uid,
        phone: user.phoneNumber,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        createdAt: new Date()
      }
      //   await setDoc(doc(db, 'sessions', user.uid), session)
      console.log(session)
    } catch (error) {
      console.error(error)
      setError('Failed to store session')
    }
  }

  return (
    <div className='p-5 py-20 space-y-3'>
      {/* Header */}
      <div className='space-y-2 mb-10'>
        <Stethoscope className='w-12 h-12 text-primary mb-2' />
        <h1 className='text-xl sm:text-2xl font-bold text-foreground'>
          Doctor Login
        </h1>
        <p className='text-muted-foreground text-sm sm:text-base'>
          Sign in securely with your mobile number
        </p>
      </div>

      {/* Phone Input */}
      {!confirmation && (
        <PhoneInputComponent
          phone={phone}
          setPhone={setPhone}
          sendOtp={sendOtp}
          setError={setError}
          error={error}
        />
      )}

      {/* OTP Input */}
      {confirmation && (
        <OtpInput
          otp={otp}
          setOtp={setOtp}
          verifyOtp={verifyOtp}
          resendOtp={sendOtp} // reuse sendOtp
          error={error}
        />
      )}

      {/* reCAPTCHA */}
      <div id='recaptcha-container'></div>

      {/* Global Loader */}
      {loading && (
        <div className='fixed inset-0 flex items-center justify-center bg-black/30 z-50'>
          <div className='bg-white p-4 rounded-lg shadow flex items-center gap-2'>
            <Loader2 className='w-5 h-5 animate-spin text-primary' />
            <span className='text-foreground font-medium'>Processing...</span>
          </div>
        </div>
      )}
    </div>
  )
}
