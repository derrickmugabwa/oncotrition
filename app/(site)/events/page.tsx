import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import EventsList from '@/components/events/EventsList';
import { Event } from '@/types/events';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Events - Oncotrition | Nutrition Workshops & Seminars',
  description: 'Join our nutrition workshops, seminars, and support groups designed for cancer patients and caregivers. Learn from expert nutritionists and connect with others.',
  keywords: ['nutrition events', 'cancer workshops', 'nutrition seminars', 'support groups', 'health events', 'Nairobi events'],
  openGraph: {
    title: 'Nutrition Events & Workshops - Oncotrition',
    description: 'Discover upcoming nutrition events, workshops, and support groups for cancer patients.',
    type: 'website',
  },
};

export default async function EventsPage() {
  // Use public Supabase client for server-side data fetching
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch all events server-side (most recent first)
  const { data: allEvents, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false });

  if (error) {
    console.error('Error fetching events:', error);
  }

  const events: Event[] = allEvents || [];

  // Separate events by status for better organization
  const today = new Date().toISOString().split('T')[0];
  
  const upcomingEvents = events.filter(
    event => event.status === 'upcoming' && event.event_date >= today
  );
  
  const featuredEvents = upcomingEvents.filter(event => event.is_featured);

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16">
      <EventsList 
        events={events}
        featuredEvents={featuredEvents}
        upcomingEvents={upcomingEvents}
      />
    </main>
  );
}
