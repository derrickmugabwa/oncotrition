import { createClient } from '@/utils/supabase/client';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TawkToSettings from './TawkToSettings';

interface WhatsAppSettings {
  id: number;
  phone_number: string;
  message: string;
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  enabled: boolean;
}

export default function PluginsTab() {
  const [whatsappSettings, setWhatsappSettings] = useState<WhatsAppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingSettings, setEditingSettings] = useState(false);
  const [editForm, setEditForm] = useState<Omit<WhatsAppSettings, 'id'>>({
    phone_number: '',
    message: '',
    position: 'bottom-right',
    enabled: true,
  });

  const supabase = createClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_settings')
        .select('*')
        .single();

      if (error) throw error;
      setWhatsappSettings(data);
      setEditForm({
        phone_number: data.phone_number,
        message: data.message,
        position: data.position,
        enabled: data.enabled,
      });
    } catch (error) {
      console.error('Error fetching WhatsApp settings:', error);
      toast.error('Failed to load WhatsApp settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      const { error } = await supabase
        .from('whatsapp_settings')
        .update({
          phone_number: editForm.phone_number,
          message: editForm.message,
          position: editForm.position,
          enabled: editForm.enabled,
        })
        .eq('id', whatsappSettings?.id);

      if (error) throw error;

      setWhatsappSettings({ ...whatsappSettings!, ...editForm });
      setEditingSettings(false);
      toast.success('WhatsApp settings updated successfully');
    } catch (error) {
      console.error('Error updating WhatsApp settings:', error);
      toast.error('Failed to update WhatsApp settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Tabs defaultValue="whatsapp" className="w-full">
      <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
        <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
        <TabsTrigger value="tawkto">Tawk.to</TabsTrigger>
      </TabsList>

      <TabsContent value="whatsapp" className="space-y-4">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">WhatsApp Button Settings</h2>
            <button
              onClick={() => setEditingSettings(true)}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Edit Settings
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
            <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Phone Number</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{whatsappSettings?.phone_number}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
                <dd className="mt-1">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    whatsappSettings?.enabled
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {whatsappSettings?.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Position</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white capitalize">
                  {whatsappSettings?.position.replace('-', ' ')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Default Message</dt>
                <dd className="mt-1 text-sm text-gray-900 dark:text-white">{whatsappSettings?.message}</dd>
              </div>
            </dl>
          </div>

          {/* WhatsApp Edit Modal */}
          {editingSettings && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Edit WhatsApp Button Settings
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={editForm.phone_number}
                      onChange={(e) => setEditForm(prev => ({ ...prev, phone_number: e.target.value }))}
                      placeholder="e.g., 254700000000"
                      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Default Message
                    </label>
                    <textarea
                      value={editForm.message}
                      onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                      rows={3}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Position
                    </label>
                    <select
                      value={editForm.position}
                      onChange={(e) => setEditForm(prev => ({ ...prev, position: e.target.value as WhatsAppSettings['position'] }))}
                      className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    >
                      <option value="bottom-right">Bottom Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="top-left">Top Left</option>
                    </select>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="enabled"
                      checked={editForm.enabled}
                      onChange={(e) => setEditForm(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                    />
                    <label htmlFor="enabled" className="ml-2 block text-sm text-gray-900 dark:text-white">
                      Enable WhatsApp Button
                    </label>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    onClick={() => setEditingSettings(false)}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </TabsContent>

      <TabsContent value="tawkto" className="space-y-4">
        <TawkToSettings />
      </TabsContent>
    </Tabs>
  );
}
