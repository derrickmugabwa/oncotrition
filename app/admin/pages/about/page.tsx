'use client';

import { useState } from 'react';
import MissionTab from '@/components/admin/about/MissionTab';
import ModulesTab from '@/components/admin/about/ModulesTab';
import TeamTab from '@/components/admin/about/TeamTab';
import ValuesTab from '@/components/admin/about/ValuesTab';
import WhyChooseUsTab from '@/components/admin/about/WhyChooseUsTab';

export default function AboutPage() {
  const [activeTab, setActiveTab] = useState('mission');

  const tabs = [
    { id: 'mission', label: 'Mission', component: MissionTab },
    { id: 'modules', label: 'Modules', component: ModulesTab },
    { id: 'team', label: 'Team', component: TeamTab },
    { id: 'values', label: 'Values', component: ValuesTab },
    { id: 'why-choose-us', label: 'Why Choose Us', component: WhyChooseUsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MissionTab;

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          About Page Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Customize your about page content through these sections.
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
  );
}
