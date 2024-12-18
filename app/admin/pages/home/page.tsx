'use client';

import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { motion } from 'framer-motion';
import SiteLogoTab from '@/components/admin/SiteLogoTab';
import HomepageMentorshipTab from '@/components/admin/HomepageMentorshipTab';
import HomepageFeaturesTab from '@/components/admin/HomepageFeaturesTab';
import SliderSettingsTab from '@/components/admin/SliderSettingsTab';
import StatisticsTab from '@/components/admin/StatisticsTab';
import TestimonialsTab from '@/components/admin/TestimonialsTab';
import PluginsTab from '@/components/admin/home/PluginsTab';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function HomeAdminPage() {
  const tabs = [
    { 
      name: 'Site Logo',
      component: <SiteLogoTab />
    },
    { 
      name: 'Slider Settings',
      component: <SliderSettingsTab />
    },
    { 
      name: 'Features',
      component: <HomepageFeaturesTab />
    },
    { 
      name: 'Statistics',
      component: <StatisticsTab />
    },
    { 
      name: 'Testimonials',
      component: <TestimonialsTab />
    },
    { 
      name: 'Mentorship',
      component: <HomepageMentorshipTab />
    },
    { 
      name: 'Plugins',
      component: <PluginsTab />
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
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
