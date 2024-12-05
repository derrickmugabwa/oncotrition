'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  HomeIcon,
  InformationCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Site Homepage', href: '/admin/pages/home', icon: HomeIcon },
  { name: 'About Page', href: '/admin/pages/about', icon: InformationCircleIcon },
  { name: 'Features Page', href: '/admin/pages/features', icon: SparklesIcon },
  { name: 'Mentorship Page', href: '/admin/pages/mentorship', icon: CurrencyDollarIcon },
  { name: 'SmartSpoon', href: '/admin/pages/smartspoon', icon: BeakerIcon },
  { name: 'Contact Page', href: '/admin/pages/contact', icon: EnvelopeIcon },
]

export default function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="h-full flex flex-col">
      {/* Logo */}
      <div className="p-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent"
        >
          Oncotrition
        </motion.div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 pb-4">
        <div className="space-y-1">
          {menuItems.map((item, index) => {
            const isActive = pathname === item.href
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Link
                  href={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-blue-50 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 w-1 h-8 bg-blue-600 rounded-r-full"
                      layoutId="activeTab"
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30
                      }}
                    />
                  )}
                </Link>
              </motion.div>
            )
          })}
        </div>
      </nav>

      {/* Settings Button */}
      <div className="p-4">
        <button
          className="w-full flex items-center px-4 py-3 text-sm font-medium text-gray-600 rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
        >
          <Cog6ToothIcon className="mr-3 h-5 w-5 text-gray-400" />
          Settings
        </button>
      </div>
    </div>
  )
}
