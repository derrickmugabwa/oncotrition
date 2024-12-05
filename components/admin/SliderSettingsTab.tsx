'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { toast } from 'react-hot-toast'
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline'
import { Toaster } from 'react-hot-toast'

interface SliderImage {
  id: number
  title: string
  description: string
  image_url: string
  cta_text: string
  order: number
}

interface SlideForm {
  title: string
  description: string
  cta_text: string
}

const MAX_SLIDES = 5

const SliderSettingsTab = () => {
  const [sliderImages, setSliderImages] = useState<SliderImage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [forms, setForms] = useState<SlideForm[]>([
    { title: '', description: '', cta_text: '' }
  ])
  const supabase = createClientComponentClient()
  const router = useRouter()

  const validateImage = (file: File): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        
        // Check dimensions
        const minWidth = 1280;
        const minHeight = 720;
        const maxWidth = 3840;
        const maxHeight = 2160;
        const maxFileSize = 2 * 1024 * 1024; // 2MB

        if (file.size > maxFileSize) {
          toast.error('Image file size should be less than 2MB');
          resolve(false);
          return;
        }

        if (img.width < minWidth || img.height < minHeight) {
          toast.error(`Image resolution is too low. Minimum recommended resolution is ${minWidth}x${minHeight}px`);
          resolve(false);
          return;
        }

        if (img.width > maxWidth || img.height > maxHeight) {
          toast.error(`Image resolution is too high. Maximum allowed resolution is ${maxWidth}x${maxHeight}px`);
          resolve(false);
          return;
        }

        resolve(true);
      };

      img.onerror = () => {
        URL.revokeObjectURL(img.src);
        toast.error('Invalid image file');
        resolve(false);
      };
    });
  };

  const handleFileUpload = async (file: File, index: number) => {
    try {
      setIsLoading(true)
      setError(null)

      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate image dimensions and size
      const isValid = await validateImage(file);
      if (!isValid) {
        setIsLoading(false);
        return;
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      const fileName = `slider-${Date.now()}-${index}.${fileExt}`
      const filePath = `slider/${fileName}`

      toast.loading('Uploading image...', { id: 'uploadToast' })

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath)

      const newSliderImages = [...sliderImages]
      if (newSliderImages[index]) {
        newSliderImages[index].image_url = publicUrl
      } else {
        newSliderImages[index] = {
          id: index + 1,
          image_url: publicUrl,
          order: index,
          title: forms[index].title,
          description: forms[index].description,
          cta_text: forms[index].cta_text
        }
      }
      setSliderImages(newSliderImages)
      toast.success('Image uploaded successfully', { id: 'uploadToast' })
    } catch (error: any) {
      console.error('Error uploading slider image:', error)
      setError(error.message)
      toast.error(error.message, { id: 'uploadToast' })
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch existing slider images
  useEffect(() => {
    const fetchSliderImages = async () => {
      try {
        const { data, error } = await supabase
          .from('slider_images')
          .select('*')
          .order('order')

        if (error) throw error
        
        if (data && data.length > 0) {
          setSliderImages(data)
          const initialForms = data.map(slide => ({
            title: slide.title,
            description: slide.description || '',
            cta_text: slide.cta_text || ''
          }))
          setForms(initialForms)
        }
      } catch (error: any) {
        console.error('Error fetching slider images:', error)
        setError(error.message)
      }
    }

    fetchSliderImages()
  }, [supabase])

  const handleSave = async () => {
    const toastId = toast.loading('Saving changes...')
    try {
      setIsSaving(true)
      setError(null)

      // Validate required fields
      const missingFields = forms.some((form, index) => {
        if (!form.title) {
          toast.error(`Slide ${index + 1}: Title is required`, { id: toastId })
          return true
        }
        if (!sliderImages[index]?.image_url) {
          toast.error(`Slide ${index + 1}: Image is required`, { id: toastId })
          return true
        }
        return false
      })

      if (missingFields) {
        setIsSaving(false)
        return
      }

      const updatedSlides = forms.map((form, index) => ({
        id: sliderImages[index]?.id,
        title: form.title,
        description: form.description,
        cta_text: form.cta_text,
        image_url: sliderImages[index]?.image_url,
        order: index
      }))

      const { error } = await supabase
        .from('slider_images')
        .upsert(updatedSlides)

      if (error) throw error

      toast.success('Changes saved successfully', { id: toastId })
      router.refresh()
    } catch (error: any) {
      console.error('Error saving slider settings:', error)
      setError(error.message)
      toast.error('Failed to save changes: ' + error.message, { id: toastId })
    } finally {
      setIsSaving(false)
    }
  }

  const handleFormChange = (index: number, field: keyof SlideForm, value: string) => {
    const newForms = [...forms]
    newForms[index] = { ...newForms[index], [field]: value }
    setForms(newForms)
  }

  const addSlide = () => {
    if (forms.length >= MAX_SLIDES) {
      toast.error(`Maximum ${MAX_SLIDES} slides allowed`)
      return
    }
    setForms([...forms, { title: '', description: '', cta_text: '' }])
    toast.success('New slide added')
  }

  const removeSlide = (index: number) => {
    const newForms = forms.filter((_, i) => i !== index)
    const newSliderImages = sliderImages.filter((_, i) => i !== index)
    setForms(newForms)
    setSliderImages(newSliderImages)
    toast.success(`Slide ${index + 1} removed`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Hero Slider Images</h3>
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || isLoading}
              className="px-3 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              {isSaving ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  <span>Save Changes</span>
                </>
              )}
            </button>
            <button
              onClick={addSlide}
              disabled={forms.length >= MAX_SLIDES}
              className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
            >
              <PlusIcon className="w-4 h-4" />
              Add Slide
            </button>
          </div>
        </div>
        
        {error && (
          <div className="mb-3 p-2 text-sm text-red-700 bg-red-100 rounded-lg flex items-center gap-2">
            <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            {error}
          </div>
        )}
        
        <div className="space-y-4 mb-8">
          <h3 className="text-lg font-medium text-gray-900">Image Requirements:</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Recommended resolution: 1920x1080 pixels (16:9 aspect ratio)</li>
            <li>Minimum resolution: 1280x720 pixels</li>
            <li>Maximum resolution: 3840x2160 pixels</li>
            <li>Maximum file size: 2MB</li>
            <li>Supported formats: JPG, PNG, WebP</li>
            <li>For best results, use high-quality images with good contrast</li>
          </ul>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {forms.map((form, index) => (
            <div key={index} className="relative p-3 border border-gray-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">
                  Slide {index + 1}
                </h4>
                <div className="flex items-center gap-2">
                  {forms.length > 1 && (
                    <button
                      onClick={() => removeSlide(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              <div className="relative aspect-[16/9] bg-gray-100 rounded-lg overflow-hidden">
                {sliderImages[index]?.image_url ? (
                  <>
                    <Image
                      src={sliderImages[index].image_url}
                      alt={`Slide ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    <label className="absolute bottom-2 right-2 px-2 py-1 bg-black/50 text-white text-xs rounded cursor-pointer hover:bg-black/70">
                      Change
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, index)
                        }}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </label>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <label className="px-3 py-1.5 bg-blue-50 text-blue-600 text-sm rounded-lg cursor-pointer hover:bg-blue-100 transition-colors">
                      Upload Image
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleFileUpload(file, index)
                        }}
                        disabled={isLoading}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => handleFormChange(index, 'title', e.target.value)}
                  placeholder="Slide Title"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <textarea
                  value={form.description}
                  onChange={(e) => handleFormChange(index, 'description', e.target.value)}
                  placeholder="Slide Description"
                  rows={2}
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />

                <input
                  type="text"
                  value={form.cta_text}
                  onChange={(e) => handleFormChange(index, 'cta_text', e.target.value)}
                  placeholder="Button Text"
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed bottom-4 right-4 z-50">
        <div className="toaster-container">
          <Toaster 
            position="bottom-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: '#333',
                color: '#fff',
                fontSize: '14px',
                borderRadius: '8px',
                padding: '12px 20px',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </div>
      </div>
    </div>
  )
}

export default SliderSettingsTab
