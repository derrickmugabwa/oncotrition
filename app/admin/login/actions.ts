import { supabase } from '@/utils/supabase'

export async function loginAction(email: string, password: string) {
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // If no account exists, create the first admin
      if (signInError.message.includes('Invalid login credentials')) {
        const { data: { user }, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'admin' },
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/admin`
          }
        })

        if (signUpError) {
          return { success: false, message: signUpError.message }
        }

        if (user) {
          return { 
            success: false, 
            message: 'Admin account created! Please check your email to verify your account.' 
          }
        }
      }
      
      return { success: false, message: signInError.message }
    }

    if (!signInData?.user) {
      return { success: false, message: 'Login failed. Please try again.' }
    }

    // Ensure user has admin role
    if (!signInData.user.user_metadata?.role) {
      const { error: updateError } = await supabase.auth.updateUser({
        data: { role: 'admin' }
      })

      if (updateError) {
        await supabase.auth.signOut()
        return { success: false, message: 'Failed to set admin role.' }
      }
    }

    return { success: true }
  } catch (error: any) {
    return { 
      success: false, 
      message: error.message || 'An error occurred during login.' 
    }
  }
}
