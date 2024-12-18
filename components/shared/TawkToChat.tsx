'use client';

import { useEffect } from 'react';

interface TawkToChatProps {
  propertyId: string;
  widgetId: string;
  enabled?: boolean;
}

declare global {
  interface Window {
    Tawk_API?: any;
    Tawk_LoadStart?: Date;
  }
}

export default function TawkToChat({ propertyId, widgetId, enabled = true }: TawkToChatProps) {
  useEffect(() => {
    if (!enabled || !propertyId || !widgetId) return;

    // Remove any existing Tawk.to instances
    const existingScript = document.getElementById('tawkto-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Initialize Tawk_LoadStart
    window.Tawk_LoadStart = new Date();

    const script = document.createElement('script');
    script.id = 'tawkto-script';
    script.async = true;
    script.src = `https://embed.tawk.to/${propertyId}/${widgetId}`;
    script.charset = 'UTF-8';
    script.setAttribute('crossorigin', '*');

    script.onerror = () => {
      console.error('Failed to load Tawk.to chat widget');
    };

    document.head.appendChild(script);

    return () => {
      // Cleanup Tawk.to when component unmounts
      if (window.Tawk_API) {
        window.Tawk_API = undefined;
      }
      const scriptToRemove = document.getElementById('tawkto-script');
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
    };
  }, [propertyId, widgetId, enabled]);

  return null;
}
