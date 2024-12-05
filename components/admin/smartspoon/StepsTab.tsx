'use client'

import React, { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import { FiUser, FiUsers, FiClipboard, FiBarChart2, FiPlus, FiTrash2 } from 'react-icons/fi'

interface Step {
  id: number
  icon: string
  title: string
  description: string
  order_number: number
}

const iconMap = {
  FiUser,
  FiUsers,
  FiClipboard,
  FiBarChart2,
}

const defaultSteps = [
  {
    icon: 'FiUser',
    title: 'Register and Set Up Profile',
    description: 'Sign up, create your professional profile, and set privacy preferences for your client records.',
    order_number: 1
  },
  {
    icon: 'FiUsers',
    title: 'Add Clients and Gather Data',
    description: 'Add new clients, record their health information, dietary restrictions, and nutrition goals.',
    order_number: 2
  },
  {
    icon: 'FiClipboard',
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

  const reorderSteps = async (steps: Step[]) => {
    try {
      const updates = steps.map((step, index) => ({
        id: step.id,
        order_number: index + 1
      }))

      const { error } = await supabase
        .from('smartspoon_steps')
        .upsert(updates)

      if (error) throw error
      await fetchSteps()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to reorder steps')
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {steps.map((step, index) => (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg relative group"
          >
            <button
              onClick={() => deleteStep(step.id)}
              className="absolute top-4 right-4 p-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
              title="Delete step"
            >
              <FiTrash2 className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <select
                  value={step.icon}
                  onChange={(e) => updateStep(step.id, { icon: e.target.value })}
                  className="block w-24 rounded-md border-gray-300 dark:border-gray-600 bg-transparent"
                >
                  {Object.keys(iconMap).map((iconName) => (
                    <option key={iconName} value={iconName}>
                      {iconName}
                    </option>
                  ))}
                </select>
                {step.icon && iconMap[step.icon as keyof typeof iconMap] && (
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <div className="w-6 h-6 text-primary">
                      {React.createElement(iconMap[step.icon as keyof typeof iconMap])}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Step {index + 1}
                </label>
                <input
                  type="text"
                  value={step.title}
                  onChange={(e) => updateStep(step.id, { title: e.target.value })}
                  className="block w-full text-lg font-semibold bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary focus:ring-0"
                  placeholder="Step Title"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Description
                </label>
                <textarea
                  value={step.description}
                  onChange={(e) => updateStep(step.id, { description: e.target.value })}
                  rows={3}
                  className="block w-full bg-transparent border-gray-300 dark:border-gray-600 rounded-md focus:border-primary focus:ring-0"
                  placeholder="Step Description"
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
