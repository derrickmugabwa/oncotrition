'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import toast from 'react-hot-toast'

interface Statistic {
  id: number
  number: string
  label: string
  display_order: number
  created_at?: string
  updated_at?: string
}

const defaultStatistic = {
  number: '',
  label: '',
  display_order: 0
}

const StatisticsTab = () => {
  const [statistics, setStatistics] = useState<Statistic[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editStates, setEditStates] = useState<{ [key: number]: Partial<Statistic> }>({})
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchStatistics()
  }, [])

  const fetchStatistics = async () => {
    try {
      const { data, error } = await supabase
        .from('statistics')
        .select('*')
        .order('display_order')

      if (error) throw error
      setStatistics(data || [])
      
      // Initialize edit states
      const initialEditStates = (data || []).reduce((acc, stat) => ({
        ...acc,
        [stat.id]: { ...stat }
      }), {})
      setEditStates(initialEditStates)
    } catch (error: any) {
      console.error('Error fetching statistics:', error)
      toast.error('Failed to load statistics')
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStatistic = async () => {
    if (statistics.length >= 5) {
      toast.error('Maximum of 5 statistics allowed')
      return
    }

    const toastId = toast.loading('Adding new statistic...')
    try {
      const newStatistic = {
        ...defaultStatistic,
        display_order: statistics.length
      }

      const { data, error } = await supabase
        .from('statistics')
        .insert([newStatistic])
        .select()
        .single()

      if (error) throw error
      setStatistics([...statistics, data])
      setEditStates(prev => ({
        ...prev,
        [data.id]: { ...data }
      }))
      toast.success('New statistic added successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error adding statistic:', error)
      toast.error(error.message || 'Failed to add statistic', { id: toastId })
    }
  }

  const handleUpdateStatistic = (id: number, updates: Partial<Statistic>) => {
    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }))
  }

  const handleSaveStatistic = async (id: number) => {
    const updates = editStates[id]
    if (!updates) return

    const toastId = toast.loading('Saving statistic...')
    try {
      // Validate required fields
      if (!updates.number?.trim()) {
        toast.error('Number is required', { id: toastId })
        return
      }
      if (!updates.label?.trim()) {
        toast.error('Label is required', { id: toastId })
        return
      }

      const { error } = await supabase
        .from('statistics')
        .update(updates)
        .eq('id', id)

      if (error) throw error

      setStatistics(prev => 
        prev.map(s => s.id === id ? { ...s, ...updates } : s)
      )
      toast.success('Statistic saved successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error saving statistic:', error)
      toast.error(error.message || 'Failed to save statistic', { id: toastId })
    }
  }

  const handleDeleteStatistic = async (id: number) => {
    if (!confirm('Are you sure you want to delete this statistic?')) return

    const toastId = toast.loading('Deleting statistic...')
    try {
      const { error } = await supabase
        .from('statistics')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      const updatedStatistics = statistics.filter(s => s.id !== id)
      // Update display_order for remaining statistics
      for (let i = 0; i < updatedStatistics.length; i++) {
        await supabase
          .from('statistics')
          .update({ display_order: i })
          .eq('id', updatedStatistics[i].id)
      }

      setStatistics(updatedStatistics)
      setEditStates(prev => {
        const newState = { ...prev }
        delete newState[id]
        return newState
      })
      toast.success('Statistic deleted successfully', { id: toastId })
    } catch (error: any) {
      console.error('Error deleting statistic:', error)
      toast.error(error.message || 'Failed to delete statistic', { id: toastId })
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Statistics</h3>
          <button 
            onClick={handleAddStatistic}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg"
          >
            Add Statistic
          </button>
        </div>

        <div className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {statistics.map((statistic) => {
            const editState = editStates[statistic.id] || statistic
            return (
              <div 
                key={statistic.id} 
                className="border dark:border-gray-700 rounded-lg p-4 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                    Statistic #{statistic.display_order + 1}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <button 
                      onClick={() => handleSaveStatistic(statistic.id)}
                      className="px-2 py-1 text-xs bg-primary hover:bg-primary/90 text-white rounded transition-all duration-300 focus:ring-1 focus:ring-primary/50"
                    >
                      Save
                    </button>
                    <button 
                      onClick={() => handleDeleteStatistic(statistic.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Number
                    </label>
                    <input 
                      type="text"
                      value={editState.number}
                      onChange={(e) => handleUpdateStatistic(statistic.id, { number: e.target.value })}
                      placeholder="e.g., 10M+"
                      className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Label
                    </label>
                    <input 
                      type="text"
                      value={editState.label}
                      onChange={(e) => handleUpdateStatistic(statistic.id, { label: e.target.value })}
                      placeholder="e.g., Active Users Worldwide"
                      className="w-full px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all duration-300"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default StatisticsTab