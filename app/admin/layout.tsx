'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Sidebar from '@/components/admin/Sidebar'
import LoadingSpinner from '@/components/admin/LoadingSpinner'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isLoading, setIsLoading] = useState(true)
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    // Show loading state when pathname changes
    setIsLoading(true)
    
    // Hide loading state after a short delay
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [pathname]);

  if (isLoginPage) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="flex">
        {/* Sidebar with glass effect */}
        <div className="fixed h-screen w-64 bg-white/80 backdrop-blur-xl border-r border-gray-200/50 shadow-lg">
          <Sidebar />
        </div>

        {/* Main content */}
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl p-6 min-h-[calc(100vh-4rem)]">
              {isLoading && <LoadingSpinner />}
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
