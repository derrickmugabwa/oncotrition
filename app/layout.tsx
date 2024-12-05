import type { Metadata } from 'next';
import './globals.css';
import { ThemeProvider } from '@/components/ThemeProvider';
import { Providers } from '@/components/Providers';
import { Inter } from 'next/font/google';
import { cn } from '@/lib/utils';
import { LoadingProvider } from '@/providers/LoadingProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Oncotrition',
  description: 'Your personal nutrition guide',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn('min-h-screen bg-background font-sans antialiased', inter.className)}>
        <ThemeProvider>
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
