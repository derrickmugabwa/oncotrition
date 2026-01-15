import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/supabase'

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to check if user is authenticated
export const isAuthenticated = async () => {
  const { data: { session }, error } = await supabase.auth.getSession()
  if (error) {
    console.error('Error checking authentication:', error.message)
    return false
  }
  return !!session
}

// Helper function to check if user is an admin
export const isAdmin = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) {
    return false
  }
  return user.user_metadata?.role === 'admin'
}

// Helper function for protected API routes
export const checkAdminAuth = async () => {
  const isUserAdmin = await isAdmin()
  if (!isUserAdmin) {
    throw new Error('Unauthorized: Admin access required')
  }
}
