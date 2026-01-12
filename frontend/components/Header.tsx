'use client'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className='bg-white shadow-lg border-b border-slate-200 sticky top-0 z-50'>
      <div className='md:container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16 sm:h-20'>
          {/* Logo + Company */}
          <Link href='/' className='flex items-center space-x-3 sm:space-x-4 group'>
            {/* Professional Logo */}
            <div className='relative'>
              <div className='flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl shadow-lg group-hover:shadow-xl transition-shadow duration-300'>
                {/* Medical Cross Icon */}
                <svg
                  className='w-6 h-6 sm:w-8 sm:h-8 text-white'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2.5'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path d='M12 2v20M2 12h20' />
                  <circle cx='12' cy='12' r='10' strokeWidth='1.5' />
                </svg>
              </div>
              {/* Pulse animation dot */}
              <span className='absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse'></span>
            </div>

            {/* Brand Text */}
            <div className='flex flex-col'>
              <h1 className='text-lg sm:text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent'>
                {process.env.NEXT_PUBLIC_COMPANY_NAME}
              </h1>
              <p className='text-[10px] sm:text-xs text-slate-500 font-medium tracking-wide hidden sm:block'>
                {process.env.NEXT_PUBLIC_COMPANY_DESCRIPTION}
              </p>
              {/* PWS Coding Attribution */}
              <div className='flex items-center gap-1 mt-0.5'>
                <span className='text-[9px] sm:text-[10px] text-slate-400 font-medium'>by</span>
                <span className='text-[9px] sm:text-[10px] font-semibold bg-gradient-to-r from-slate-600 to-slate-800 bg-clip-text text-transparent'>
                  pwscoding.co.in
                </span>
              </div>
            </div>
          </Link>

          {/* Auth Section */}
          <div className='flex items-center space-x-3'>
            <SignedOut>
              <SignInButton
                component='button'
                mode='modal'
                oauthFlow='redirect'
                forceRedirectUrl={process.env.NEXT_PUBLIC_FRONTEND_URL}
                appearance={{
                  elements: {
                    signInButton:
                      'text-slate-600 hover:text-slate-800 font-medium px-4 py-2 rounded-lg transition-colors duration-200'
                  }
                }}
              />
            </SignedOut>

            <SignedIn>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 sm:w-10 sm:h-10',
                    userButtonPopoverCard: 'shadow-xl border-0',
                    userButtonPopoverActionButton: 'hover:bg-slate-50'
                  }
                }}
              />
            </SignedIn>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header
