'use client';

import { useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { Database } from '@/types/supabase';

type ComponentSetting = Database['public']['Tables']['about_components']['Row'];

interface AboutClientWrapperProps {
  initialComponents: ComponentSetting[];
}

export default function AboutClientWrapper({ initialComponents }: AboutClientWrapperProps) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    // Subscribe to realtime changes for admin users
    const channel = supabase
      .channel('about_components_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'about_components'
        },
        () => {
          // Refresh the page to get updated components from server
          router.refresh();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, router]);

  // This component doesn't render anything visible
  // It only handles real-time updates
  return null;
}
