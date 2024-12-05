'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

interface SiteSettings {
  logo_url: string | null
  show_site_name: boolean
}

export default function Logo() {
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('site_settings')
          .select('logo_url, show_site_name')
          .single()

        if (error) {
          console.error('Error fetching site settings:', error)
          return
        }

        console.log('Fetched site settings:', data)
        setSettings(data || { logo_url: null, show_site_name: true })
      } catch (error) {
        console.error('Error in Logo component:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()

    // Subscribe to changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings'
        },
        (payload) => {
          console.log('Site settings changed:', payload)
          setSettings(payload.new as SiteSettings)
        }
      )
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [supabase])

  // Add debug output
  useEffect(() => {
    console.log('Current settings:', settings)
  }, [settings])

  if (isLoading) {
    return (
      <Link href="/" className="flex items-center space-x-2">
        <div className="w-10 h-10 bg-gray-200 rounded-full animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 rounded animate-pulse" />
      </Link>
    )
  }

  if (!settings) {
    console.log('No settings available, showing default')
    return (
      <Link href="/" className="flex items-center space-x-2">
        <span className="text-xl font-bold text-gray-800">SmartSpoon+</span>
      </Link>
    )
  }

  console.log('Rendering logo with settings:', settings)
  return (
    <Link href="/" className="flex items-center space-x-2">
      {settings.logo_url ? (
        <div className="relative w-10 h-10">
          <Image
            src={settings.logo_url}
            alt="Site Logo"
            width={40}
            height={40}
            className="object-contain"
            priority
            onError={(e) => {
              console.error('Error loading image:', e)
            }}
            onLoad={() => {
              console.log('Image loaded successfully')
            }}
          />
        </div>
      ) : (
        <div className="w-10 h-10 flex items-center justify-center bg-blue-100 rounded-full">
          <span className="text-blue-600 font-bold text-xl">S</span>
        </div>
      )}
      {settings.show_site_name && (
        <span className="text-xl font-bold text-gray-800">SmartSpoon+</span>
      )}
    </Link>
  )
}
