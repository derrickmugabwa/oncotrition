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
    logo_url: string | null
    favicon_url: string | null
    show_site_name: boolean
  }>({
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

      console.log('Starting file upload for:', type)

      // Create a clean filename
      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      const fileName = `${type}-${Date.now()}.${fileExt}`
      const filePath = `${session.user.id}/${fileName}`

      console.log('Uploading file:', filePath)

      // First, try to delete existing file if any
      try {
        const { data: existingSettings } = await supabase
          .from('site_settings')
          .select(type === 'logo' ? 'logo_url' : 'favicon_url')
          .single()

        if (existingSettings) {
          const existingUrl = type === 'logo' ? existingSettings.logo_url : existingSettings.favicon_url
          if (existingUrl) {
            const existingPath = existingUrl.split('/').slice(-2).join('/')
            await supabase.storage
              .from('site-assets')
              .remove([existingPath])
          }
        }
      } catch (error) {
        console.warn('Error removing existing file:', error)
        // Continue with upload even if delete fails
      }

      // Upload new file
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Upload error:', uploadError)
        throw uploadError
      }

      console.log('File uploaded successfully:', uploadData)

      // Get public URL with cache-busting parameter
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath)

      // Add a timestamp to prevent caching
      const urlWithTimestamp = `${publicUrl}?t=${Date.now()}`

      console.log('Public URL generated:', urlWithTimestamp)

      // Update settings with the timestamped URL
      const { error: updateError, data: updateData } = await supabase
        .from('site_settings')
        .upsert({ 
          [`${type}_url`]: urlWithTimestamp,
          show_site_name: settings.show_site_name
        })
        .select()
        .single()

      if (updateError) {
        console.error('Update error:', updateError)
        throw updateError
      }

      console.log('Settings updated successfully:', updateData)

      // Update local state with the timestamped URL
      setSettings(prev => ({
        ...prev,
        [`${type}_url`]: urlWithTimestamp
      }))

      // Preload the image using a hidden img element
      const preloadLink = document.createElement('link')
      preloadLink.rel = 'preload'
      preloadLink.as = 'image'
      preloadLink.href = urlWithTimestamp
      document.head.appendChild(preloadLink)

      // Refresh the page to show new images
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

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Current Logo</h3>
        <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
          <div className="mx-auto w-32 h-32 bg-gray-50 rounded-lg flex items-center justify-center mb-4">
            {settings.logo_url ? (
              <Image
                src={settings.logo_url}
                alt="Site Logo"
                width={128}
                height={128}
                className="object-contain"
              />
            ) : (
              <span className="text-gray-400">No logo uploaded</span>
            )}
          </div>
          <input
            type="file"
            id="logo-upload"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileInputChange(e, 'logo')}
            disabled={isUploading}
          />
          <label
            htmlFor="logo-upload"
            className={`px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors cursor-pointer ${
              isUploading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isUploading ? 'Uploading...' : 'Upload New Logo'}
          </label>
        </div>

        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-900 mb-2">Favicon</h4>
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

      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Logo Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600"
                checked={settings.show_site_name}
                onChange={(e) => handleShowSiteNameToggle(e.target.checked)}
              />
              <span className="text-sm text-gray-700">Show site name next to logo</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SiteLogoTab