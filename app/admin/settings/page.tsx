'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from 'react-hot-toast'
import { Database } from '@/types/supabase'

type MaintenanceSettings = {
  mode: boolean;
  title: string;
  message: string;
  contact: string;
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<MaintenanceSettings>({
    mode: false,
    title: '',
    message: '',
    contact: ''
  })
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      
      try {
        // Fetch all settings at once
        const { data, error } = await supabase
          .from('site_settings')
          .select('*');
        
        if (error) {
          throw error;
        }
        
        if (data && data.length > 0) {
          const newSettings = { ...settings };
          
          // Process the settings
          data.forEach((item: any) => {
            if (item.key === 'maintenance_mode') {
              newSettings.mode = item.value === 'true';
            } else if (item.key === 'maintenance_title') {
              newSettings.title = item.value;
            } else if (item.key === 'maintenance_message') {
              newSettings.message = item.value;
            } else if (item.key === 'maintenance_contact') {
              newSettings.contact = item.value;
            }
          });
          
          setSettings(newSettings);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast.error('Failed to load settings');
      }
      
      setIsLoading(false);
    }

    fetchSettings()

    // Subscribe to realtime changes
    const channel = supabase
      .channel('site_settings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'site_settings',
        },
        (payload: any) => {
          if (payload.new && typeof payload.new === 'object') {
            const newData = payload.new as any;
            
            if (newData.key && newData.value) {
              setSettings(prev => {
                const newSettings = { ...prev };
                const key = newData.key as string;
                const value = newData.value as string;
                
                if (key === 'maintenance_mode') {
                  newSettings.mode = value === 'true';
                } else if (key === 'maintenance_title') {
                  newSettings.title = value;
                } else if (key === 'maintenance_message') {
                  newSettings.message = value;
                } else if (key === 'maintenance_contact') {
                  newSettings.contact = value;
                }
                
                return newSettings;
              });
            }
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  const saveSettings = async () => {
    setIsSaving(true)
    
    const updates = [
      { key: 'maintenance_mode', value: settings.mode ? 'true' : 'false' },
      { key: 'maintenance_title', value: settings.title },
      { key: 'maintenance_message', value: settings.message },
      { key: 'maintenance_contact', value: settings.contact }
    ]
    
    let hasError = false
    
    for (const update of updates) {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: update.value } as any)
        .eq('key', update.key)
      
      if (error) {
        console.error(`Error updating ${update.key}:`, error)
        hasError = true
      }
    }
    
    if (hasError) {
      toast.error('Failed to update some settings')
    } else {
      toast.success('Settings updated successfully')
    }
    
    setIsSaving(false)
  }

  const toggleMaintenanceMode = async () => {
    const newSettings = { ...settings, mode: !settings.mode }
    setSettings(newSettings)
    
    const { error } = await supabase
      .from('site_settings')
      .update({ value: newSettings.mode ? 'true' : 'false' } as any)
      .eq('key', 'maintenance_mode')
    
    if (error) {
      console.error('Error updating maintenance mode:', error)
      toast.error('Failed to update maintenance mode')
      // Revert the change
      setSettings(settings)
    } else {
      toast.success(`Maintenance mode ${newSettings.mode ? 'enabled' : 'disabled'}`)
    }
  }

  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-6">Maintenance Mode</h2>
        
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full max-w-md" />
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-gray-700 dark:text-gray-300 mb-1">
                  When enabled, visitors will see a maintenance page instead of your site content
                </p>
                <p className="text-sm text-red-500">
                  {settings.mode && 'Warning: Your site is currently in maintenance mode!'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.mode}
                  onCheckedChange={toggleMaintenanceMode}
                  disabled={isSaving}
                />
                <span className="text-sm font-medium">
                  {settings.mode ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-medium mb-2">Maintenance Page Content</h3>
              
              <div>
                <label htmlFor="maintenance-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Title
                </label>
                <input
                  id="maintenance-title"
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="maintenance-message" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Message
                </label>
                <textarea
                  id="maintenance-message"
                  value={settings.message}
                  onChange={(e) => setSettings({ ...settings, message: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label htmlFor="maintenance-contact" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Contact Information
                </label>
                <textarea
                  id="maintenance-contact"
                  value={settings.contact}
                  onChange={(e) => setSettings({ ...settings, contact: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  HTML is supported for links (e.g., &lt;a href="mailto:support@oncotrition.com"&gt;support@oncotrition.com&lt;/a&gt;)
                </p>
              </div>
            </div>
            
            <div className="border-t pt-4 mt-4">
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                variant="default"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
