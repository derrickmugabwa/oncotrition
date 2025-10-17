'use client';

import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Hero from './Hero';

interface HeroContent {
  title: string;
  subtitle: string;
  tagline: string;
  background_image: string;
}

interface HeroClientWrapperProps {
  initialContent: HeroContent;
}

export default function HeroClientWrapper({ initialContent }: HeroClientWrapperProps) {
  const supabase = createClientComponentClient();
  const [content, setContent] = useState<HeroContent>(initialContent);

  useEffect(() => {
    // Set up real-time subscription for admin updates
    const channel = supabase
      .channel('mentorship_hero_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_hero'
        },
        (payload) => {
          if (payload.new) {
            setContent(payload.new as HeroContent);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return <Hero content={content} />;
}
