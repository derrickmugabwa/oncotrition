'use client'

import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Database } from '@/types/supabase'

type ComponentSetting = Database['public']['Tables']['homepage_components']['Row'];

interface ClientWrapperProps {
  initialComponents: ComponentSetting[];
}

export default function ClientWrapper({ initialComponents }: ClientWrapperProps) {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Subscribe to realtime changes for admin users
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
