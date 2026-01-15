import { createClient } from '@supabase/supabase-js';
import Logo from './Logo';

export default async function LogoServer() {
  // Use public client for logo (no auth required)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Get logo URL from site settings
  const { data: settings } = await supabase
    .from('site_settings')
    .select('logo_url')
    .eq('id', 1)
    .single();

  // Format the logo URL
  let logoUrl: string | null = null;
  if (settings?.logo_url) {
    logoUrl = settings.logo_url.startsWith('http') 
      ? settings.logo_url 
      : settings.logo_url.startsWith('/')
        ? settings.logo_url
        : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${settings.logo_url}`;
  }

  return <Logo logoUrl={logoUrl} />;
}
