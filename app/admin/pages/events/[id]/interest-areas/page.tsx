// Admin Event Interest Areas Management Page
// Manage interest areas for a specific event

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { EventInterestAreasManager } from '@/components/admin/events/EventInterestAreasManager';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();

  const { data: event } = await supabase
    .from('events')
    .select('title')
    .eq('id', id)
    .single();

  return {
    title: event ? `${event.title} - Interest Areas | Admin` : 'Event Interest Areas | Admin',
  };
}

export default async function EventInterestAreasPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/admin/login');
  }

  // Fetch event details
  const { data: event, error: eventError } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (eventError || !event) {
    notFound();
  }

  // Fetch interest areas for this event
  const { data: interestAreas } = await supabase
    .from('nutrivibe_interest_areas')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true });

  return (
    <div className="p-8">
      <EventInterestAreasManager event={event} interestAreas={interestAreas || []} />
    </div>
  );
}
