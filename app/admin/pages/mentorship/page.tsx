'use client';

import { useState } from 'react';
import MentorshipFeaturesTab from '@/components/admin/mentorship/MentorshipFeaturesTab';
import PackagesTab from '@/components/admin/mentorship/PackagesTab';
import SubmissionsTab from '@/components/admin/mentorship/SubmissionsTab';

export default function MentorshipAdminPage() {
  const [activeTab, setActiveTab] = useState('features');

  const tabs = [
    { id: 'features', label: 'Mentorship Features', component: MentorshipFeaturesTab },
    { id: 'packages', label: 'Packages', component: PackagesTab },
    { id: 'submissions', label: 'Submissions', component: SubmissionsTab },
  ];

  const ActiveComponent = tabs.find(tab => tab.id === activeTab)?.component || MentorshipFeaturesTab;

  return (
    <div className="space-y-6 p-6">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
          Mentorship Page Management
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-8">
          Manage your mentorship page content, packages, and user submissions.
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
                ${activeTab === tab.id
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

      <div className="mt-8">
        <ActiveComponent />
      </div>
    </div>
  );
}
