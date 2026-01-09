import { createClient } from '@/utils/supabase/server';
import EventsManagement from '@/components/admin/events/EventsManagement';

export default async function AdminEventsPage() {
  const supabase = await createClient();

  // Fetch events
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  // Fetch announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .order('priority', { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Events & Announcements</h1>
        <p className="text-gray-600 mt-2">
          Manage nutrition events, workshops, and site-wide announcements.
        </p>
      </div>

      <EventsManagement 
        events={events || []}
        announcements={announcements || []}
      />
    </div>
  );
}
