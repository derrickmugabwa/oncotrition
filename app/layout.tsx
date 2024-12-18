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
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return {
    title: 'Oncotrition',
    description: 'Your personal nutrition guide',
    icons: {
      icon: settings?.favicon_url || '/favicon.ico', // Fallback to default favicon if none in settings
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
