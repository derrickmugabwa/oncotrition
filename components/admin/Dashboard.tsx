'use client'

import SignOutButton from '@/components/admin/SignOutButton'

interface DashboardProps {
  userEmail: string | undefined
  userRole: string | undefined
}

export default function Dashboard({ userEmail, userRole }: DashboardProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <SignOutButton />
      </div>
      <div className="mt-8">
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <p className="text-gray-600 dark:text-gray-300">
            Welcome, {userEmail}
          </p>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Role: {userRole || 'No role assigned'}
          </p>
        </div>
      </div>
    </div>
  )
}
