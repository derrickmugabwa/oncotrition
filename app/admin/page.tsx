'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Database } from '@/types/supabase'
import { RiPagesLine, RiTeamLine, RiStarLine, RiLayoutMasonryLine } from 'react-icons/ri'
import { IoLogOutOutline } from 'react-icons/io5'
import { FiEdit3, FiClock, FiCalendar, FiUsers, FiFileText } from 'react-icons/fi'
import { HiOutlineNewspaper } from 'react-icons/hi'
import Link from 'next/link'
import { format } from 'date-fns'

type ContentItem = {
  id: string
  created_at: string
  updated_at: string
  title: string
  content: string
  type: string
  status: 'draft' | 'published'
  author_id: string
  metadata: any
}

type Stats = {
  totalBlogPosts: number
  totalEvents: number
  totalRegistrations: number
  totalFormSubmissions: number
  publishedPosts: number
  upcomingEvents: number
}

type PageUpdate = ContentItem

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

export default function AdminPage() {
  const router = useRouter()
  const supabase = createClient()
  const [stats, setStats] = useState<Stats>({
    totalBlogPosts: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    totalFormSubmissions: 0,
    publishedPosts: 0,
    upcomingEvents: 0
  })
  const [recentUpdates, setRecentUpdates] = useState<PageUpdate[]>([])
  const [userEmail, setUserEmail] = useState<string>('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        router.replace('/admin/login')
      } else {
        setUserEmail(session.user.email || '')
      }
    }

    checkSession()
  }, [router, supabase])

  useEffect(() => {
    const fetchStats = async () => {
      // Fetch total blog posts
      const { count: blogPostsCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })

      // Fetch published blog posts
      const { count: publishedPostsCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')

      // Fetch total events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' })

      // Fetch upcoming events
      const { count: upcomingEventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact' })
        .eq('status', 'upcoming')

      // Fetch total NutriVibe registrations
      const { count: registrationsCount } = await supabase
        .from('nutrivibe_registrations')
        .select('*', { count: 'exact' })

      // Fetch total form submissions
      const { count: formSubmissionsCount } = await supabase
        .from('form_submissions')
        .select('*', { count: 'exact' })

      setStats({
        totalBlogPosts: blogPostsCount || 0,
        totalEvents: eventsCount || 0,
        totalRegistrations: registrationsCount || 0,
        totalFormSubmissions: formSubmissionsCount || 0,
        publishedPosts: publishedPostsCount || 0,
        upcomingEvents: upcomingEventsCount || 0
      })
    }

    const fetchRecentUpdates = async () => {
      // Fetch recent blog posts
      const { data: blogData } = await supabase
        .from('blog_posts')
        .select('id, title, updated_at, status, created_at')
        .order('updated_at', { ascending: false })
        .limit(5)

      if (blogData) {
        const formattedData = blogData.map(post => ({
          id: post.id,
          title: post.title,
          updated_at: post.updated_at ?? new Date().toISOString(),
          created_at: post.created_at ?? new Date().toISOString(),
          content: '',
          type: 'blog_post',
          status: post.status as 'draft' | 'published',
          author_id: '',
          metadata: {}
        }))
        setRecentUpdates(formattedData)
      }
    }

    Promise.all([fetchStats(), fetchRecentUpdates()])
      .finally(() => setIsLoading(false))
  }, [supabase])

  if (isLoading) {
    return <div>Loading...</div>
  }

  const quickActions = [
    {
      title: 'Manage Blog',
      description: 'Create and edit blog posts',
      onClick: () => router.push('/admin/pages/blog'),
      Icon: HiOutlineNewspaper,
      gradient: 'from-blue-500 to-cyan-400'
    },
    {
      title: 'Manage Events',
      description: 'Add or update events',
      onClick: () => router.push('/admin/pages/events'),
      Icon: FiCalendar,
      gradient: 'from-purple-500 to-pink-400'
    },
    {
      title: 'Edit Homepage',
      description: 'Update your site\'s main landing page',
      onClick: () => router.push('/admin/pages/home'),
      Icon: RiLayoutMasonryLine,
      gradient: 'from-orange-500 to-amber-400'
    }
  ]

  const statsDisplay = [
    { 
      label: 'Blog Posts', 
      value: stats.totalBlogPosts, 
      subValue: `${stats.publishedPosts} published`,
      Icon: HiOutlineNewspaper, 
      gradient: 'from-blue-500 to-cyan-400' 
    },
    { 
      label: 'Events', 
      value: stats.totalEvents, 
      subValue: `${stats.upcomingEvents} upcoming`,
      Icon: FiCalendar, 
      gradient: 'from-purple-500 to-pink-400' 
    },
    { 
      label: 'Registrations', 
      value: stats.totalRegistrations, 
      subValue: 'NutriVibe',
      Icon: FiUsers, 
      gradient: 'from-orange-500 to-amber-400' 
    },
    { 
      label: 'Form Submissions', 
      value: stats.totalFormSubmissions, 
      subValue: 'Contact forms',
      Icon: FiFileText, 
      gradient: 'from-green-500 to-emerald-400' 
    },
  ]

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-400">
            Dashboard Overview
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Welcome back, {userEmail}</p>
        </div>
        <button
          onClick={async () => {
            await supabase.auth.signOut()
            router.replace('/admin/login')
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all hover:scale-105 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
        >
          <IoLogOutOutline className="w-5 h-5" />
          Sign Out
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsDisplay.map((stat) => (
          <motion.div
            key={stat.label}
            variants={itemVariants}
            className="relative overflow-hidden bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm hover:shadow-md transition-all hover:scale-105 group"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${stat.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />
            <div className="flex items-center justify-between mb-4">
              <div className="text-gray-500 dark:text-gray-400 text-sm font-medium">{stat.label}</div>
              <stat.Icon className={`w-8 h-8 bg-gradient-to-r ${stat.gradient} p-1.5 rounded-lg text-white`} />
            </div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
            {'subValue' in stat && (
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-2">{stat.subValue}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Updates */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-3 mb-6">
            <FiClock className="w-6 h-6 text-gray-400" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Updates</h2>
          </div>
          <div className="space-y-4">
            {recentUpdates.length > 0 ? (
              recentUpdates.map((update) => (
                <motion.div
                  key={update.id}
                  variants={itemVariants}
                  className="flex items-center justify-between py-3 px-4 border border-gray-100 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium text-gray-900 dark:text-white">{update.title}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        update.status === 'published' 
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                          : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                      }`}>
                        {update.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      Updated {format(new Date(update.updated_at), 'MMM d, yyyy')}
                    </div>
                  </div>
                  <Link 
                    href="/admin/pages/blog"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                  >
                    <span className="text-sm">Edit</span>
                    <FiEdit3 className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <HiOutlineNewspaper className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent updates</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Quick Actions</h2>
          <div className="space-y-4">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                variants={itemVariants}
                onClick={action.onClick}
                className="w-full group relative overflow-hidden rounded-xl hover:shadow-md transition-all hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-r ${action.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative flex items-center gap-4 px-6 py-4 bg-gray-50 dark:bg-gray-700/50 group-hover:bg-transparent transition-colors">
                  <action.Icon className={`w-8 h-8 bg-gradient-to-r ${action.gradient} p-1.5 rounded-lg text-white`} />
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-white group-hover:text-white transition-colors">
                      {action.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 group-hover:text-white/80 transition-colors">
                      {action.description}
                    </div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  )
}
