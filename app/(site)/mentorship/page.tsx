import { createClient } from '@supabase/supabase-js';
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

const componentMap: Record<string, React.ComponentType<any>> = {
  hero: (props: any) => <Hero content={props.heroData} />,
  features: MentorshipFeatures,
  businessTips: BusinessTips,
  nutritionSurvey: NutritionSurvey,
  testimonials: MentorshipTestimonials,
  mentorshipCards: MentorshipCards,
  eventsList: EventsList,
};

type ComponentKey = keyof typeof componentMap;

export default async function MentorshipPage() {
  // Use public client for mentorship components (no auth required)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch hero content server-side
  const { data: heroContent } = await supabase
    .from('mentorship_hero')
    .select('*')
    .single();

  const defaultHeroContent = {
    title: 'Nutrition Mentorship',
    subtitle: 'Expert guidance for your nutrition journey',
    tagline: 'Professional Support',
    background_image: '/images/mentorship-hero-bg.jpg'
  };

  const heroData = heroContent || defaultHeroContent;
  
  // Fetch mentorship features data server-side
  const { data: featuresData } = await supabase
    .from('mentorship_features')
    .select('*')
    .order('display_order');

  const { data: featuresContent } = await supabase
    .from('mentorship_features_content')
    .select('*')
    .single();

  const defaultFeaturesContent = {
    id: '',
    title: 'Mentorship Features',
    description: 'Discover the benefits of our mentorship program'
  };

  const mentorshipFeaturesData = {
    features: featuresData || [],
    content: featuresContent || defaultFeaturesContent
  };
  
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
        <Hero content={heroData} />
        <MentorshipFeatures features={mentorshipFeaturesData.features} content={mentorshipFeaturesData.content} />
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
      {visibleComponents.map((comp: ComponentSetting) => {
        const Component = componentMap[comp.component_key as ComponentKey];
        if (!Component) return null;
        
        // Pass data to components that need it
        if (comp.component_key === 'hero') {
          return <Hero key={comp.id} content={heroData} />;
        }
        
        if (comp.component_key === 'features') {
          return <MentorshipFeatures key={comp.id} features={mentorshipFeaturesData.features} content={mentorshipFeaturesData.content} />;
        }
        
        return <Component key={comp.id} />;
      })}
      <MentorshipClientWrapper initialComponents={visibleComponents} />
    </main>
  );
}
