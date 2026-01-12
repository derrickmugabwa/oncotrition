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

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20">
      <EventDetail event={event as Event} />
      <EventDetailClient event={event as Event} />
    </main>
  );
}
