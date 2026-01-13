'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import ThemeToggle from '@/components/ThemeToggle'
import {
  HomeIcon,
  InformationCircleIcon,
  SparklesIcon,
  CurrencyDollarIcon,
  EnvelopeIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BeakerIcon,
  NewspaperIcon,
  DocumentIcon,
  Bars3Icon,
  PencilSquareIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

const menuItems = [
  { name: 'Dashboard', href: '/admin', icon: ChartBarIcon },
  { name: 'Site Homepage', href: '/admin/pages/home', icon: HomeIcon },
  { name: 'About Page', href: '/admin/pages/about', icon: InformationCircleIcon },
  { name: 'Features Page', href: '/admin/pages/features', icon: SparklesIcon },
  { name: 'Mentorship Page', href: '/admin/pages/mentorship', icon: CurrencyDollarIcon },
  { name: 'SmartSpoon', href: '/admin/pages/smartspoon', icon: BeakerIcon },
  { name: 'Contact Page', href: '/admin/pages/contact', icon: EnvelopeIcon },
  { name: 'Blog Management', href: '/admin/pages/blog', icon: PencilSquareIcon },
  { name: 'Events & Announcements', href: '/admin/pages/events', icon: CalendarIcon },
  { name: 'Navigation Bar', href: '/admin/pages/navbar', icon: Bars3Icon },
  { name: 'Footer', href: '/admin/pages/footer', icon: NewspaperIcon },
  { name: 'Documents', href: '/admin/pages/documents', icon: DocumentIcon },
  { name: 'Site Settings', href: '/admin/settings', icon: Cog6ToothIcon },
]

interface SidebarProps {
  onClose?: () => void;
}

export default function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="h-full flex flex-col">
      {/* Logo and Theme Toggle */}
      <div className="p-6 flex items-center justify-between flex-shrink-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent"
        >
          Oncotrition
        </motion.div>
        <ThemeToggle />
      </div>

      {/* Navigation - Scrollable */}
      <nav className="flex-1 px-4 pb-4 overflow-y-auto scrollbar-thin">
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
                  onClick={() => onClose?.()}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200
                    ${isActive
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                >
                  <item.icon
                    className={`mr-3 h-5 w-5 transition-colors duration-200 ${
                      isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.name}
                  {isActive && (
                    <motion.div
                      className="absolute left-0 w-1 h-8 bg-emerald-600 dark:bg-emerald-400 rounded-r-full"
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

      {/* Settings Button - Removed as it's now in the menu */}
    </div>
  )
}
