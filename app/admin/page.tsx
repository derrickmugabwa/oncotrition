'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const stats = [
  { label: 'Total Pages', value: '5' },
  { label: 'Active Users', value: '127' },
  { label: 'Total Views', value: '1.4k' },
  { label: 'Avg. Time', value: '2m 35s' },
]

const recentUpdates = [
  { page: 'Home Page', time: '2 hours ago', user: 'Admin' },
  { page: 'About Page', time: '1 day ago', user: 'Admin' },
  { page: 'Features', time: '3 days ago', user: 'Admin' },
]

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin/login')
      }
    }

    checkSession()
  }, [router, supabase])

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace('/admin/login')
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="text-gray-500 text-sm">{stat.label}</div>
            <div className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Updates */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Updates</h2>
          <div className="space-y-4">
            {recentUpdates.map((update, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div>
                  <div className="font-medium text-gray-900">{update.page}</div>
                  <div className="text-sm text-gray-500">Updated {update.time} by {update.user}</div>
                </div>
                <button className="text-blue-500 hover:text-blue-600">View</button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="space-y-4">
            <button className="w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Edit Homepage</div>
              <div className="text-sm text-gray-500">Update your site's main landing page</div>
            </button>
            <button className="w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">Manage Content</div>
              <div className="text-sm text-gray-500">Add or edit your site's content</div>
            </button>
            <button className="w-full px-4 py-3 text-left bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="font-medium text-gray-900">View Analytics</div>
              <div className="text-sm text-gray-500">Check your site's performance</div>
            </button>
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
