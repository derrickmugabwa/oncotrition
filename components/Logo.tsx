'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export default function Logo({ className = "", showLink = true }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const supabase = createClientComponentClient()
  
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const { data: settings } = await supabase
          .from('site_settings')
          .select('logo_url')
          .single()

        if (settings?.logo_url) {
          setLogoUrl(settings.logo_url)
          setImageError(false)
          setImageLoaded(false)
        }
      } catch (error) {
        console.error('Error fetching logo:', error)
        setImageError(true)
      }
    }

    fetchLogo()

    // Subscribe to changes in site_settings
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload: any) => {
          if (payload.new?.logo_url) {
            setLogoUrl(payload.new.logo_url)
            setImageError(false)
            setImageLoaded(false)
          }
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  const LogoContent = () => (
    <div className={`relative h-16 ${className}`} style={{ width: '180px' }}>
      {!imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 rounded-lg animate-pulse" />
          )}
          {logoUrl && (
            <Image
              src={logoUrl}
              alt="Site Logo"
              fill
              className={`object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              priority={true}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          )}
        </>
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
