'use client'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import React from 'react'

const Header = () => {
  return (
    <header className='bg-slate-50 shadow-lg border-b border-slate-200 sticky top-0 z-50'>
      <div className='md:container mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16 sm:h-20'>
          {/* Logo + Company */}
          <Link href='/' className='flex items-center space-x-2 sm:space-x-3'>
            <div className='flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-slate-800 rounded-xl shadow-md'>
              <span className='text-white font-bold text-lg sm:text-xl'>
                {process.env.NEXT_PUBLIC_COMPANY_NAME?.slice(0, 1)}
              </span>
            </div>
            <div className='flex flex-col'>
              <h1 className='text-lg sm:text-2xl font-bold text-slate-800'>
                {process.env.NEXT_PUBLIC_COMPANY_NAME}
              </h1>
              <p className='text-xs text-slate-500 font-medium tracking-wider hidden sm:block'>
                {process.env.NEXT_PUBLIC_COMPANY_DESCRIPTION}
              </p>
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
