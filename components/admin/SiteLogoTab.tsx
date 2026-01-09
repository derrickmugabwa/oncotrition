'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { toast } from 'react-hot-toast'
import { v4 as uuidv4 } from 'uuid'

interface SiteSettings {
  logo_url: string | null
  favicon_url: string | null
}

export default function SiteLogoTab() {
  const [logoUrl, setLogoUrl] = useState<string | null>(null)
  const [faviconUrl, setFaviconUrl] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadingFavicon, setUploadingFavicon] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    checkAuth()
    fetchLogo()
    fetchFavicon()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession()
      if (authError) throw authError
      if (!session) {
        throw new Error('Not authenticated')
      }
    } catch (error) {
      console.error('Authentication error:', error)
      toast.error('Please log in to manage site settings')
      setError('Please log in to manage site settings')
    }
  }

  const fetchLogo = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('logo_url')
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching logo:', error)
        return
      }

      if (settings?.logo_url) {
        const url = settings.logo_url.startsWith('http') 
          ? settings.logo_url 
          : settings.logo_url.startsWith('/')
            ? settings.logo_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/logos/${settings.logo_url}`
        setLogoUrl(url)
        setPreview(url)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch logo')
    }
  }

  const fetchFavicon = async () => {
    try {
      const { data: settings, error } = await supabase
        .from('site_settings')
        .select('favicon_url')
        .eq('is_active', true)
        .single()

      if (error) {
        console.error('Error fetching favicon:', error)
        return
      }

      if (settings?.favicon_url) {
        const url = settings.favicon_url.startsWith('http') 
          ? settings.favicon_url 
          : settings.favicon_url.startsWith('/')
            ? settings.favicon_url
            : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/favicons/${settings.favicon_url}`
        setFaviconUrl(url)
        setFaviconPreview(url)
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to fetch favicon')
    }
  }

  const uploadLogo = async (file: File) => {
    try {
      setUploading(true)

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB')
        return
      }

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setPreview(objectUrl)

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName)

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Update site_settings with new logo URL
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ logo_url: fileName })
        .eq('is_active', true)
        .select()
        .single()

      if (updateError) {
        // If update fails, clean up the uploaded file
        await supabase.storage
          .from('logos')
          .remove([fileName])
        throw updateError
      }

      setLogoUrl(publicUrlData.publicUrl)
      toast.success('Logo updated successfully')

      // Cleanup old logo if exists
      if (logoUrl) {
        try {
          const oldFileName = logoUrl.split('/').pop()
          if (oldFileName && oldFileName !== 'logo.png') {
            await supabase.storage
              .from('logos')
              .remove([oldFileName])
          }
        } catch (error) {
          console.error('Error cleaning up old logo:', error)
        }
      }

    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to upload logo')
      setError(error.message || 'Failed to upload logo')
    } finally {
      setUploading(false)
    }
  }

  const uploadFavicon = async (file: File) => {
    try {
      setUploadingFavicon(true)

      // Check if file is an image
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
        return
      }

      // Check file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        toast.error('File size should be less than 2MB')
        return
      }

      // Create a preview
      const objectUrl = URL.createObjectURL(file)
      setFaviconPreview(objectUrl)

      // Generate a unique filename
      const fileExt = file.name.split('.').pop()
      const fileName = `${uuidv4()}.${fileExt}`

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('favicons')
        .upload(fileName, file)

      if (uploadError) {
        throw uploadError
      }

      // Get the public URL
      const { data: publicUrlData } = supabase.storage
        .from('favicons')
        .getPublicUrl(fileName)

      if (!publicUrlData.publicUrl) {
        throw new Error('Failed to get public URL')
      }

      // Update site_settings with new favicon URL
      const { error: updateError } = await supabase
        .from('site_settings')
        .update({ favicon_url: fileName })
        .eq('is_active', true)
        .select()
        .single()

      if (updateError) {
        // If update fails, clean up the uploaded file
        await supabase.storage
          .from('favicons')
          .remove([fileName])
        throw updateError
      }

      // Update the favicon URL and preview
      const fullUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/favicons/${fileName}`
      setFaviconUrl(fullUrl)
      setFaviconPreview(fullUrl)
      
      // Force favicon refresh in the browser
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = fullUrl + '?t=' + new Date().getTime();
      }

      toast.success('Favicon updated successfully')

      // Cleanup old favicon if exists
      if (faviconUrl) {
        try {
          const oldFileName = faviconUrl.split('/').pop()
          if (oldFileName && oldFileName !== 'favicon.png') {
            await supabase.storage
              .from('favicons')
              .remove([oldFileName])
          }
        } catch (error) {
          console.error('Error cleaning up old favicon:', error)
        }
      }

    } catch (error: any) {
      console.error('Error:', error)
      toast.error(error.message || 'Failed to upload favicon')
      setError(error.message || 'Failed to upload favicon')
    } finally {
      setUploadingFavicon(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    uploadLogo(e.target.files[0])
  }

  const handleFaviconFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return
    }
    uploadFavicon(e.target.files[0])
  }

  const removeLogo = async () => {
    try {
      if (!logoUrl) return

      const fileName = logoUrl.split('/').pop()
      if (!fileName) return

      // Don't delete the default logo
      if (fileName !== 'logo.png') {
        await supabase.storage
          .from('logos')
          .remove([fileName])
      }

      // Update site_settings to use default logo
      const { error } = await supabase
        .from('site_settings')
        .update({ logo_url: 'logo.png' })
        .eq('is_active', true)

      if (error) throw error

      setLogoUrl('/logo.png')
      setPreview('/logo.png')
      toast.success('Logo removed successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove logo')
    }
  }

  const removeFavicon = async () => {
    try {
      if (!faviconUrl) return

      const fileName = faviconUrl.split('/').pop()
      if (!fileName) return

      // Don't delete the default favicon
      if (fileName !== 'favicon.png') {
        await supabase.storage
          .from('favicons')
          .remove([fileName])
      }

      // Update site_settings to use default favicon
      const { error } = await supabase
        .from('site_settings')
        .update({ favicon_url: 'favicon.png' })
        .eq('is_active', true)

      if (error) throw error

      setFaviconUrl('/favicon.png')
      setFaviconPreview('/favicon.png')
      toast.success('Favicon removed successfully')
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to remove favicon')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Logo Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Site Logo
        </h3>
        
        {error ? (
          <div className="text-red-600 dark:text-red-400 text-center mb-4">
            {error}
          </div>
        ) : (
          <div className="space-y-6">
            {/* Logo Preview */}
            <div className="relative h-32 w-32 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
              {preview ? (
                <Image
                  src={preview}
                  alt="Logo Preview"
                  fill
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <span className="text-gray-400 dark:text-gray-500">No logo</span>
                </div>
              )}
            </div>

            {/* Upload Button */}
            <div className="flex flex-col items-center space-y-4">
              <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
                <span>{uploading ? 'Uploading...' : 'Upload New Logo'}</span>
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                />
              </label>

              {logoUrl && logoUrl !== '/logo.png' && (
                <button
                  onClick={removeLogo}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                >
                  Remove Logo
                </button>
              )}
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
              Recommended: Square image, max 2MB.<br />
              Supported formats: PNG, JPG, GIF
            </div>
          </div>
        )}
      </div>

      {/* Favicon Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Site Favicon
        </h3>
        <div className="space-y-6">
          {/* Favicon Preview */}
          <div className="relative h-16 w-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
            {faviconPreview ? (
              <Image
                src={faviconPreview}
                alt="Favicon Preview"
                fill
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400 dark:text-gray-500 text-xs">No favicon</span>
              </div>
            )}
          </div>

          {/* Upload Favicon Button */}
          <div className="flex flex-col items-center space-y-4">
            <label className="relative cursor-pointer bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg transition-colors">
              <span>{uploadingFavicon ? 'Uploading...' : 'Upload New Favicon'}</span>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFaviconFileChange}
                disabled={uploadingFavicon}
              />
            </label>

            {faviconUrl && faviconUrl !== '/favicon.png' && (
              <button
                onClick={removeFavicon}
                className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              >
                Remove Favicon
              </button>
            )}
          </div>

          {/* Help Text */}
          <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
            Recommended: 32x32 or 16x16 pixels, max 2MB.<br />
            Supported formats: ICO, PNG
          </div>
        </div>
      </div>
    </div>
  )
}