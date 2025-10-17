'use client';

import { useState } from 'react';
import { Calendar, Bell } from 'lucide-react';
import EventsTab from './EventsTab';
import AnnouncementsTab from '@/components/admin/announcements/AnnouncementsTab';
import { Event, Announcement } from '@/types/events';

interface EventsManagementProps {
  events: Event[];
  announcements: Announcement[];
}

export default function EventsManagement({ events, announcements }: EventsManagementProps) {
  const [activeTab, setActiveTab] = useState<'events' | 'announcements'>('events');

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('events')}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'events'
                ? 'border-[#009688] text-[#009688]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Calendar className="w-5 h-5" />
            Events
            <span className={`
              ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
              ${activeTab === 'events'
                ? 'bg-[#009688] text-white'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {events.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('announcements')}
            className={`
              flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
              ${activeTab === 'announcements'
                ? 'border-[#009688] text-[#009688]'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            <Bell className="w-5 h-5" />
            Announcements
            <span className={`
              ml-2 py-0.5 px-2.5 rounded-full text-xs font-medium
              ${activeTab === 'announcements'
                ? 'bg-[#009688] text-white'
                : 'bg-gray-100 text-gray-600'
              }
            `}>
              {announcements.length}
            </span>
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'events' ? (
          <EventsTab />
        ) : (
          <AnnouncementsTab />
        )}
      </div>
    </div>
  );
}
