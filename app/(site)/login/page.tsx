'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import LoginHero from '@/components/login/LoginHero'
import LoginForm from '@/components/login/LoginForm'
import { useAuth } from '@/contexts/AuthContext'
import { toast } from 'react-hot-toast'
import { motion } from 'framer-motion'

export default function Login() {
  const router = useRouter()
  const { signIn } = useAuth()
  const [loading, setLoading] = useState(false)

  const handleLogin = async (email: string, password: string) => {
    try {
      setLoading(true)
      await signIn(email, password)
      router.push('/admin') // Redirect to admin dashboard after successful login
      toast.success('Successfully logged in!')
    } catch (error) {
      console.error('Error logging in:', error)
      toast.error('Failed to log in. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Small particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          className="absolute w-1 h-1 bg-white/30 rounded-full"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -50, 0],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Content */}
      <div className="relative animate-fade-in">
        <LoginHero />
        <LoginForm onSubmit={handleLogin} isLoading={loading} />
      </div>
    </div>
  )
}