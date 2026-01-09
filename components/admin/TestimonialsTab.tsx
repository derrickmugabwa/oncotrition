'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { debounce } from 'lodash'

interface Testimonial {
  id: number
  name: string
  role: string
  quote: string
  rating: number
  image: string
  created_at?: string
  updated_at?: string
}

const defaultTestimonial: Omit<Testimonial, 'id'> = {
  name: '',
  role: '',
  quote: '',
  rating: 5,
  image: '/testimonials/placeholder.jpg'
}

const TestimonialsTab = () => {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editStates, setEditStates] = useState<{ [key: number]: Partial<Testimonial> }>({})
  const supabase = createClient()

  useEffect(() => {
    fetchTestimonials()
  }, [])

  const fetchTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setTestimonials(data || [])
      
      // Initialize edit states
      const initialEditStates = (data || []).reduce((acc, testimonial) => ({
        ...acc,
        [testimonial.id]: { ...testimonial }
      }), {})
      setEditStates(initialEditStates)
    } catch (error) {
      console.error('Error fetching testimonials:', error)
      toast.error('Failed to load testimonials')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddTestimonial = async () => {
    const toastId = toast.loading('Adding new testimonial...')
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .insert([defaultTestimonial])
        .select()
        .single()

      if (error) throw error
      setTestimonials([data, ...testimonials])
      setEditStates(prev => ({
        ...prev,
        [data.id]: { ...data }
      }))
      toast.success('New testimonial added successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error adding testimonial:', error)
      toast.error(error.message || 'Failed to add testimonial', { id: toastId })
    }
  }

  const handleUpdateTestimonial = (id: number, updates: Partial<Testimonial>) => {
    // Update local state immediately
    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  const handleSaveTestimonial = async (id: number) => {
    const updates = editStates[id]
    if (!updates) return

    // Show loading toast
    const toastId = toast.loading('Saving testimonial...')

    try {
      // Validate required fields
      if (!updates.name?.trim()) {
        toast.error('Name is required', { id: toastId })
        return
      }
      if (!updates.role?.trim()) {
        toast.error('Role is required', { id: toastId })
        return
      }
      if (!updates.quote?.trim()) {
        toast.error('Testimonial text is required', { id: toastId })
        return
      }

      const { error } = await supabase
        .from('testimonials')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setTestimonials(prev => 
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      )
      toast.success('Testimonial saved successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error saving testimonial:', error)
      toast.error(error.message || 'Failed to save testimonial', { id: toastId })
    }
  }

  const handleDeleteTestimonial = async (id: number) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return

    const toastId = toast.loading('Deleting testimonial...')
    try {
      const { error } = await supabase
        .from('testimonials')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setTestimonials(testimonials.filter(t => t.id !== id))
      setEditStates(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      toast.success('Testimonial deleted successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error deleting testimonial:', error)
      toast.error(error.message || 'Failed to delete testimonial', { id: toastId })
    }
  }

  const handleImageUpload = async (id: number, file: File) => {
    try {
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file')
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size should be less than 2MB')
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || ''
      const fileName = `testimonial-${id}-${Date.now()}.${fileExt}`
      const filePath = `testimonials/${fileName}`

      // Show loading toast
      toast.loading('Uploading image...', { id: 'uploadToast' })

      // Upload image to Supabase Storage
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

      // Update testimonial with new image URL
      const updates = { image: publicUrl }
      setEditStates(prev => ({
        ...prev,
        [id]: { ...prev[id], ...updates }
      }))

      // Dismiss loading toast and show success
      toast.dismiss('uploadToast')
      toast.success('Image uploaded successfully')
    } catch (error: any) {
      console.error('Error uploading image:', error)
      toast.dismiss('uploadToast')
      toast.error(error.message || 'Failed to upload image')
    }
  }

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Testimonials</h3>
          <button 
            onClick={handleAddTestimonial}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg"
          >
            Add Testimonial
          </button>
        </div>

        <div className="space-y-8">
          {testimonials.map((testimonial) => {
            const editState = editStates[testimonial.id] || testimonial
            return (
              <div 
                key={testimonial.id} 
                className="border dark:border-gray-700 rounded-xl p-6 space-y-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editState.name || 'New Testimonial'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => handleSaveTestimonial(testimonial.id)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button 
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input 
                        type="text"
                        value={editState.name}
                        onChange={(e) => handleUpdateTestimonial(testimonial.id, { name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input 
                        type="text"
                        value={editState.role}
                        onChange={(e) => handleUpdateTestimonial(testimonial.id, { role: e.target.value })}
                        placeholder="e.g., Fitness Enthusiast"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleUpdateTestimonial(testimonial.id, { rating })}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              (editState?.rating ?? testimonial.rating) >= rating 
                                ? 'text-yellow-400 hover:text-yellow-500' 
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ring-2 ring-primary/20">
                          <Image
                            src={editState?.image ?? testimonial.image}
                            alt={editState?.name ?? testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) handleImageUpload(testimonial.id, file)
                          }}
                          className="text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-primary file:text-white
                          hover:file:bg-primary/90
                          file:transition-colors
                          file:cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Testimonial
                  </label>
                  <textarea 
                    rows={3}
                    value={editState.quote}
                    onChange={(e) => handleUpdateTestimonial(testimonial.id, { quote: e.target.value })}
                    placeholder="Enter client testimonial"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default TestimonialsTab
