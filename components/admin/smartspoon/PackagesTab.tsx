'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaEdit, FaTrash, FaPlus, FaTimes, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Package {
  id: number;
  name: string;
  price: number;
  features: string[];
  recommended: boolean;
  gradient: string;
  order_number: number;
  duration_type: string;
  show_price: boolean;
}

interface PackagesSettings {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
}

const defaultPackages = [
  {
    name: 'Basic Plan',
    price: 29.99,
    features: [
      'Personalized meal plans',
      'Basic nutrition tracking',
      'Weekly check-ins',
      'Email support'
    ],
    recommended: false,
    gradient: 'from-blue-400/20 to-indigo-400/20',
    order_number: 1,
    duration_type: 'month',
    show_price: true
  },
  {
    name: 'Pro Plan',
    price: 49.99,
    features: [
      'Everything in Basic Plan',
      'Advanced nutrition analytics',
      'Daily meal suggestions',
      'Priority email support',
      'Video consultations'
    ],
    recommended: true,
    gradient: 'from-purple-400/20 to-pink-400/20',
    order_number: 2,
    duration_type: 'month',
    show_price: true
  },
  {
    name: 'Premium Plan',
    price: 99.99,
    features: [
      'Everything in Pro Plan',
      '24/7 chat support',
      'Custom recipe creation',
      'Shopping list generator',
      'Family meal planning',
      'Nutritionist on demand'
    ],
    recommended: false,
    gradient: 'from-amber-400/20 to-orange-400/20',
    order_number: 3,
    duration_type: 'month',
    show_price: true
  }
];

export default function PackagesTab() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [settings, setSettings] = useState<PackagesSettings>({
    title: 'Choose the Right Plan for Your Practice',
    subtitle: 'PRICING PLANS',
    description: 'Select from our range of flexible pricing options designed to meet the needs of nutrition professionals at every stage of their practice.'
  });
  const [loading, setLoading] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: number;
    features: string[];
    recommended: boolean;
    gradient: string;
    order_number: number;
    duration_type: string;
    show_price: boolean;
  }>({
    name: '',
    price: 0,
    features: [],
    recommended: false,
    gradient: '',
    order_number: 0,
    duration_type: 'month',
    show_price: true
  });
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPackages();
    fetchSettings();
  }, []);
  
  const fetchSettings = async () => {
    try {
      setSettingsLoading(true);
      
      // Add proper headers to avoid 406 error
      const { data, error } = await supabase
        .from('smartspoon_packages_settings')
        .select('*')
        .order('id', { ascending: false })
        .limit(1);

      console.log('Fetch settings response:', { data, error });
      
      if (error) {
        throw error;
      }

      if (data && data.length > 0) {
        setSettings(data[0]);
        console.log('Settings loaded:', data[0]);
      } else {
        // If no settings exist, create default settings
        console.log('No settings found, initializing defaults');
        await initializeDefaultSettings();
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error(error.message || 'Failed to load settings');
    } finally {
      setSettingsLoading(false);
    }
  };
  
  const initializeDefaultSettings = async () => {
    try {
      const { error } = await supabase
        .from('smartspoon_packages_settings')
        .insert([{
          title: settings.title,
          subtitle: settings.subtitle,
          description: settings.description
        }]);

      if (error) throw error;
      await fetchSettings();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to initialize settings');
      setSettingsLoading(false);
    }
  };
  
  const updateSettings = async (updates: Partial<PackagesSettings>) => {
    try {
      // Check if settings already exist
      if (settings.id) {
        const { error } = await supabase
          .from('smartspoon_packages_settings')
          .update(updates)
          .eq('id', settings.id);
        
        if (error) throw error;
      } else {
        // Create new settings if they don't exist
        const { error } = await supabase
          .from('smartspoon_packages_settings')
          .insert([{
            ...settings,
            ...updates
          }]);
        
        if (error) throw error;
      }
      
      // Update local state
      setSettings(prev => ({
        ...prev,
        ...updates
      }));
      
      return true;
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Failed to update settings');
      return false;
    }
  };
  
  const handleSaveSettings = async () => {
    try {
      setSettingsLoading(true);
      const success = await updateSettings(settings);
      if (success) {
        toast.success('Settings updated successfully');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  };

  useEffect(() => {
    if (editingPackage) {
      setEditForm({
        name: editingPackage.name,
        price: editingPackage.price,
        features: [...editingPackage.features],
        recommended: editingPackage.recommended,
        gradient: editingPackage.gradient,
        order_number: editingPackage.order_number,
        duration_type: editingPackage.duration_type,
        show_price: editingPackage.show_price
      });
    }
  }, [editingPackage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('smartspoon_packages')
        .select('*')
        .order('order_number');

      if (error) throw error;

      if (data && data.length > 0) {
        setPackages(data);
      } else {
        await initializeDefaultPackages();
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultPackages = async () => {
    try {
      const { error } = await supabase
        .from('smartspoon_packages')
        .insert(defaultPackages);

      if (error) throw error;
      await fetchPackages();
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to initialize default packages');
    }
  };

  const handleAddPackage = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const newOrderNumber = packages.length > 0 
        ? Math.max(...packages.map(p => p.order_number)) + 1 
        : 1;

      const newPackage = {
        name: 'New Package',
        price: 0,
        features: ['New Feature'],
        recommended: false,
        gradient: 'from-blue-400/20 to-indigo-400/20',
        order_number: newOrderNumber,
        duration_type: 'month',
        show_price: true
      };

      const { data, error } = await supabase
        .from('smartspoon_packages')
        .insert([newPackage])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPackages(prevPackages => [...prevPackages, data]);
        toast.success('Package added successfully');
      }
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to add package');
    }
  };

  const handleDeletePackage = async (id: number) => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('smartspoon_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== id));
      toast.success('Package deleted successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to delete package');
    }
  };

  const handleUpdatePackage = async () => {
    if (!editingPackage) return;

    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('smartspoon_packages')
        .update({
          name: editForm.name,
          price: editForm.price,
          features: editForm.features,
          recommended: editForm.recommended,
          gradient: editForm.gradient,
          order_number: editForm.order_number,
          duration_type: editForm.duration_type,
          show_price: editForm.show_price
        })
        .eq('id', editingPackage.id);

      if (error) throw error;

      await fetchPackages();
      setEditingPackage(null);
      toast.success('Package updated successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update package');
    }
  };

  const handleFeatureChange = (index: number, value: string) => {
    const newFeatures = [...editForm.features];
    newFeatures[index] = value;
    setEditForm(prev => ({ ...prev, features: newFeatures }));
  };

  const addFeature = () => {
    setEditForm(prev => ({
      ...prev,
      features: [...prev.features, '']
    }));
  };

  const removeFeature = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };

  const handleMovePackage = async (packageId: number, direction: 'up' | 'down') => {
    try {
      const currentIndex = packages.findIndex(p => p.id === packageId);
      if (currentIndex === -1) return;

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
      if (newIndex < 0 || newIndex >= packages.length) return;

      const updatedPackages = [...packages];
      const [movedPackage] = updatedPackages.splice(currentIndex, 1);
      updatedPackages.splice(newIndex, 0, movedPackage);

      // Update order_number for all packages
      const updatedPackagesWithOrder = updatedPackages.map((pkg, index) => ({
        ...pkg,
        order_number: index + 1
      }));

      // Update all packages in the database
      const { error } = await supabase
        .from('smartspoon_packages')
        .upsert(updatedPackagesWithOrder.map(pkg => ({
          id: pkg.id,
          order_number: pkg.order_number
        })));

      if (error) throw error;

      setPackages(updatedPackagesWithOrder);
      toast.success('Package order updated successfully');
    } catch (error: any) {
      console.error('Error:', error);
      toast.error(error.message || 'Failed to update package order');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Packages Configuration
        </h2>
        <button
          onClick={handleAddPackage}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <FaPlus className="w-4 h-4" />
          Add Package
        </button>
      </div>
      
      {/* Section Settings */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Section Content
        </h3>
        <div className="space-y-4">
          {/* Subtitle */}
          <div>
            <label htmlFor="section-subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Subtitle
            </label>
            <input
              id="section-subtitle"
              type="text"
              value={settings.subtitle || ''}
              onChange={(e) => {
                setSettings(prev => ({...prev, subtitle: e.target.value}));
              }}
              onBlur={(e) => updateSettings({ subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section subtitle"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              This appears above the title in uppercase.
            </p>
          </div>
          
          {/* Title */}
          <div>
            <label htmlFor="section-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Title
            </label>
            <input
              id="section-title"
              type="text"
              value={settings.title || ''}
              onChange={(e) => {
                setSettings(prev => ({...prev, title: e.target.value}));
              }}
              onBlur={(e) => updateSettings({ title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section title"
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="section-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="section-description"
              value={settings.description || ''}
              onChange={(e) => {
                setSettings(prev => ({...prev, description: e.target.value}));
              }}
              onBlur={(e) => updateSettings({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-800 dark:text-white"
              placeholder="Enter section description"
            />
          </div>
          
          {/* Save Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={async () => {
                console.log('Save button clicked');
                console.log('Current settings:', settings);
                
                try {
                  // Create settings if they don't exist yet
                  if (!settings.id) {
                    console.log('Creating new settings...');
                    const { data, error } = await supabase
                      .from('smartspoon_packages_settings')
                      .insert([{
                        title: settings.title,
                        subtitle: settings.subtitle,
                        description: settings.description
                      }])
                      .select();
                      
                    if (error) {
                      console.error('Error creating settings:', error);
                      toast.error('Failed to create settings');
                      return;
                    }
                    
                    if (data && data[0]) {
                      setSettings({...settings, id: data[0].id});
                      toast.success('Settings created successfully');
                    }
                  } else {
                    // Update existing settings
                    console.log('Updating settings with ID:', settings.id);
                    console.log('Data to update:', {
                      title: settings.title,
                      subtitle: settings.subtitle,
                      description: settings.description
                    });
                    
                    const { data, error } = await supabase
                      .from('smartspoon_packages_settings')
                      .update({
                        title: settings.title || '',
                        subtitle: settings.subtitle || '',
                        description: settings.description || ''
                      })
                      .eq('id', settings.id)
                      .select();
                      
                    if (error) {
                      console.error('Error updating settings:', error);
                      toast.error('Failed to update settings: ' + error.message);
                      return;
                    }
                    
                    console.log('Update response:', data);
                    toast.success('Settings updated successfully');
                    
                    // Refresh settings from the database to ensure UI is in sync
                    fetchSettings();
                  }
                } catch (err) {
                  console.error('Unexpected error:', err);
                  toast.error('An unexpected error occurred');
                }
              }}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-md shadow-sm transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Features
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Recommended
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {packages.map((pkg) => (
                <tr key={pkg.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {pkg.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {pkg.show_price ? `KES ${pkg.price.toLocaleString()}/${pkg.duration_type}` : 'Price hidden'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    {pkg.features.length} features
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {pkg.recommended ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleMovePackage(pkg.id, 'up')}
                        disabled={packages.indexOf(pkg) === 0}
                        className={`p-2 rounded-lg transition-colors ${
                          packages.indexOf(pkg) === 0
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <FaArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMovePackage(pkg.id, 'down')}
                        disabled={packages.indexOf(pkg) === packages.length - 1}
                        className={`p-2 rounded-lg transition-colors ${
                          packages.indexOf(pkg) === packages.length - 1
                            ? 'text-gray-400 cursor-not-allowed'
                            : 'text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20'
                        }`}
                      >
                        <FaArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setEditingPackage(pkg)}
                        className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePackage(pkg.id)}
                        className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal */}
      {editingPackage && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-xl transform transition-all">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-indigo-600 bg-clip-text text-transparent">
                    Edit Package
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update your package details below
                  </p>
                </div>
                <button
                  onClick={() => setEditingPackage(null)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Name & Price Group */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Package Name
                    </label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Enter package name"
                    />
                  </div>

                  {/* Price and Duration */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Price (KES)
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                        KES
                      </span>
                      <input
                        type="number"
                        step="0.01"
                        value={editForm.price}
                        onChange={(e) => setEditForm(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                        className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                        placeholder="0.00"
                      />
                    </div>
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Duration
                      </label>
                      <select
                        value={isCustomDuration ? 'custom' : editForm.duration_type}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === 'custom') {
                            setIsCustomDuration(true);
                          } else {
                            setIsCustomDuration(false);
                            setEditForm(prev => ({ ...prev, duration_type: value }));
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      >
                        <option value="day">Per Day</option>
                        <option value="week">Per Week</option>
                        <option value="month">Per Month</option>
                        <option value="year">Per Year</option>
                        <option value="custom">Custom</option>
                      </select>

                      {isCustomDuration && (
                        <div className="mt-2">
                          <input
                            type="text"
                            value={editForm.duration_type}
                            onChange={(e) => setEditForm(prev => ({ ...prev, duration_type: e.target.value }))}
                            placeholder="Enter custom duration (e.g., lifetime)"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Package Features
                    </label>
                    <button
                      type="button"
                      onClick={addFeature}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    >
                      <FaPlus className="mr-2 h-3 w-3" />
                      Add Feature
                    </button>
                  </div>
                  <div className="space-y-3">
                    {editForm.features.map((feature, index) => (
                      <div key={index} className="flex gap-3 items-center group">
                        <div className="relative flex-1">
                          <input
                            type="text"
                            value={feature}
                            onChange={(e) => handleFeatureChange(index, e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                            placeholder="Enter feature description"
                          />
                        </div>
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <FaTimes className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Settings Group */}
                <div className="grid grid-cols-2 gap-6">
                  {/* Recommended */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Package Status
                    </label>
                    <div 
                      onClick={() => setEditForm(prev => ({ ...prev, recommended: !prev.recommended }))}
                      className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                        ${editForm.recommended 
                          ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                          : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}
                    >
                      <span className="text-sm text-gray-900 dark:text-white">
                        Recommended Package
                      </span>
                      <div className="relative">
                        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                          editForm.recommended ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                        }`}>
                          <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                            editForm.recommended ? 'translate-x-5' : 'translate-x-0'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Gradient */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Color Theme
                    </label>
                    <select
                      value={editForm.gradient}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gradient: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    >
                      <option value="from-blue-400/20 to-indigo-400/20">Blue to Indigo</option>
                      <option value="from-purple-400/20 to-pink-400/20">Purple to Pink</option>
                      <option value="from-amber-400/20 to-orange-400/20">Amber to Orange</option>
                      <option value="from-green-400/20 to-teal-400/20">Green to Teal</option>
                      <option value="from-red-400/20 to-rose-400/20">Red to Rose</option>
                    </select>
                  </div>
                </div>

                {/* Show Price */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Show Price
                  </label>
                  <div 
                    onClick={() => setEditForm(prev => ({ ...prev, show_price: !prev.show_price }))}
                    className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all
                      ${editForm.show_price 
                        ? 'border-primary bg-primary/5 dark:bg-primary/10' 
                        : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700'}`}
                  >
                    <span className="text-sm text-gray-900 dark:text-white">
                      Show Price
                    </span>
                    <div className="relative">
                      <div className={`w-11 h-6 rounded-full transition-colors duration-200 ease-in-out ${
                        editForm.show_price ? 'bg-primary' : 'bg-gray-200 dark:bg-gray-600'
                      }`}>
                        <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
                          editForm.show_price ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-4 mt-8">
                  <button
                    onClick={() => setEditingPackage(null)}
                    className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdatePackage}
                    className="px-6 py-2.5 rounded-xl bg-primary text-white hover:bg-primary/90 transition-colors"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
