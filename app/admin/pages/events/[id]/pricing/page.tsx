// Admin Event Pricing Management Page
// Manage pricing options for a specific event

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { EventPricingManager } from '@/components/admin/events/EventPricingManager';

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
    title: event ? `${event.title} - Pricing | Admin` : 'Event Pricing | Admin',
  };
}

export default async function EventPricingPage({ params }: PageProps) {
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

  // Fetch pricing options for this event
  const { data: pricing } = await supabase
    .from('nutrivibe_pricing')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true });

  return (
    <div className="p-8">
      <EventPricingManager event={event} pricing={pricing || []} />
    </div>
  );
}
