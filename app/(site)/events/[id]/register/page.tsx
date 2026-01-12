// Dynamic Event Registration Page

import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { publicSupabase } from '@/lib/supabase/public';
import { RegistrationForm } from '@/components/nutrivibe/RegistrationForm';
import { Event } from '@/types/events';
import { NutrivibePricing, NutrivibeInterestArea } from '@/types/nutrivibe';

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = publicSupabase;

  const { data: event } = await supabase
    .from('events')
    .select('title, description')
    .eq('id', id)
    .single();

  if (!event) {
    return {
      title: 'Event Not Found - Oncotrition',
    };
  }

  return {
    title: `Register for ${event.title} - Oncotrition`,
    description: event.description || `Register for ${event.title}`,
    openGraph: {
      title: `Register for ${event.title} - Oncotrition`,
      description: event.description || `Register for ${event.title}`,
      type: 'website',
    },
  };
}

export default async function EventRegisterPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = publicSupabase;

  // Fetch event details
  const { data: eventData } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  const event = eventData as Event | null;

  // Check if event exists and has internal registration
  if (!event || !event.has_internal_registration || event.registration_type !== 'internal') {
    notFound();
  }

  // Check if registration is still open
  if (event.status !== 'upcoming') {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 font-outfit">
        <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
          <h1 className="text-3xl font-bold mb-4">Registration Closed</h1>
          <p className="text-muted-foreground mb-8">
            Registration for this event is no longer available.
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

  // Check if registration deadline has passed
  if (event.registration_deadline) {
    const deadline = new Date(event.registration_deadline);
    const now = new Date();
    if (now > deadline) {
      return (
        <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 font-outfit">
          <div className="container mx-auto px-4 py-12 max-w-2xl text-center">
            <h1 className="text-3xl font-bold mb-4">Registration Deadline Passed</h1>
            <p className="text-muted-foreground mb-8">
              The registration deadline for this event was{' '}
              {deadline.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.
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

  // Fetch pricing options for this event
  const { data: pricingData } = await supabase
    .from('nutrivibe_pricing')
    .select('*')
    .eq('event_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const pricing = (pricingData || []) as NutrivibePricing[];

  // Fetch interest areas for this event
  const { data: interestAreasData } = await supabase
    .from('nutrivibe_interest_areas')
    .select('*')
    .eq('event_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  const interestAreas = (interestAreasData || []) as NutrivibeInterestArea[];

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-teal-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 pt-20 font-outfit">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {event.title}
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            {event.description.split('.')[0]}
          </p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-muted-foreground mt-6">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
              <svg className="w-5 h-5 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{event.event_time}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-[#009688]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{event.location}</span>
            </div>
          </div>

          {/* Registration Deadline Notice */}
          {event.registration_deadline && (
            <div className="mt-6 inline-block bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-2">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Registration closes:</strong>{' '}
                {new Date(event.registration_deadline).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>

        {/* Registration Form */}
        <RegistrationForm event={event} pricing={pricing} interestAreas={interestAreas} />
      </div>
    </main>
  );
}
