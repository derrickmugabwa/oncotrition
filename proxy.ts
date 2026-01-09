import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
}

export async function proxy(req: NextRequest) {
  // Skip auth check for M-Pesa callback routes
  if (req.nextUrl.pathname.startsWith('/api/mpesa/callback')) {
    return NextResponse.next()
  }

  // Add CORS headers for API routes
  if (req.nextUrl.pathname.startsWith('/api/')) {
    const res = NextResponse.next()
    res.headers.set('Access-Control-Allow-Origin', '*')
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    return res
  }

  // Update session and handle authentication
  const { supabaseResponse, user } = await updateSession(req)

  // If user is not authenticated and trying to access admin pages (except login)
  if (!user && req.nextUrl.pathname.startsWith('/admin') && req.nextUrl.pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // If user is authenticated and trying to access login page, redirect to admin
  if (user && req.nextUrl.pathname === '/admin/login') {
    return NextResponse.redirect(new URL('/admin', req.url))
  }

  return supabaseResponse
}
