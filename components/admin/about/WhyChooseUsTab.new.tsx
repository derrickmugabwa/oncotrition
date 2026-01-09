'use client';

import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { v4 as uuidv4 } from 'uuid';

// Icon categories for better organization
const iconOptions = {
  'Health & Nutrition': [
    { name: 'Apple', path: 'M9 7.5l3 4.5m0 0l3-4.5M12 12v5.5M15 7.5v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4M15 7.5H9m12 5a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Heart', path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
  ],
  'Experience & Expertise': [
    { name: 'Certificate', path: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
  ],
};

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_path: string;
  display_order: number;
}

interface IconOption {
  name: string;
  path: string;
}

export default function WhyChooseUsTab() {
  const [features, setFeatures] = useState<Feature[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [sectionContent, setSectionContent] = useState({
    heading: '',
    description: '',
    background_image: ''
  });
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch features
      const { data: featuresData, error: featuresError } = await supabase
        .from('why_choose_us_features')
        .select('*')
        .order('display_order');

      if (featuresError) throw featuresError;
      setFeatures(featuresData || []);

      // Fetch section content
      const { data: sectionData, error: sectionError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('section_id', 'why_choose_us')
        .single();

      if (!sectionError && sectionData) {
        setSectionContent({
          heading: sectionData.heading || 'Why Choose Us',
          description: sectionData.description || 'Experience excellence in nutrition management with our comprehensive platform',
          background_image: sectionData.background_image || ''
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSectionEdit = () => {
    setIsEditingSection(true);
  };

  const handleSectionSave = async () => {
    try {
      const { error } = await supabase
        .from('page_sections')
        .upsert({
          section_id: 'why_choose_us',
          heading: sectionContent.heading,
          description: sectionContent.description,
          background_image: sectionContent.background_image,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'section_id'
        });

      if (error) throw error;
      setIsEditingSection(false);
      toast.success('Section content updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update section content');
    }
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `background-images/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('public')
        .upload(filePath, file);

      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('public')
        .getPublicUrl(filePath);

      setSectionContent({ ...sectionContent, background_image: urlData.publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const addFeature = async () => {
    try {
      setIsLoading(true);
      const newOrder = features.length;
      const { data, error } = await supabase
        .from('why_choose_us_features')
        .insert([{
          title: 'New Feature',
          description: 'Feature description',
          icon_path: selectedIcon?.path || iconOptions['Health & Nutrition'][0].path,
          display_order: newOrder,
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setFeatures([...features, ...data]);
        setEditingId(data[0].id);
        setEditForm(data[0]);
        toast.success('Feature added successfully');
      }
    } catch (error) {
      toast.error('Failed to add feature');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateFeature = async (id: number, field: string, value: string) => {
    try {
      const { error } = await supabase
        .from('why_choose_us_features')
        .update({ [field]: value })
        .eq('id', id);

      if (error) throw error;
      
      setFeatures(features.map(feature => 
        feature.id === id ? { ...feature, [field]: value } : feature
      ));
      toast.success('Feature updated successfully');
    } catch (error) {
      toast.error('Failed to update feature');
      console.error('Error:', error);
    }
  };

  const deleteFeature = async (id: number) => {
    try {
      setIsLoading(true);
      const { error } = await supabase
        .from('why_choose_us_features')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setFeatures(features.filter(feature => feature.id !== id));
      toast.success('Feature deleted successfully');
    } catch (error) {
      toast.error('Failed to delete feature');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (feature: Feature) => {
    setEditingId(feature.id);
    setEditForm(feature);
    const selectedIconOption = Object.values(iconOptions)
      .flat()
      .find(icon => icon.path === feature.icon_path);
    setSelectedIcon(selectedIconOption || null);
  };

  const handleSave = async () => {
    if (!editingId || !editForm) return;
    
    try {
      const { error } = await supabase
        .from('why_choose_us_features')
        .update(editForm)
        .eq('id', editingId);

      if (error) throw error;
      
      setFeatures(features.map(feature => 
        feature.id === editingId ? { ...feature, ...editForm } : feature
      ));
      setEditingId(null);
      setEditForm({});
      setSelectedIcon(null);
      toast.success('Feature updated successfully');
    } catch (error) {
      toast.error('Failed to update feature');
      console.error('Error:', error);
    }
  };

  return (
    <div className="space-y-8 p-6 bg-white dark:bg-gray-900 rounded-lg shadow-sm">
      {/* Section Content */}
      <div className="border-b dark:border-gray-700 pb-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Section Content
          </h3>
          {!isEditingSection ? (
            <button
              onClick={handleSectionEdit}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Edit Content
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setIsEditingSection(false)}
                className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSectionSave}
                className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors duration-200"
              >
                Save Changes
              </button>
            </div>
          )}
        </div>

        {isEditingSection ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="heading" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heading
              </label>
              <input
                type="text"
                id="heading"
                value={sectionContent.heading}
                onChange={(e) => setSectionContent({ ...sectionContent, heading: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={sectionContent.description}
                onChange={(e) => setSectionContent({ ...sectionContent, description: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
              />
            </div>
            
            {/* Background Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Background Image
              </label>
              <div className="mt-1 flex items-center">
                {sectionContent.background_image ? (
                  <div className="relative group">
                    <div className="w-full h-32 rounded-md overflow-hidden">
                      <img 
                        src={sectionContent.background_image} 
                        alt="Background" 
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => setSectionContent({ ...sectionContent, background_image: '' })}
                          className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex justify-center items-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:border-blue-500 dark:hover:border-blue-500 cursor-pointer transition-colors"
                  >
                    <div className="space-y-1 text-center">
                      <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        <span className="font-medium text-blue-600 dark:text-blue-400">
                          Click to upload
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        PNG, JPG, GIF up to 5MB
                      </p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                />
              </div>
              {isUploading && (
                <div className="mt-2 flex items-center">
                  <div className="w-4 h-4 rounded-full border-2 border-t-blue-600 border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Heading:</span> {sectionContent.heading}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-medium text-gray-900 dark:text-white">Description:</span> {sectionContent.description}
            </p>
            {sectionContent.background_image && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span className="font-medium text-gray-900 dark:text-white">Background Image:</span>
                </p>
                <div className="w-40 h-24 rounded-md overflow-hidden">
                  <img 
                    src={sectionContent.background_image} 
                    alt="Background" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b dark:border-gray-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sectionContent.heading}</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {sectionContent.description}
          </p>
        </div>
        <button
          onClick={addFeature}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 w-full sm:w-auto justify-center sm:justify-start"
        >
          <PlusIcon className="w-5 h-5" />
          Add Feature
        </button>
      </div>

      {/* Features List */}
      <div className="space-y-4">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/50">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={feature.icon_path} />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white truncate">
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>
              <div className="flex-shrink-0 flex gap-2">
                <button
                  onClick={() => handleEdit(feature)}
                  className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                  title="Edit feature"
                >
                  <PencilIcon className="w-5 h-5" />
                </button>
                <button
                  onClick={() => deleteFeature(feature.id)}
                  className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
                  title="Delete feature"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {features.length === 0 && !isLoading && (
        <div className="text-center py-12">
          <div className="mx-auto w-24 h-24 rounded-full bg-blue-50 dark:bg-blue-900/50 flex items-center justify-center mb-4">
            <PlusIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            No features added yet
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Get started by adding your first feature
          </p>
          <button
            onClick={addFeature}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <PlusIcon className="w-5 h-5" />
            Add Feature
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
}
