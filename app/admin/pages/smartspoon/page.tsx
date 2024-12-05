'use client'

import { useState } from 'react'
import StepsTab from '@/components/admin/smartspoon/StepsTab'
import PackagesTab from '@/components/admin/smartspoon/PackagesTab'

export default function SmartSpoonAdminPage() {
  const [activeTab, setActiveTab] = useState('steps')

  const tabs = [
    { id: 'steps', label: 'Steps Section', component: StepsTab },
    { id: 'packages', label: 'SmartSpoon Packages', component: PackagesTab },
  ]

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || StepsTab

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          SmartSpoon Page Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Manage your SmartSpoon page content and layout.
        </p>
      </div>

      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`
                whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm
                ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-6">
        <ActiveComponent />
      </div>
    </div>
  )
}
