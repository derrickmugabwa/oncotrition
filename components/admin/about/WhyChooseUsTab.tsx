'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

// Import our component modules
import SectionContentEditor from './components/SectionContentEditor';
import FeatureEditor from './components/FeatureEditor';
import FeatureItem from './components/FeatureItem';

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

  const addFeature = async () => {
    try {
      setIsLoading(true);
      const newOrder = features.length;
      const { data, error } = await supabase
        .from('why_choose_us_features')
        .insert([{
          title: 'New Feature',
          description: 'Feature description',
          icon_path: iconOptions['Health & Nutrition'][0].path,
          display_order: newOrder,
        }])
        .select();

      if (error) throw error;
      
      if (data) {
        setFeatures([...features, ...data]);
        setEditingId(data[0].id);
        setEditForm(data[0]);
        setSelectedIcon(iconOptions['Health & Nutrition'][0]);
        toast.success('Feature added successfully');
      }
    } catch (error) {
      toast.error('Failed to add feature');
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
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
      {/* Section Content Editor Component */}
      <SectionContentEditor 
        sectionContent={sectionContent}
        setSectionContent={setSectionContent}
        isEditingSection={isEditingSection}
        setIsEditingSection={setIsEditingSection}
      />

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

      {/* Features Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {features.map((feature) => (
          <div 
            key={feature.id} 
            className={`relative group bg-white dark:bg-gray-800 rounded-lg border ${
              editingId === feature.id 
                ? 'border-blue-500 dark:border-blue-500 ring-1 ring-blue-500' 
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500'
            } transition-all duration-200`}
          >
            {editingId === feature.id ? (
              // Edit Mode - Use FeatureEditor component
              <FeatureEditor
                feature={feature}
                onSave={handleSave}
                onCancel={() => {
                  setEditingId(null);
                  setEditForm({});
                  setSelectedIcon(null);
                }}
                editForm={editForm}
                setEditForm={setEditForm}
                selectedIcon={selectedIcon}
                setSelectedIcon={setSelectedIcon}
                iconOptions={iconOptions}
              />
            ) : (
              // View Mode - Use FeatureItem component
              <FeatureItem
                feature={feature}
                onEdit={handleEdit}
                onDelete={deleteFeature}
              />
            )}
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