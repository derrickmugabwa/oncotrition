'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import HeroSectionTab from '@/components/admin/mentorship/HeroSectionTab';
import MentorshipFeaturesTab from '@/components/admin/mentorship/MentorshipFeaturesTab';
import MentorshipEventsTab from '@/components/admin/mentorship/MentorshipEventsTab';
import EventBookingsTab from '@/components/admin/mentorship/EventBookingsTab';
import NutritionSurveyTab from '@/components/admin/mentorship/NutritionSurveyTab';
import TestimonialsTab from '@/components/admin/mentorship/TestimonialsTab';
import PackagesTab from '@/components/admin/mentorship/PackagesTab';
import SubmissionsTab from '@/components/admin/mentorship/SubmissionsTab';
import BusinessTipsTab from '@/components/admin/mentorship/BusinessTipsTab';
import ComponentsTab from '@/components/admin/mentorship/ComponentsTab';

export default function MentorshipAdminPage() {
  const tabs = [
    { name: 'Components', component: <ComponentsTab /> },
    { name: 'Hero Section', component: <HeroSectionTab /> },
    { name: 'Mentorship Features', component: <MentorshipFeaturesTab /> },
    { name: 'Business Tips', component: <BusinessTipsTab /> },
    { name: 'Packages', component: <PackagesTab /> },
    { name: 'Nutrition Survey', component: <NutritionSurveyTab /> },
    { name: 'Testimonials', component: <TestimonialsTab /> },
    { name: 'Events', component: <MentorshipEventsTab /> },
    { name: 'Bookings', component: <EventBookingsTab /> },
    // { name: 'Submissions', component: <SubmissionsTab /> },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Mentorship Page Management</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage content for the mentorship page sections
        </p>
      </div>

      <Tabs defaultValue="components" className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.name.toLowerCase().replace(/\s+/g, '-')}
              value={tab.name.toLowerCase().replace(/\s+/g, '-')}
            >
              {tab.name}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent
            key={tab.name.toLowerCase().replace(/\s+/g, '-')}
            value={tab.name.toLowerCase().replace(/\s+/g, '-')}
            className="space-y-4"
          >
            {tab.component}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
