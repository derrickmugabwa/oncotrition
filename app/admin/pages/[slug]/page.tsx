'use client'

import { useParams } from 'next/navigation'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SiteLogoTab from '@/components/admin/SiteLogoTab'
import SliderSettingsTab from '@/components/admin/SliderSettingsTab'
import HomepageFeaturesTab from '@/components/admin/HomepageFeaturesTab'
import TestimonialsTab from '@/components/admin/TestimonialsTab'
import StatisticsTab from '@/components/admin/StatisticsTab'

const pageNames = {
  home: 'Site Homepage',
  about: 'About Page',
  features: 'Features Page',
  pricing: 'Pricing Page',
  contact: 'Contact Page',
}

interface TabProps {
  label: string
  isActive: boolean
  onClick: () => void
}

const Tab = ({ label, isActive, onClick }: TabProps) => (
  <button
    onClick={onClick}
    className={`px-6 py-3 text-sm font-medium rounded-lg transition-all relative ${
      isActive 
        ? 'text-blue-600 bg-blue-50' 
        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
    }`}
  >
    {label}
    {isActive && (
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
        layoutId="activeTab"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      />
    )}
  </button>
)

export default function PageEditor() {
  const params = useParams()
  const slug = params.slug as string
  const pageName = pageNames[slug as keyof typeof pageNames] || 'Unknown Page'
  const [activeTab, setActiveTab] = useState('logo')

  const tabs = [
    { id: 'logo', label: 'Site Logo' },
    { id: 'slider', label: 'Slider Settings' },
    { id: 'features', label: 'Homepage Features' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'statistics', label: 'Statistics' }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pageName}</h1>
        <p className="text-gray-500">Customize your page appearance and content</p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <div className="flex space-x-2">
            {tabs.map((tab) => (
              <Tab
                key={tab.id}
                label={tab.label}
                isActive={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'logo' && <SiteLogoTab />}
          {activeTab === 'slider' && <SliderSettingsTab />}
          {activeTab === 'features' && <HomepageFeaturesTab />}
          {activeTab === 'testimonials' && <TestimonialsTab />}
          {activeTab === 'statistics' && <StatisticsTab />}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}