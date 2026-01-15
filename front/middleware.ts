import { clerkMiddleware } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

// Public routes that don't need auth check
const publicRoutes = ['/q', '/sign-in', '/sign-up']

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth()
  const { pathname } = req.nextUrl

  // Allow public routes
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  // If no user and trying to access protected route, let Clerk handle it
  if (!userId) {
    return NextResponse.next()
  }

  // Let the AuthContext handle role-based redirects on the client side
  return NextResponse.next()
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
