import { createClient } from '@supabase/supabase-js';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SponsorshipForm } from '@/components/events/SponsorshipForm';
import { Event } from '@/types/events';
import { SponsorshipTier } from '@/types/sponsorship';

// Force dynamic rendering to always fetch fresh data
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const publicSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface PageProps {
  params: Promise<{ id: string }>;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;

  const { data: event } = await publicSupabase
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
    title: `Sponsor ${event.title} - Oncotrition`,
    description: `Become a sponsor or partner for ${event.title}. Choose from our sponsorship tiers and maximize your brand visibility.`,
    openGraph: {
      title: `Sponsor ${event.title}`,
      description: `Partner with us for ${event.title}`,
      type: 'website',
    },
  };
}

export default async function EventSponsorPage({ params }: PageProps) {
  const { id } = await params;

  // Fetch event details
  const { data: eventData } = await publicSupabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  const event = eventData as Event | null;

  // Check if event exists and accepts sponsorships
  if (!event || !event.accepts_sponsorships) {
    notFound();
  }

  // Check if sponsorship registration is still open
  if (event.status !== 'upcoming') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 font-outfit">
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Sponsorship Registration Closed</h1>
          <p className="text-muted-foreground mb-8">
            Sponsorship registration for this event is no longer available.
          </p>
          <a
            href="/events"
            className="inline-block bg-[#009688] hover:bg-[#00796b] text-white py-3 px-8 rounded-lg font-semibold"
          >
            View Other Events
          </a>
        </div>
      </main>
    );
  }

  // Check if sponsorship deadline has passed
  if (event.sponsorship_deadline) {
    const deadline = new Date(event.sponsorship_deadline);
    const now = new Date();
    if (now > deadline) {
      return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 font-outfit">
          <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4">Sponsorship Deadline Passed</h1>
            <p className="text-muted-foreground mb-8">
              The sponsorship deadline for this event was{' '}
              {deadline.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
              .
            </p>
            <a
              href="/events"
              className="inline-block bg-[#009688] hover:bg-[#00796b] text-white py-3 px-8 rounded-lg font-semibold"
            >
              View Other Events
            </a>
          </div>
        </main>
      );
    }
  }

  // Fetch sponsorship tiers for this event
  const { data: tiersData } = await publicSupabase
    .from('event_sponsorship_tiers')
    .select(`
      *,
      benefits:event_sponsorship_benefits(*)
    `)
    .eq('event_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const tiers = (tiersData || []) as SponsorshipTier[];

  if (tiers.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 font-outfit">
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">No Sponsorship Tiers Available</h1>
          <p className="text-muted-foreground mb-8">
            Sponsorship tiers are currently being configured for this event. Please check
            back later.
          </p>
          <a
            href={`/events/${id}`}
            className="inline-block bg-[#009688] hover:bg-[#00796b] text-white py-3 px-8 rounded-lg font-semibold"
          >
            Back to Event
          </a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-16 font-outfit">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Sponsor {event.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Partner with us and maximize your brand visibility
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground mt-6">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#009688]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <span>
                {new Date(event.event_date).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-[#009688]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>

          {/* Sponsorship Deadline Notice */}
          {event.sponsorship_deadline && (
            <div className="mt-6 inline-block bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Sponsorship deadline:</strong>{' '}
                {new Date(event.sponsorship_deadline).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Sponsorship Form */}
        <SponsorshipForm event={event} tiers={tiers} />
      </div>
    </main>
  );
}
