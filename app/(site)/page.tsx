'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import HeroSlider from '@/components/HeroSlider'
import Statistics from '@/components/Statistics'
import Features from '@/components/Features'
import Testimonials from '@/components/Testimonials'
import HomepageMentorship from '@/components/HomepageMentorship'
import HomepageSmartspoon from '@/components/HomepageSmartspoon'
import { BrandSlider } from '@/components/BrandSlider'
import { usePageLoading } from '@/hooks/usePageLoading'
import { Database } from '@/types/supabase'

type ComponentSetting = Database['public']['Tables']['homepage_components']['Row'];

const componentMap = {
  'hero-slider': HeroSlider,
  'features': Features,
  'statistics': Statistics,
  'brand-slider': BrandSlider,
  'homepage-mentorship': HomepageMentorship,
  'homepage-smartspoon': HomepageSmartspoon,
  'testimonials': Testimonials,
} as const;

type ComponentKey = keyof typeof componentMap;

export default function Home() {
  usePageLoading();
  const [components, setComponents] = useState<ComponentSetting[]>([]);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchComponents = async () => {
      const { data, error } = await supabase
        .from('homepage_components')
        .select('*')
        .order('display_order');
      
      if (error) {
        console.error('Error fetching components:', error);
        return;
      }
      
      setComponents(data || []);
    };

    fetchComponents();

    // Subscribe to realtime changes
    const channel = supabase
      .channel('homepage_components_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'homepage_components'
        },
        () => {
          fetchComponents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <main>
      {components
        .filter(comp => comp.is_visible)
        .map(comp => {
          const Component = componentMap[comp.component_key as ComponentKey];
          return Component ? <Component key={comp.id} /> : null;
        })}
    </main>
  );
}