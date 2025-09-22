import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import HeroSlider from '@/components/HeroSlider'
import ModernHero from '@/components/ModernHero'
import Statistics from '@/components/Statistics'
import Features from '@/components/Features'
import ModernFeatures from '@/components/ModernFeatures'
import Testimonials from '@/components/Testimonials'
import HomepageMentorship from '@/components/HomepageMentorship'
import HomepageSmartspoon from '@/components/HomepageSmartspoon'
import { BrandSlider } from '@/components/BrandSlider'
import { Database } from '@/types/supabase'
import ClientWrapper from './ClientWrapper'

type ComponentSetting = Database['public']['Tables']['homepage_components']['Row'];

const componentMap = {
  'hero-slider': HeroSlider,
  'modern-hero': ModernHero,
  'features': Features,
  'modern-features': ModernFeatures,
  'statistics': Statistics,
  'brand-slider': BrandSlider,
  'homepage-mentorship': HomepageMentorship,
  'homepage-smartspoon': HomepageSmartspoon,
  'testimonials': Testimonials,
} as const;

type ComponentKey = keyof typeof componentMap;

export default async function Home() {
  const supabase = createServerComponentClient<Database>({ cookies });
  
  // Fetch components server-side
  const { data: components, error } = await supabase
    .from('homepage_components')
    .select('*')
    .eq('is_visible', true)
    .order('display_order');

  if (error) {
    console.error('Error fetching components:', error);
    // Return default components if database fails
    return (
      <main>
        <HeroSlider />
        <Features />
        <Statistics />
        <BrandSlider />
        <HomepageMentorship />
        <HomepageSmartspoon />
        <Testimonials />
      </main>
    );
  }

  const visibleComponents = components || [];

  return (
    <main>
      {/* Dynamic components managed by admin */}
      {visibleComponents.map(comp => {
        const Component = componentMap[comp.component_key as ComponentKey];
        return Component ? <Component key={comp.id} /> : null;
      })}
      <ClientWrapper initialComponents={visibleComponents} />
    </main>
  );
}