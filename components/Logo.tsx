'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface LogoProps {
  className?: string;
  showLink?: boolean;
  logoUrl?: string | null;
}

export default function Logo({ className = "", showLink = true, logoUrl: initialLogoUrl = null }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(initialLogoUrl)
  const [imageError, setImageError] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    // Set initial logo URL if provided
    if (initialLogoUrl) {
      setLogoUrl(initialLogoUrl)
    }

    // Subscribe to changes in site_settings for real-time admin updates
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
          filter: 'id=eq.1'
        },
        (payload: any) => {
          if (payload.new?.logo_url) {
            const url = payload.new.logo_url.startsWith('http')
              ? payload.new.logo_url
              : payload.new.logo_url.startsWith('/')
                ? payload.new.logo_url
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${payload.new.logo_url}`
            setLogoUrl(url)
            setImageError(false)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase, initialLogoUrl])

  const LogoContent = () => (
    <div 
      className={`relative flex items-center justify-center h-12 -ml-8 ${className}`} 
      style={{ width: '160px', minWidth: '160px' }}
    >
      {!imageError && logoUrl ? (
        <Image
          src={logoUrl}
          alt="Site Logo"
          fill
          sizes="160px"
          className="object-contain"
          priority={true}
          onError={() => setImageError(true)}
        />
      ) : (
        <div className="w-full h-full rounded-lg bg-primary flex items-center justify-center">
          <span className="text-white text-xl font-bold">N</span>
        </div>
      )}
    </div>
  )

  return showLink ? (
    <Link href="/" className="flex items-center">
      <LogoContent />
    </Link>
  ) : (
    <LogoContent />
  )
}
