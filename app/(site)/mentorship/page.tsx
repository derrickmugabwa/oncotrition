'use client'

import React, { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { usePageLoading } from '@/hooks/usePageLoading';
import Hero from '@/components/mentorship/Hero';
import MentorshipCards from '@/components/mentorship/MentorshipCards';
import MentorshipFeatures from '@/components/mentorship/MentorshipFeatures';
import EventsList from '@/components/mentorship/EventsList';
import NutritionSurvey from '@/components/mentorship/NutritionSurvey';
import MentorshipTestimonials from '@/components/mentorship/MentorshipTestimonials';
import BusinessTips from '@/components/mentorship/BusinessTips';

interface ComponentSetting {
  component_key: string;
  is_visible: boolean;
  display_order: number;
}

const componentMap = {
  hero: Hero,
  features: MentorshipFeatures,
  businessTips: BusinessTips,
  nutritionSurvey: NutritionSurvey,
  testimonials: MentorshipTestimonials,
  mentorshipCards: MentorshipCards,
  eventsList: EventsList,
};

export default function MentorshipPage() {
  usePageLoading();
  const [components, setComponents] = useState<ComponentSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchComponents = async () => {
      const { data, error } = await supabase
        .from('mentorship_components')
        .select('component_key, is_visible, display_order')
        .order('display_order');

      if (error) {
        console.error('Error fetching component settings:', error);
        return;
      }

      setComponents(data || []);
      setLoading(false);
    };

    fetchComponents();
  }, [supabase]);

  if (loading) {
    return null; // Or a loading spinner if preferred
  }

  return (
    <main>
      {components
        .filter(comp => comp.is_visible)
        .map(comp => {
          const Component = componentMap[comp.component_key as keyof typeof componentMap];
          return Component ? <Component key={comp.component_key} /> : null;
        })}
    </main>
  );
}
