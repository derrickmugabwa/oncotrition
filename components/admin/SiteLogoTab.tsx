'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

const SiteLogoTab = () => {
  const supabase = createClientComponentClient()
  const router = useRouter()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<{
    id: number
    logo_url: string | null
    favicon_url: string | null
    show_site_name: boolean
  }>({
    id: 0,
    logo_url: null,
    favicon_url: null,
    show_site_name: true
  })

  // Define fetchSettings first
  const fetchSettings = useCallback(async () => {
    try {
      // First check if user is authenticated
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      
      if (authError) throw authError
      
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Get all settings first to check what we have
      const { data: allSettings, error: fetchError } = await supabase
        .from('site_settings')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      if (allSettings && allSettings.length > 0) {
        // Use the most recent settings
        setSettings(allSettings[0]);
        
        // If we have multiple settings, clean up old ones
        if (allSettings.length > 1) {
          console.log('Found multiple settings, cleaning up...');
          const keepId = allSettings[0].id;
          
          // Delete all except the most recent
          const { error: deleteError } = await supabase
            .from('site_settings')
            .delete()
            .neq('id', keepId);

          if (deleteError) {
            console.error('Error cleaning up old settings:', deleteError);
          }
        }
      } else {
        // No settings exist, create initial settings
        const { data: newData, error: insertError } = await supabase
          .from('site_settings')
          .insert([{ 
            logo_url: null,
            favicon_url: null,
            show_site_name: true
          }])
          .select()
          .single();

        if (insertError) throw insertError;
        if (newData) setSettings(newData);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error.message);
      setError(error.message || 'Failed to load settings');
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const handleFileUpload = async (file: File, type: 'logo' | 'favicon') => {
    try {
      setIsUploading(true)
      setError(null)

      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      // Create a clean filename with timestamp
      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      const timestamp = Date.now()
      const fileName = `${type}-${timestamp}.${fileExt}`
      const filePath = `site-assets/${fileName}`

      // First, try to delete existing file if any
      try {
        const { data: existingSettings } = await supabase
          .from('site_settings')
          .select('logo_url, favicon_url')
          .single()

        if (existingSettings) {
          const existingUrl = type === 'logo' ? existingSettings.logo_url : existingSettings.favicon_url
          if (existingUrl) {
            // Extract the file path from the full URL
            const existingPath = existingUrl.split('site-assets/').pop()?.split('?')[0]
            if (existingPath) {
              await supabase.storage
                .from('site-assets')
                .remove([existingPath])
            }
          }
        }
      } catch (error) {
        console.warn('Error removing existing file:', error)
      }

      // Upload new file
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath)

      // Add timestamp to prevent caching
      const urlWithTimestamp = `${publicUrl}?t=${timestamp}`

      // Update settings
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ 
          [`${type}_url`]: urlWithTimestamp,
        })
        .eq('id', settings.id)

      if (updateError) throw updateError

      // Update local state
      setSettings(prev => ({
        ...prev,
        [`${type}_url`]: urlWithTimestamp
      }))

      // Force router refresh to update all components
      router.refresh()

    } catch (error: any) {
      console.error(`Error uploading ${type}:`, error)
      setError(error.message || `Failed to upload ${type}`)
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'image/svg+xml', 'image/gif', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Please upload a valid image file (JPEG, PNG, SVG, GIF, or WebP)')
      return
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('File size should be less than 2MB')
      return
    }

    handleFileUpload(file, type)
  }

  const handleShowSiteNameToggle = async (checked: boolean) => {
    try {
      // Check authentication
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        throw new Error('Not authenticated')
      }

      const { error } = await supabase
        .from('site_settings')
        .upsert({ 
          show_site_name: checked,
          logo_url: settings.logo_url,
          favicon_url: settings.favicon_url
        })

      if (error) throw error

      setSettings(prev => ({
        ...prev,
        show_site_name: checked
      }))

    } catch (error: any) {
      console.error('Error updating show_site_name:', error)
      setError(error.message || 'Failed to update settings')
    }
  }

  // If not authenticated, show login message
  if (error === 'Not authenticated') {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
        Please log in to manage site settings
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && error !== 'Not authenticated' && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="bg-white shadow sm:rounded-lg p-6 space-y-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Logo</h3>
        <div className="flex items-center space-x-4">
          {settings.logo_url ? (
            <div className="relative w-20 h-20 border border-gray-200 rounded-lg overflow-hidden bg-white flex items-center justify-center">
              <Image
                src={settings.logo_url}
                alt="Site Logo"
                fill
                className="object-contain p-2"
                sizes="80px"
              />
            </div>
          ) : (
            <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
              <span className="text-gray-400">No logo</span>
            </div>
          )}
          <div className="flex-1">
            <input
              type="file"
              id="logo-upload"
              className="hidden"
              accept="image/*"
              onChange={(e) => handleFileInputChange(e, 'logo')}
              disabled={isUploading}
            />
            <label
              htmlFor="logo-upload"
              className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                isUploading
                  ? 'bg-purple-400 cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 cursor-pointer'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500`}
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Upload New Logo'
              )}
            </label>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
            <p className="mt-2 text-sm text-gray-500">
              Recommended: Square image, at least 100x100 pixels. Supports PNG, JPG, SVG, GIF, or WebP.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Settings</h3>
          <div className="mt-4 space-y-4">
            <div className="flex items-center">
              <input
                id="show-site-name"
                type="checkbox"
                checked={settings.show_site_name}
                onChange={(e) => handleShowSiteNameToggle(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="show-site-name" className="ml-3">
                <span className="text-sm text-gray-700">Show site name next to logo</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Favicon</h3>
        <div className="flex items-center space-x-4">
          <div className="w-8 h-8 bg-gray-50 rounded flex items-center justify-center">
            {settings.favicon_url ? (
              <Image
                src={settings.favicon_url}
                alt="Favicon"
                width={32}
                height={32}
                className="object-contain"
              />
            ) : (
              <span className="text-gray-400 text-xs">No favicon</span>
            )}
          </div>
          <input
            type="file"
            id="favicon-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'favicon')}
            disabled={isUploading}
          />
          <label
            htmlFor="favicon-upload"
            className={`px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload Favicon'}
          </label>
        </div>
      </div>
    </div>
  )
}

export default SiteLogoTab