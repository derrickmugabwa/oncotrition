'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiUsers, FiClipboard, FiBarChart2, FiPlus, FiTrash2, FiHeart, FiActivity, FiCreditCard, FiCalendar, FiMessageCircle, FiTarget, FiAward, FiShoppingBag, FiBookOpen, FiCoffee, FiGift, FiPieChart, FiThumbsUp, FiTrendingUp } from 'react-icons/fi'
import { GiWeightScale, GiMeal, GiFruitBowl, GiCook, GiMedicines, GiSportMedal } from 'react-icons/gi'
import { MdOutlineFoodBank, MdOutlineLocalGroceryStore, MdOutlineHealthAndSafety } from 'react-icons/md'

interface Step {
  id: number
  icon: string
  title: string
  description: string
  order_number: number
}

interface StepsSettings {
  id?: number
  background_image?: string
  title?: string
  subtitle?: string
  description?: string
}

const iconMap = {
  // User & Profile Icons
  FiUser,
  FiUsers,
  
  // Health & Wellness Icons
  FiHeart,
  FiActivity,
  GiWeightScale,
  MdOutlineHealthAndSafety,
  GiMedicines,
  
  // Nutrition & Food Icons
  GiMeal,
  GiFruitBowl,
  GiCook,
  MdOutlineFoodBank,
  MdOutlineLocalGroceryStore,
  FiCoffee,
  
  // Progress & Goals Icons
  FiBarChart2,
  FiTarget,
  FiPieChart,
  FiTrendingUp,
  GiSportMedal,
  FiAward,
  
  // Planning & Management Icons
  FiClipboard,
  FiCalendar,
  FiBookOpen,
  FiShoppingBag,
  
  // Communication & Rewards
  FiMessageCircle,
  FiThumbsUp,
  FiGift,
  
  // Payment Icons
  FiCreditCard,
}

const defaultSteps = [
  {
    icon: 'FiUser',
    title: 'Register and Set Up Profile',
    description: 'Sign up, create your professional profile, and set privacy preferences for your client records.',
    order_number: 1
  },
  {
    icon: 'GiMeal',
    title: 'Add Clients and Gather Data',
    description: 'Add new clients, record their health information, dietary restrictions, and nutrition goals.',
    order_number: 2
  },
  {
    icon: 'MdOutlineFoodBank',
    title: 'Create and Assign Meal Plans',
    description: 'Develop personalized meal plans based on each client\'s needs and assign them through the platform.',
    order_number: 3
  },
  {
    icon: 'FiBarChart2',
    title: 'Monitor Progress and Adjust Plans',
    description: 'Track client progress, review feedback, and modify meal plans or recommendations as needed to meet goals.',
    order_number: 4
  }
]

export default function StepsTab() {
  const [steps, setSteps] = useState<Step[]>([])
  const [settings, setSettings] = useState<StepsSettings>({})
  const [loading, setLoading] = useState(true)
  const [uploadingImage, setUploadingImage] = useState(false)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSteps()
    fetchSettings()
  }, [])
  
  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('smartspoon_steps_settings')
        .select('*')
        .single()

      if (error && error.code !== 'PGRST116') {
        // PGRST116 is the error code for no rows returned
        throw error
      }

      if (data) {
        setSettings(data)
      }
    } catch (error) {
      console.error('Error fetching steps settings:', error)
    }
  }
  
  const validateImage = async (file: File): Promise<boolean> => {
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB')
      return false
    }
    
    // Check dimensions
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(img.src)
        // Minimum dimensions check (at least 1000px wide for good quality)
        if (img.width < 1000) {
          toast.error('Image should be at least 1000px wide')
          resolve(false)
          return
        }
        resolve(true)
      }
      img.onerror = () => {
        URL.revokeObjectURL(img.src)
        toast.error('Invalid image file')
        resolve(false)
      }
      img.src = URL.createObjectURL(file)
    })
  }
  
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    
    try {
      setUploadingImage(true)
      
      // Validate image
      const isValid = await validateImage(file)
      if (!isValid) {
        setUploadingImage(false)
        return
      }
      
      // Generate a unique file name
      const fileExt = file.name.split('.').pop()
      const fileName = `steps-bg-${Date.now()}.${fileExt}`
      const filePath = `steps/${fileName}`
      
      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file)
      
      if (uploadError) throw uploadError
      
      // Get public URL
      const { data } = supabase.storage
        .from('images')
        .getPublicUrl(filePath)
      
      if (!data.publicUrl) throw new Error('Failed to get public URL')
      
      // Update settings in the database
      await updateSettings({ background_image: data.publicUrl })
      
      toast.success('Background image uploaded successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error('Failed to upload image')
    } finally {
      setUploadingImage(false)
      // Reset the file input
      e.target.value = ''
    }
  }
  
  const updateSettings = async (updates: Partial<StepsSettings>) => {
    try {
      // Check if settings already exist
      if (settings.id) {
        // Update existing settings
        const { error } = await supabase
          .from('smartspoon_steps_settings')
          .update(updates)
          .eq('id', settings.id)
        
        if (error) throw error
      } else {
        // Create new settings
        const { error } = await supabase
          .from('smartspoon_steps_settings')
          .insert(updates)
        
        if (error) throw error
      }
      
      // Refresh settings
      await fetchSettings()
    } catch (error) {
      console.error('Error updating settings:', error)
      toast.error('Failed to update settings')
    }
  }
  
  const removeBackgroundImage = async () => {
    try {
      await updateSettings({ background_image: undefined })
      toast.success('Background image removed')
    } catch (error) {
      console.error('Error removing background image:', error)
      toast.error('Failed to remove background image')
    }
  }

  const fetchSteps = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('smartspoon_steps')
        .select('*')
        .order('order_number')

      if (error) throw error

      if (data && data.length > 0) {
        setSteps(data)
      } else {
        // If no data exists, initialize with default steps
        await initializeDefaultSteps()
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to load steps')
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultSteps = async () => {
    try {
      const { error } = await supabase
        .from('smartspoon_steps')
        .insert(defaultSteps)

      if (error) throw error

      await fetchSteps()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to initialize default steps')
    }
  }

  const updateStep = async (id: number, updates: Partial<Step>) => {
    try {
      const { error } = await supabase
        .from('smartspoon_steps')
        .update(updates)
        .eq('id', id)

      if (error) throw error
      toast.success('Step updated successfully')
      await fetchSteps()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to update step')
    }
  }

  const addStep = async () => {
    try {
      const newOrderNumber = steps.length > 0 
        ? Math.max(...steps.map(s => s.order_number)) + 1 
        : 1;

      const newStep = {
        icon: 'FiUser',
        title: 'New Step',
        description: 'Enter step description here',
        order_number: newOrderNumber
      }

      const { error } = await supabase
        .from('smartspoon_steps')
        .insert(newStep)

      if (error) throw error
      toast.success('Step added successfully')
      await fetchSteps()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to add step')
    }
  }

  const deleteStep = async (id: number) => {
    try {
      const { error } = await supabase
        .from('smartspoon_steps')
        .delete()
        .eq('id', id)

      if (error) throw error
      toast.success('Step deleted successfully')
      await fetchSteps()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to delete step')
    }
  }

  const reorderSteps = async (updatedSteps: Step[]) => {
    try {
      const updates = updatedSteps.map((step, index) => ({
        id: step.id,
        icon: step.icon,
        title: step.title,
        description: step.description,
        order_number: index + 1
      }));

      const { error } = await supabase
        .from('smartspoon_steps')
        .upsert(updates);

      if (error) throw error;
      toast.success('Steps reordered successfully');
      await fetchSteps();
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to reorder steps');
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Steps Configuration
        </h2>
        <button
          onClick={addStep}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FiPlus className="w-5 h-5" />
          Add Step
        </button>
      </div>
      
      {/* Section Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Section Content
        </h3>
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              id="section-title"
              type="text"
              value={settings.title || 'Step by step to get started'}
              onChange={(e) => updateSettings({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section title"
            />
          </div>
          
          {/* Subtitle */}
          <div>
            <label htmlFor="section-subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtitle
            </label>
            <input
              id="section-subtitle"
              type="text"
              value={settings.subtitle || 'FAST SOLUTION'}
              onChange={(e) => updateSettings({ subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section subtitle"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This appears above the title in uppercase.
            </p>
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="section-description"
              value={settings.description || "Get started with our easy-to-follow process. We've simplified nutrition management into four straightforward steps to help you achieve your health goals."}
              onChange={(e) => updateSettings({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section description"
            />
          </div>
        </div>
      </div>
      
      {/* Background Image Section */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Background Image
        </h3>
        <div className="space-y-4">
          {settings.background_image ? (
            <div className="relative">
              <img 
                src={settings.background_image} 
                alt="Steps Background" 
                className="w-full h-48 object-cover rounded-lg" 
              />
              <button
                onClick={removeBackgroundImage}
                className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600 transition-colors"
                title="Remove background image"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                No background image set. Upload an image to enhance the steps section.
              </p>
            </div>
          )}
          
          <div className="mt-4">
            <label className="relative flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors cursor-pointer">
              {uploadingImage ? (
                <>
                  <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                  Uploading...
                </>
              ) : (
                <>
                  {settings.background_image ? 'Change Background Image' : 'Upload Background Image'}
                </>
              )}
              <input 
                type="file" 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload}
                disabled={uploadingImage}
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Recommended: High-quality image at least 1000px wide. Maximum size: 2MB.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="group relative bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start gap-4">
              {/* Icon Selection and Preview */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="p-2 bg-primary/10 rounded-lg mb-2">
                    {React.createElement(iconMap[step.icon as keyof typeof iconMap], {
                      className: "w-6 h-6 text-primary"
                    })}
                  </div>
                  <select
                    value={step.icon}
                    onChange={(e) => updateStep(step.id, { icon: e.target.value })}
                    className="w-32 text-sm px-2 py-1 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/20"
                  >
                    <optgroup label="User & Profile">
                      <option value="FiUser">User</option>
                      <option value="FiUsers">Users</option>
                    </optgroup>
                    <optgroup label="Health & Wellness">
                      <option value="FiHeart">Heart</option>
                      <option value="FiActivity">Activity</option>
                      <option value="GiWeightScale">Scale</option>
                      <option value="MdOutlineHealthAndSafety">Health</option>
                      <option value="GiMedicines">Medicines</option>
                    </optgroup>
                    <optgroup label="Nutrition & Food">
                      <option value="GiMeal">Meal</option>
                      <option value="GiFruitBowl">Fruits</option>
                      <option value="GiCook">Cook</option>
                      <option value="MdOutlineFoodBank">Food Bank</option>
                      <option value="MdOutlineLocalGroceryStore">Grocery</option>
                      <option value="FiCoffee">Coffee</option>
                    </optgroup>
                    <optgroup label="Progress & Goals">
                      <option value="FiBarChart2">Chart</option>
                      <option value="FiTarget">Target</option>
                      <option value="FiPieChart">Pie Chart</option>
                      <option value="FiTrendingUp">Trending</option>
                      <option value="GiSportMedal">Medal</option>
                      <option value="FiAward">Award</option>
                    </optgroup>
                    <optgroup label="Planning">
                      <option value="FiClipboard">Clipboard</option>
                      <option value="FiCalendar">Calendar</option>
                      <option value="FiBookOpen">Book</option>
                      <option value="FiShoppingBag">Shopping</option>
                    </optgroup>
                    <optgroup label="Communication">
                      <option value="FiMessageCircle">Message</option>
                      <option value="FiThumbsUp">Like</option>
                      <option value="FiGift">Gift</option>
                    </optgroup>
                    <optgroup label="Payment">
                      <option value="FiCreditCard">Payment</option>
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-grow space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Step {index + 1}
                  </span>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(step.id, { title: e.target.value })}
                    className="flex-grow text-base font-medium bg-transparent border-b border-gray-200 dark:border-gray-700 focus:border-primary focus:ring-0 px-2 py-1"
                    placeholder="Enter step title"
                  />
                </div>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(step.id, { description: e.target.value })}
                  rows={2}
                  className="w-full text-sm bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-md focus:ring-2 focus:ring-primary/20 px-3 py-2 resize-none"
                  placeholder="Enter step description"
                />
              </div>

              {/* Actions */}
              <div className="flex-shrink-0 flex items-start gap-1">
                <button
                  onClick={() => {
                    const newIndex = index - 1;
                    if (newIndex >= 0) {
                      const updatedSteps = [...steps];
                      [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
                      reorderSteps(updatedSteps);
                    }
                  }}
                  disabled={index === 0}
                  className={`p-1.5 rounded-md transition-colors ${
                    index === 0
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    const newIndex = index + 1;
                    if (newIndex < steps.length) {
                      const updatedSteps = [...steps];
                      [updatedSteps[index], updatedSteps[newIndex]] = [updatedSteps[newIndex], updatedSteps[index]];
                      reorderSteps(updatedSteps);
                    }
                  }}
                  disabled={index === steps.length - 1}
                  className={`p-1.5 rounded-md transition-colors ${
                    index === steps.length - 1
                      ? 'text-gray-300 dark:text-gray-600 cursor-not-allowed'
                      : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <button
                  onClick={() => deleteStep(step.id)}
                  className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add Step Button */}
        <motion.button
          onClick={addStep}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-center gap-2 p-3 w-full bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors border-2 border-dashed border-gray-200 dark:border-gray-700"
        >
          <FiPlus className="w-5 h-5" />
          <span>Add New Step</span>
        </motion.button>
      </div>
    </div>
  )
}
