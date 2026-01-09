import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from '@/components/Providers';
import { Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';

import { createClient } from '@supabase/supabase-js';
import AnnouncementManager from '@/components/announcements/AnnouncementManager';
import { Announcement } from '@/types/events';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export async function generateMetadata(): Promise<Metadata> {
  // Use public client for site settings (no auth required)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('is_active', true)
    .single();

  // Construct the favicon URL
  const faviconUrl = settings?.favicon_url
    ? settings.favicon_url.startsWith('http')
      ? settings.favicon_url
      : settings.favicon_url.startsWith('/')
        ? settings.favicon_url
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/favicons/${settings.favicon_url}`
    : '/favicon.ico';

  return {
    title: 'Oncotrition',
    description: 'Your personal nutrition guide',
    icons: {
      icon: faviconUrl,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch active announcements server-side
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const now = new Date().toISOString();
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .lte('start_date', now)
    .gte('end_date', now)
    .order('priority', { ascending: false });

  return (
    <html lang="en" suppressHydrationWarning className={outfit.variable}>
      <body className={cn(outfit.className, "font-outfit")}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            {children}
            <AnnouncementManager announcements={(announcements as Announcement[]) || []} />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
