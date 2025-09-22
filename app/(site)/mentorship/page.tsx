import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Hero from '@/components/mentorship/Hero';
import MentorshipCards from '@/components/mentorship/MentorshipCards';
import MentorshipFeatures from '@/components/mentorship/MentorshipFeatures';
import EventsList from '@/components/mentorship/EventsList';
import NutritionSurvey from '@/components/mentorship/NutritionSurvey';
import MentorshipTestimonials from '@/components/mentorship/MentorshipTestimonials';
import BusinessTips from '@/components/mentorship/BusinessTips';
import { Database } from '@/types/supabase';
import MentorshipClientWrapper from './MentorshipClientWrapper';

type ComponentSetting = Database['public']['Tables']['mentorship_components']['Row'];

const componentMap = {
  hero: Hero,
  features: MentorshipFeatures,
  businessTips: BusinessTips,
  nutritionSurvey: NutritionSurvey,
  testimonials: MentorshipTestimonials,
  mentorshipCards: MentorshipCards,
  eventsList: EventsList,
};

type ComponentKey = keyof typeof componentMap;

export default async function MentorshipPage() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch components server-side
  const { data: components, error } = await supabase
    .from('mentorship_components')
    .select('*')
    .eq('is_visible', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching component settings:', error);
    // Return default components if database fails
    return (
      <main>
        <Hero />
        <MentorshipFeatures />
        <BusinessTips />
        <NutritionSurvey />
        <MentorshipTestimonials />
        <MentorshipCards />
        <EventsList />
      </main>
    );
  }

  const visibleComponents = components || [];

  return (
    <main>
      {visibleComponents.map(comp => {
        const Component = componentMap[comp.component_key as ComponentKey];
        return Component ? <Component key={comp.id} /> : null;
      })}
      <MentorshipClientWrapper initialComponents={visibleComponents} />
    </main>
  );
}
