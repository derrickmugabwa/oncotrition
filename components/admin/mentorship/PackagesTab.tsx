'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { FaEdit, FaTrash, FaPlus, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

interface Package {
  id: number;
  name: string;
  price: number;
  international_price: number;
  title: string;
  description: string;
  features: string[];
  recommended: boolean;
  gradient: string;
  order_number: number;
  duration_type: string;
  url: string;
  show_price: boolean;
}

export default function PackagesTab() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [showSectionSettings, setShowSectionSettings] = useState(false);
  const [sectionSettings, setSectionSettings] = useState({
    title: 'Our Mentorship Packages',
    description: 'Choose the perfect mentorship package tailored to your needs and goals.'
  });
  const [editForm, setEditForm] = useState<{
    name: string;
    price: number;
    international_price: number;
    title: string;
    description: string;
    features: string[];
    recommended: boolean;
    gradient: string;
    order_number: number;
    duration_type: string;
    url: string;
    show_price: boolean;
  }>({
    name: '',
    price: 0,
    international_price: 0,
    title: '',
    description: '',
    features: [],
    recommended: false,
    gradient: '',
    order_number: 0,
    duration_type: 'month',
    url: '',
    show_price: true
  });
  const [isCustomDuration, setIsCustomDuration] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchPackages();
  }, []);

  useEffect(() => {
    if (editingPackage) {
      setEditForm({
        name: editingPackage.name,
        price: editingPackage.price,
        international_price: editingPackage.international_price || editingPackage.price,
        title: editingPackage.title || '',
        description: editingPackage.description || '',
        features: [...editingPackage.features],
        recommended: editingPackage.recommended,
        gradient: editingPackage.gradient,
        order_number: editingPackage.order_number,
        duration_type: editingPackage.duration_type,
        url: editingPackage.url,
        show_price: editingPackage.show_price,
      });
    }
  }, [editingPackage]);

  const fetchPackages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('mentorship_packages')
        .select('*')
        .order('price');

      if (error) throw error;

      if (data && data.length > 0) {
        setPackages(data);
        
        // Look for section title and description in the first package
        // These are used as section-wide settings
        if (data[0].title) {
          setSectionSettings(prev => ({
            ...prev,
            title: data[0].title
          }));
        }
        
        if (data[0].description) {
          setSectionSettings(prev => ({
            ...prev,
            description: data[0].description
          }));
        }
      }
    } catch (error: any) {
      console.error('Error fetching packages:', error);
      toast.error(error.message || 'Failed to load packages');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPackage = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }

      const newPackage = {
        name: 'New Package',
        price: 0,
        international_price: 0,
        title: 'Our Mentorship Packages',
        description: 'Choose the perfect mentorship package tailored to your needs and goals.',
        features: ['Feature 1'],
        recommended: false,
        gradient: 'from-blue-400/20 to-indigo-400/20',
        order_number: 0,
        duration_type: 'month',
        url: '',
        show_price: true
      };

      const { data, error } = await supabase
        .from('mentorship_packages')
        .insert([newPackage])
        .select()
        .single();

      if (error) throw error;

      if (data) {
        setPackages(prevPackages => [...prevPackages, data]);
        toast.success('Package added successfully');
      }
    } catch (error: any) {
      console.error('Error adding package:', error);
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
        .from('mentorship_packages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== id));
      toast.success('Package deleted successfully');
    } catch (error: any) {
      console.error('Error deleting package:', error);
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
        .from('mentorship_packages')
        .update({
          name: editForm.name,
          price: editForm.price,
          international_price: editForm.international_price,
          title: editForm.title,
          description: editForm.description,
          features: editForm.features,
          recommended: editForm.recommended,
          gradient: editForm.gradient,
          order_number: editForm.order_number,
          duration_type: editForm.duration_type,
          url: editForm.url,
          show_price: editForm.show_price,
        })
        .eq('id', editingPackage.id);

      if (error) throw error;

      await fetchPackages();
      setEditingPackage(null);
      toast.success('Package updated successfully');
    } catch (error: any) {
      console.error('Error updating package:', error);
      toast.error(error.message || 'Failed to update package');
    }
  };
  
  const handleUpdateSectionSettings = async () => {
    try {
      const { data: { session }, error: authError } = await supabase.auth.getSession();
      if (authError) throw authError;
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Find the first package to update with section settings
      if (packages.length === 0) {
        toast.error('No packages found to update section settings');
        return;
      }
      
      const firstPackage = packages[0];
      
      // Update the first package with the new title and description
      const { error } = await supabase
        .from('mentorship_packages')
        .update({
          title: sectionSettings.title,
          description: sectionSettings.description
        })
        .eq('id', firstPackage.id);

      if (error) throw error;
      
      // Refresh the packages data
      await fetchPackages();
      
      setShowSectionSettings(false);
      toast.success('Section settings updated successfully');
    } catch (error: any) {
      console.error('Error updating section settings:', error);
      toast.error(error.message || 'Failed to update section settings');
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
            Mentorship Packages
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage your mentorship packages and pricing
          </p>
        </div>
        <div className="flex space-x-4">
          <button
            onClick={() => setShowSectionSettings(true)}
            className="inline-flex items-center px-4 py-2 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
            </svg>
            Section Settings
          </button>
          
          <button
            onClick={handleAddPackage}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
          >
            <FaPlus className="mr-2 h-4 w-4" />
            Add Package
          </button>
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
                    {pkg.show_price ? `KES ${pkg.price.toLocaleString()}/${pkg.duration_type}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300">
                    {pkg.features.length} features
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    {pkg.recommended ? 'Yes' : 'No'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <button
                      onClick={() => setEditingPackage(pkg)}
                      className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 mr-4"
                    >
                      <FaEdit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Section Settings Modal */}
      {showSectionSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-xl transform transition-all">
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-amber-600 bg-clip-text text-transparent">
                    Mentorship Section Settings
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Update the title and description for the entire mentorship section
                  </p>
                </div>
                <button
                  onClick={() => setShowSectionSettings(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                >
                  <FaTimes className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="space-y-8">
                {/* Title */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section Title
                  </label>
                  <input
                    type="text"
                    value={sectionSettings.title}
                    onChange={(e) => setSectionSettings(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter section title"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This title will be displayed at the top of the mentorship packages section.
                  </p>
                </div>
                
                {/* Description */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Section Description
                  </label>
                  <textarea
                    value={sectionSettings.description}
                    onChange={(e) => setSectionSettings(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter section description"
                    rows={3}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    This description will appear below the title in the mentorship packages section.
                  </p>
                </div>
                
                {/* Action Buttons */}
                <div className="flex justify-end space-x-4 mt-8">
                  <button
                    onClick={() => setShowSectionSettings(false)}
                    className="px-4 py-2 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleUpdateSectionSettings}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-700 transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Package Modal */}
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
                {/* Title & Description */}
                <div className="space-y-6">
                  {/* Title */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Section Title <span className="text-xs text-amber-600 font-normal">(applies to all packages)</span>
                    </label>
                    <input
                      type="text"
                      value={editForm.title}
                      onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Enter section title"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This title will be displayed at the top of the mentorship packages section.
                    </p>
                  </div>
                  
                  {/* Description */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Section Description <span className="text-xs text-amber-600 font-normal">(applies to all packages)</span>
                    </label>
                    <textarea
                      value={editForm.description}
                      onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="Enter section description"
                      rows={3}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This description will appear below the title in the mentorship packages section.
                    </p>
                  </div>
                </div>
                
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
                    
                    {/* International Price */}
                    <div className="mt-4">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        International Price (KES)
                      </label>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                          KES
                        </span>
                        <input
                          type="number"
                          step="0.01"
                          value={editForm.international_price}
                          onChange={(e) => setEditForm(prev => ({ ...prev, international_price: parseFloat(e.target.value) }))}
                          className="w-full pl-14 pr-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                          placeholder="0.00"
                        />
                      </div>
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
                      Card Gradient
                    </label>
                    <input
                      type="text"
                      value={editForm.gradient}
                      onChange={(e) => setEditForm(prev => ({ ...prev, gradient: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                      placeholder="e.g., from-blue-500/20 to-indigo-500/20"
                    />
                  </div>
                </div>

                {/* URL */}
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Package URL
                  </label>
                  <input
                    type="text"
                    value={editForm.url}
                    onChange={(e) => setEditForm(prev => ({ ...prev, url: e.target.value }))}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="Enter package URL"
                  />
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
              </div>

              {/* Footer */}
              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => setEditingPackage(null)}
                  className="px-6 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpdatePackage}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-primary to-indigo-600 text-white hover:from-primary/90 hover:to-indigo-600/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
