// Admin Sponsorship Registrations Page
// View and manage sponsorship registrations for a specific event

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SponsorshipRegistrationsManager } from '@/components/admin/events/SponsorshipRegistrationsManager';
import { SponsorshipRegistration, SponsorshipTier } from '@/types/sponsorship';

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
    title: event ? `${event.title} - Sponsorships | Admin` : 'Sponsorships | Admin',
  };
}

export default async function SponsorshipsPage({ params }: PageProps) {
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

  // Check if event accepts sponsorships
  if (!(event as any).accepts_sponsorships) {
    return (
      <div className="p-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">No Sponsorships</h1>
          <p className="text-muted-foreground mb-6">
            This event does not accept sponsorships.
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

  // Fetch sponsorship registrations
  const { data: registrations } = await supabase
    .from('event_sponsorship_registrations' as any)
    .select('*')
    .eq('event_id', id)
    .order('created_at', { ascending: false });

  // Fetch sponsorship tiers
  const { data: tiers } = await supabase
    .from('event_sponsorship_tiers' as any)
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true });

  return (
    <div className="p-8">
      <SponsorshipRegistrationsManager
        event={event}
        registrations={(registrations || []) as unknown as SponsorshipRegistration[]}
        tiers={(tiers || []) as unknown as SponsorshipTier[]}
      />
    </div>
  );
}
