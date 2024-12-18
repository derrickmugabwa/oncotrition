import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ThemeToggle from '@/components/ThemeToggle'
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import TawkToChat from '@/components/shared/TawkToChat';
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerComponentClient({ cookies });
  
  // Fetch WhatsApp and Tawk.to settings
  const [whatsappResponse, tawktoResponse] = await Promise.all([
    supabase.from('whatsapp_settings').select('*').single(),
    supabase.from('tawkto_settings').select('*').single(),
  ]);

  const whatsappSettings = whatsappResponse.data;
  const tawktoSettings = tawktoResponse.data;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <ThemeToggle />
      <Header />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {whatsappSettings && (
        <WhatsAppButton 
          phoneNumber={whatsappSettings.phone_number}
          message={whatsappSettings.message}
          position={whatsappSettings.position}
          enabled={whatsappSettings.enabled}
        />
      )}
      {tawktoSettings && (
        <TawkToChat
          propertyId={tawktoSettings.property_id}
          widgetId={tawktoSettings.widget_id}
          enabled={tawktoSettings.enabled}
        />
      )}
    </div>
  )
}
