'use client';

import { useState } from 'react';
import ContactSubmissionsTab from '@/components/admin/contact/ContactSubmissionsTab';
import ContactInformationTab from '@/components/admin/contact/ContactInformationTab';
import { motion } from 'framer-motion';

export default function ContactPage() {
  const [activeTab, setActiveTab] = useState('submissions');

  const tabs = [
    { id: 'submissions', label: 'Contact Submissions' },
    { id: 'information', label: 'Contact Information' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Contact Management</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Manage contact form submissions and contact information displayed on the website.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  py-4 px-1 inline-flex items-center border-b-2 font-medium text-sm
                  ${activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'submissions' ? (
          <ContactSubmissionsTab />
        ) : (
          <ContactInformationTab />
        )}
      </motion.div>
    </div>
  );
}
