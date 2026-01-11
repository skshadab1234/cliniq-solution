'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignedIn, SignedOut, RedirectToSignIn, UserButton } from '@clerk/nextjs'
import { useAuth } from '@/context/AuthContext'
import { Loader2, LayoutDashboard, Users, Building2, FileText, Menu, X, UserCheck } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const { user, isLoading, isAuthenticated, isPending, isBlocked, needsRegistration } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (isPending) {
      router.push('/pending')
    } else if (isBlocked) {
      router.push('/blocked')
    } else if (needsRegistration) {
      router.push('/join')
    }
  }, [isLoading, isPending, isBlocked, needsRegistration, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    )
  }

  const navItems = [
    ...(user?.role === 'admin' ? [
      { href: '/admin', label: 'Users', icon: Users },
      { href: '/admin/clinics', label: 'Clinics', icon: Building2 },
    ] : []),
    ...(user?.role === 'doctor' ? [
      { href: '/doctor', label: 'Queue', icon: LayoutDashboard },
      { href: '/doctor/assistants', label: 'Assistants', icon: UserCheck },
      { href: '/reports', label: 'Reports', icon: FileText },
    ] : []),
    ...(user?.role === 'assistant' ? [
      { href: '/assistant', label: 'Queue', icon: LayoutDashboard },
      { href: '/assistant/patients', label: 'Patients', icon: Users },
      { href: '/reports', label: 'Reports', icon: FileText },
    ] : []),
  ]

  return (
    <>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
      <SignedIn>
        {isAuthenticated ? (
          <div className="min-h-screen bg-slate-50">
            {isMobileMenuOpen && (
              <div className="fixed inset-0 z-50 md:hidden">
                <button
                  type="button"
                  aria-label="Close menu"
                  className="absolute inset-0 bg-black/40"
                  onClick={() => setIsMobileMenuOpen(false)}
                />
                <div className="absolute top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl border-l border-gray-200">
                  <div className="flex items-center justify-between px-4 h-16 border-b border-gray-200">
                    <span className="text-base font-semibold text-gray-900">Menu</span>
                    <button
                      type="button"
                      aria-label="Close menu"
                      className="inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="px-3 py-3">
                    <div className="px-3 py-2 text-sm text-gray-600">
                      <span className="font-medium text-gray-900">{user?.name}</span>
                      <span className="text-gray-400 ml-2 capitalize">({user?.role})</span>
                    </div>
                    <nav className="mt-2 flex flex-col gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          onClick={() => setIsMobileMenuOpen(false)}
                          className={cn(
                            'flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-700 hover:bg-gray-100'
                          )}
                        >
                          <item.icon className="h-5 w-5" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="mt-4 px-3">
                      <div className="inline-flex">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center gap-8">
                    <Link href="/" className="flex items-center gap-2">
                      <span className="text-xl font-bold text-blue-600">Cliniq</span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-1">
                      {navItems.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={cn(
                            'flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                            pathname === item.href
                              ? 'bg-blue-50 text-blue-700'
                              : 'text-gray-600 hover:bg-gray-100'
                          )}
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                      ))}
                    </nav>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      aria-label="Open menu"
                      className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md hover:bg-gray-100"
                      onClick={() => setIsMobileMenuOpen(true)}
                    >
                      <Menu className="h-5 w-5" />
                    </button>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{user?.name}</span>
                      <span className="text-gray-400 ml-2 capitalize">({user?.role})</span>
                    </div>
                    <UserButton afterSignOutUrl="/" />
                  </div>
                </div>
              </div>
            </header>

            {/* Main content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              {children}
            </main>
          </div>
        ) : (
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        )}
      </SignedIn>
    </>
  )
}
