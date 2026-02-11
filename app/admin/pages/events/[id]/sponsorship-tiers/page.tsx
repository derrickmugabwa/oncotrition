// Admin Sponsorship Tiers Management Page
// Manage sponsorship tiers and benefits for a specific event

import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { SponsorshipTiersManager } from '@/components/admin/events/SponsorshipTiersManager';
import { SponsorshipTier } from '@/types/sponsorship';

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
    title: event ? `${event.title} - Sponsorship Tiers | Admin` : 'Sponsorship Tiers | Admin',
  };
}

export default async function SponsorshipTiersPage({ params }: PageProps) {
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

  // Fetch sponsorship tiers with benefits
  const { data: tiers } = await supabase
    .from('event_sponsorship_tiers' as any)
    .select(`
      *,
      benefits:event_sponsorship_benefits(*)
    `)
    .eq('event_id', id)
    .order('display_order', { ascending: true });

  return (
    <div className="p-8">
      <SponsorshipTiersManager 
        key={`tiers-${id}`}
        event={event} 
        initialTiers={(tiers || []) as unknown as SponsorshipTier[]} 
      />
    </div>
  );
}
