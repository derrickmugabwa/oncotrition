'use client'

import { Toaster } from 'react-hot-toast'
import { usePathname } from 'next/navigation'

export default function AdminWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  // Login page has a different layout
  if (pathname === '/admin/login') {
    return (
      <>
        <Toaster position="top-right" />
        {children}
      </>
    )
  }

  // Admin dashboard layout
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <Toaster position="top-right" />
      <div className="py-6">
        <main>{children}</main>
      </div>
    </div>
  )
}
