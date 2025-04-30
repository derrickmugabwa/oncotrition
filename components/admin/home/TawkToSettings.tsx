import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

interface TawkToSettings {
  id: number;
  property_id: string;
  widget_id: string;
  enabled: boolean;
}

export default function TawkToSettings() {
  const [settings, setSettings] = useState<TawkToSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Omit<TawkToSettings, 'id'>>({
    property_id: '',
    widget_id: '',
    enabled: false,
  });

  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('tawkto_settings')
        .select('*')
        .single();

      if (error) throw error;
      setSettings(data);
      setEditForm({
        property_id: data.property_id,
        widget_id: data.widget_id,
        enabled: data.enabled,
      });
    } catch (error) {
      console.error('Error fetching Tawk.to settings:', error);
      toast.error('Failed to load Tawk.to settings');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { error } = await supabase
        .from('tawkto_settings')
        .update({
          property_id: editForm.property_id,
          widget_id: editForm.widget_id,
          enabled: editForm.enabled,
        })
        .eq('id', settings?.id);

      if (error) throw error;

      setSettings({ ...settings!, ...editForm });
      setEditing(false);
      toast.success('Tawk.to settings updated successfully');
    } catch (error) {
      console.error('Error updating Tawk.to settings:', error);
      toast.error('Failed to update Tawk.to settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Tawk.to Chat Settings</h2>
        <button
          onClick={() => setEditing(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
        >
          Edit Settings
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
        <dl className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Property ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{settings?.property_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Widget ID</dt>
            <dd className="mt-1 text-sm text-gray-900 dark:text-white">{settings?.widget_id}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</dt>
            <dd className="mt-1">
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                settings?.enabled
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {settings?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full space-y-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Edit Tawk.to Settings
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Property ID
                </label>
                <input
                  type="text"
                  value={editForm.property_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, property_id: e.target.value }))}
                  placeholder="Enter your Tawk.to Property ID"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Widget ID
                </label>
                <input
                  type="text"
                  value={editForm.widget_id}
                  onChange={(e) => setEditForm(prev => ({ ...prev, widget_id: e.target.value }))}
                  placeholder="Enter your Tawk.to Widget ID"
                  className="mt-1 w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
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
                  Enable Tawk.to Chat
                </label>
              </div>

              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <p>To find your Property ID and Widget ID:</p>
                <ol className="list-decimal ml-4 mt-1 space-y-1">
                  <li>Log in to your Tawk.to dashboard</li>
                  <li>Go to Administration → Chat Widget</li>
                  <li>Select your widget</li>
                  <li>The IDs will be in the Widget Code</li>
                </ol>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
