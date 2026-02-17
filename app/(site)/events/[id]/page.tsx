import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import EventDetail from '@/components/events/EventDetail';
import EventDetailClient from '@/components/events/EventDetailClient';
import { Event } from '@/types/events';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface EventPageProps {
  params: {
    id: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { id } = await params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found - Oncotrition',
    };
  }

  return {
    title: `${event.title} - Oncotrition Events`,
    description: event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.description,
      type: 'website',
      images: event.featured_image_url ? [event.featured_image_url] : [],
    },
  };
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params;
  
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // Fetch event details server-side
  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !event) {
    notFound();
  }

  // Try to fetch event images (optional - table may not exist yet)
  const { data: eventImages } = await supabase
    .from('event_images')
    .select('*')
    .eq('event_id', id)
    .order('display_order', { ascending: true });

  // Attach images to event if they exist
  if (eventImages) {
    (event as any).event_images = eventImages;
  }

  // Fetch pricing options for this event (event-specific or global)
  const { data: pricing } = await supabase
    .from('nutrivibe_pricing')
    .select('*')
    .or(`event_id.eq.${id},event_id.is.null`)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16">
      <EventDetail event={event as Event} pricing={pricing || []} />
      <EventDetailClient event={event as Event} />
    </main>
  );
}
