import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from '@/components/Providers';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LoadingProvider } from '@/providers/LoadingProvider';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

const inter = Inter({ subsets: ['latin'] });

export async function generateMetadata(): Promise<Metadata> {
  const supabase = createServerComponentClient({ cookies });
  
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
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <Providers>
            <LoadingProvider>
              {children}
            </LoadingProvider>
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}
