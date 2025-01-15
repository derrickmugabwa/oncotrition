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
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSteps()
  }, [])

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
