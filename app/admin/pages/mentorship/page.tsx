'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import MentorshipFeaturesTab from '@/components/admin/mentorship/MentorshipFeaturesTab';
import PackagesTab from '@/components/admin/mentorship/PackagesTab';
import SubmissionsTab from '@/components/admin/mentorship/SubmissionsTab';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function MentorshipAdminPage() {
  const tabs = [
    { name: 'Mentorship Features', component: <MentorshipFeaturesTab /> },
    { name: 'Packages', component: <PackagesTab /> },
    { name: 'Submissions', component: <SubmissionsTab /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <div className="max-w-3xl mb-8">
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-4"
        >
          Mentorship Page Management
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-gray-600 dark:text-gray-300"
        >
          Manage your mentorship page content, packages, and user submissions.
        </motion.p>
      </div>

      <Tab.Group>
        <Tab.List className="flex flex-wrap gap-2 p-2 rounded-2xl bg-gradient-to-r from-emerald-50/50 to-teal-50/50 dark:from-emerald-900/10 dark:to-teal-900/10 shadow-lg backdrop-blur-sm">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'px-6 py-3 text-sm font-medium rounded-xl transition-all duration-200',
                  'focus:outline-none',
                  selected
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/20 scale-105 hover:shadow-lg'
                    : 'bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-8">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-2xl bg-white dark:bg-gray-800/80 p-6 shadow-xl backdrop-blur-sm',
                'ring-white/60 ring-offset-2 ring-offset-emerald-400 focus:outline-none focus:ring-2'
              )}
            >
              {tab.component}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </motion.div>
  );
}
