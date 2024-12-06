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

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function HomeAdminPage() {
  const tabs = [
    { name: 'Site Logo', component: <SiteLogoTab /> },
    { name: 'Slider Settings', component: <SliderSettingsTab /> },
    { name: 'Features', component: <HomepageFeaturesTab /> },
    { name: 'Statistics', component: <StatisticsTab /> },
    { name: 'Testimonials', component: <TestimonialsTab /> },
    { name: 'Mentorship', component: <HomepageMentorshipTab /> }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6"
    >
      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
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
                'rounded-xl bg-white dark:bg-gray-800 p-6',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
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
