'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'

interface LogoProps {
  className?: string;
  showLink?: boolean;
}

export default function Logo({ className = "", showLink = true }: LogoProps) {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const supabase = createClient()
  
  useEffect(() => {
    const fetchLogo = async () => {
      try {
        console.log('Fetching logo from Supabase...')
        const { data: settings, error } = await supabase
          .from('site_settings')
          .select('logo_url')
          .eq('id', 1)
          .single()

        if (error) {
          console.error('Error fetching logo from Supabase:', error)
          // Don't set error, keep using default logo
          return
        }

        console.log('Received settings from Supabase:', settings)

        if (settings?.logo_url) {
          console.log('Setting logo URL:', settings.logo_url)
          // Ensure the URL is properly formatted
          const url = settings.logo_url.startsWith('http') 
            ? settings.logo_url 
            : settings.logo_url.startsWith('/')
              ? settings.logo_url
              : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${settings.logo_url}`
          
          console.log('Final logo URL:', url)
          setLogoUrl(url)
          setImageError(false)
          setImageLoaded(false)
        } else {
          console.warn('No logo URL found in settings, using default')
        }
      } catch (error) {
        console.error('Error in fetchLogo:', error)
        // Don't set error, keep using default logo
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
          table: 'site_settings',
          filter: 'id=eq.1'
        },
        (payload: any) => {
          console.log('Received site settings update:', payload)
          if (payload.new?.logo_url) {
            const url = payload.new.logo_url.startsWith('http')
              ? payload.new.logo_url
              : payload.new.logo_url.startsWith('/')
                ? payload.new.logo_url
                : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${payload.new.logo_url}`
            console.log('Updating logo URL from subscription:', url)
            setLogoUrl(url)
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
    <div 
      className={`relative flex items-center justify-center h-16 -ml-8 ${className}`} 
      style={{ width: '180px', minWidth: '180px' }}
    >
      {!imageError ? (
        <>
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
          )}
          {logoUrl && (
            <>
              {process.env.NODE_ENV === 'development' && (
                <div className="hidden">Debug: Logo URL = {logoUrl}</div>
              )}
              <Image
                src={logoUrl}
                alt="Site Logo"
                fill
                sizes="180px"
                className={`object-contain transition-opacity duration-300 ${
                  imageLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                priority={true}
                onLoad={(e) => {
                  console.log('Logo loaded successfully', e)
                  setImageLoaded(true)
                }}
                onError={(e) => {
                  console.error('Error loading logo:', e)
                  setImageError(true)
                }}
              />
            </>
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
