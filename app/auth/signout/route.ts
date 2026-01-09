import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = await createClient()

  // Sign out the user
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/admin/login', request.url), {
    status: 302,
  })
}
