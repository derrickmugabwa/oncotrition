// Admin Event Check-in Page
// QR code scanner for event check-in

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { EventCheckInScanner } from '@/components/admin/events/EventCheckInScanner';

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
    title: event ? `${event.title} - Check-in | Admin` : 'Event Check-in | Admin',
  };
}

export default async function EventCheckInPage({ params }: PageProps) {
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

  // Fetch registrations count
  const { count: totalRegistrations } = await supabase
    .from('nutrivibe_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('payment_status', 'completed');

  const { count: checkedInCount } = await supabase
    .from('nutrivibe_registrations')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', id)
    .eq('payment_status', 'completed')
    .eq('checked_in', true);

  // Check if event has internal registration
  if (!event.has_internal_registration || event.registration_type !== 'internal') {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Internal Registration</h1>
          <p className="text-muted-foreground mb-6">
            This event does not use the internal registration system.
          </p>
          <a
            href={`/admin/pages/events`}
            className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded-lg hover:bg-primary/90"
          >
            Back to Events
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <EventCheckInScanner
        event={event}
        totalRegistrations={totalRegistrations || 0}
        checkedInCount={checkedInCount || 0}
      />
    </div>
  );
}
