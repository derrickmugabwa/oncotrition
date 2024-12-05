'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>
  isLoading: boolean
}

export default function LoginForm({ onSubmit, isLoading }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(email, password)
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative max-w-md mx-auto"
        >
          <div className="relative backdrop-blur-lg bg-white/10 dark:bg-gray-800/10 rounded-2xl p-1">
            <div className="px-8 py-10">
              <h2 className="text-3xl font-bold text-center bg-gradient-to-r from-gray-800 to-gray-600 dark:from-gray-100 dark:to-gray-300 bg-clip-text text-transparent mb-8">
                Smartspoon Login
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl
                      border-2 border-transparent text-gray-700 dark:text-gray-200
                      focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none
                      transition-all duration-200 placeholder-transparent peer"
                    id="email"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="email"
                    className="absolute left-4 -top-6 text-sm text-gray-600 dark:text-gray-400
                      peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                      peer-placeholder-shown:top-3 peer-focus:-top-6 peer-focus:text-sm
                      peer-focus:text-blue-500 dark:peer-focus:text-blue-400
                      transition-all duration-200"
                  >
                    Email Address
                  </label>
                </div>

                <div className="relative">
                  <input
                    className="w-full px-4 py-3 bg-gray-50/50 dark:bg-gray-900/50 rounded-xl
                      border-2 border-transparent text-gray-700 dark:text-gray-200
                      focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none
                      transition-all duration-200 placeholder-transparent peer"
                    id="password"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="password"
                    className="absolute left-4 -top-6 text-sm text-gray-600 dark:text-gray-400
                      peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500
                      peer-placeholder-shown:top-3 peer-focus:-top-6 peer-focus:text-sm
                      peer-focus:text-blue-500 dark:peer-focus:text-blue-400
                      transition-all duration-200"
                  >
                    Password
                  </label>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="w-full py-3 px-6 text-white font-medium bg-gradient-to-r from-blue-500 to-blue-600
                    hover:from-blue-600 hover:to-blue-700 rounded-xl shadow-lg
                    transform transition-all duration-200 focus:outline-none
                    focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50
                    disabled:opacity-50 disabled:cursor-not-allowed"
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign In'}
                </motion.button>
              </form>

              <div className="mt-8 text-center">
                <Link 
                  href="#"
                  className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-500 
                    dark:hover:text-blue-400 transition-colors duration-200"
                >
                  Forgot your password?
                </Link>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
