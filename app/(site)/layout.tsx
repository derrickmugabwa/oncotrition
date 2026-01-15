import HeaderServer from '@/components/HeaderServer'
import Footer from '@/components/Footer'
import ThemeToggle from '@/components/ThemeToggle'
import WhatsAppButton from '@/components/shared/WhatsAppButton';
import TawkToChat from '@/components/shared/TawkToChat';
import { createClient } from '@/utils/supabase/server';

// Maintenance page component
const MaintenancePage = ({ title, message, contact }: { 
  title: string; 
  message: string; 
  contact: string;
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 px-4 text-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">{title}</h1>
        <div className="w-24 h-1 bg-primary mx-auto mb-8"></div>
        <p className="text-xl text-gray-700 dark:text-gray-300 mb-8">
          {message}
        </p>
        <div className="text-gray-600 dark:text-gray-400" dangerouslySetInnerHTML={{ __html: contact }} />
      </div>
    </div>
  );
};

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient();
  
  // Default settings in case database query fails
  const settings = {
    mode: false,
    title: "We'll Be Right Back",
    message: "Our site is currently undergoing scheduled maintenance. We apologize for any inconvenience and appreciate your patience.",
    contact: "Please check back soon. For urgent inquiries, please contact us at <a href=\"mailto:support@oncotrition.com\" class=\"text-primary hover:underline\">support@oncotrition.com</a>"
  };
  
  try {
    // Query each setting individually to avoid potential issues with .in() operator
    const { data: modeData } = await supabase
      .from('maintenance_mode')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();
    
    if (modeData) {
      settings.mode = modeData.value === 'true';
    }
    
    // Only fetch other settings if maintenance mode is enabled
    if (settings.mode) {
      const { data: titleData } = await supabase
        .from('maintenance_mode')
        .select('value')
        .eq('key', 'maintenance_title')
        .single();
      
      const { data: messageData } = await supabase
        .from('maintenance_mode')
        .select('value')
        .eq('key', 'maintenance_message')
        .single();
      
      const { data: contactData } = await supabase
        .from('maintenance_mode')
        .select('value')
        .eq('key', 'maintenance_contact')
        .single();
      
      if (titleData) settings.title = titleData.value;
      if (messageData) settings.message = messageData.value;
      if (contactData) settings.contact = contactData.value;
    }
  } catch (error) {
    console.error('Error fetching maintenance settings:', error);
    // Continue with default settings if there's an error
  }
  
  // If in maintenance mode, show maintenance page instead of normal content
  if (settings.mode) {
    return (
      <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
        <ThemeToggle />
        <MaintenancePage 
          title={settings.title}
          message={settings.message}
          contact={settings.contact}
        />
      </div>
    );
  }
  
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
      <HeaderServer />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      {whatsappSettings && (
        <WhatsAppButton 
          phoneNumber={whatsappSettings.phone_number}
          message={whatsappSettings.message ?? undefined}
          position={(whatsappSettings.position as "bottom-right" | "bottom-left" | "top-right" | "top-left" | undefined) ?? undefined}
          enabled={whatsappSettings.enabled ?? false}
        />
      )}
      {tawktoSettings && (
        <TawkToChat
          propertyId={tawktoSettings.property_id}
          widgetId={tawktoSettings.widget_id}
          enabled={tawktoSettings.enabled ?? false}
        />
      )}
    </div>
  )
}
