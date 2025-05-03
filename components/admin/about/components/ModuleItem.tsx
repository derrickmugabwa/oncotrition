'use client';

import { useState } from 'react';
import { PencilIcon, TrashIcon, XMarkIcon, CheckIcon } from '@heroicons/react/24/outline';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import { IconType, ALL_ICONS, ICON_CATEGORIES } from '../constants/moduleIcons';
import ModuleIconSelector from './ModuleIconSelector';
import ModuleFeaturesList from './ModuleFeaturesList';
import ModuleImageUploader from './ModuleImageUploader';

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
  image_url?: string;
  learn_more_url?: string;
}

interface ModuleItemProps {
  module: Module;
  onModuleUpdated: () => void;
}

export default function ModuleItem({ module, onModuleUpdated }: ModuleItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(module.title);
  const [editIconSvg, setEditIconSvg] = useState(module.icon_svg);
  const [editFeatures, setEditFeatures] = useState<string[]>(module.features);
  const [editImageUrl, setEditImageUrl] = useState(module.image_url || '');
  const [editLearnMoreUrl, setEditLearnMoreUrl] = useState(module.learn_more_url || '');
  const [selectedIcon, setSelectedIcon] = useState<IconType | null>(
    ALL_ICONS.find(icon => icon.name === module.icon_svg) || null
  );
  const [isSaving, setIsSaving] = useState(false);
  
  const supabase = createClientComponentClient();

  const startEditing = () => {
    setIsEditing(true);
    setEditTitle(module.title);
    setEditIconSvg(module.icon_svg);
    setEditFeatures([...module.features]);
    setEditImageUrl(module.image_url || '');
    setEditLearnMoreUrl(module.learn_more_url || '');
    setSelectedIcon(ALL_ICONS.find(icon => icon.name === module.icon_svg) || null);
  };

  const cancelEditing = () => {
    setIsEditing(false);
  };

  const saveModule = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('modules')
        .update({
          title: editTitle,
          icon_svg: editIconSvg,
          features: editFeatures,
          image_url: editImageUrl,
          learn_more_url: editLearnMoreUrl,
        })
        .eq('id', module.id);

      if (error) throw error;

      toast.success('Module updated successfully');
      setIsEditing(false);
      onModuleUpdated();
    } catch (error) {
      console.error('Error updating module:', error);
      toast.error('Failed to update module');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteModule = async () => {
    if (!confirm('Are you sure you want to delete this module?')) return;
    
    try {
      const { error } = await supabase
        .from('modules')
        .delete()
        .eq('id', module.id);

      if (error) throw error;

      toast.success('Module deleted successfully');
      onModuleUpdated();
    } catch (error) {
      console.error('Error deleting module:', error);
      toast.error('Failed to delete module');
    }
  };

  const addFeature = () => {
    setEditFeatures([...editFeatures, '']);
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...editFeatures];
    newFeatures[index] = value;
    setEditFeatures(newFeatures);
  };

  const removeFeature = (index: number) => {
    const newFeatures = editFeatures.filter((_, i) => i !== index);
    setEditFeatures(newFeatures);
  };

  const handleIconChange = (icon: IconType | null) => {
    setSelectedIcon(icon);
    if (icon) {
      setEditIconSvg(icon.name);
    }
  };

  const handleImageUrlChange = (url: string) => {
    setEditImageUrl(url);
  };

  // Find the icon component
  const category = ICON_CATEGORIES.find(cat => 
    cat.icons.some(icon => icon.name === module.icon_svg)
  );
  const icon = category?.icons.find(icon => icon.name === module.icon_svg);
  const IconComponent = icon?.icon;

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
              {IconComponent && <IconComponent className="w-6 h-6 text-white" />}
            </div>
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white">{module.title}</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {module.features.length} features
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={startEditing}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <PencilIcon className="w-5 h-5" />
            </button>
            <button
              onClick={deleteModule}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="border-t dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Module Title
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter module title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Icon
              </label>
              <ModuleIconSelector 
                selectedIcon={selectedIcon} 
                onChange={handleIconChange} 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Module Image
              </label>
              <ModuleImageUploader
                initialImageUrl={editImageUrl}
                onImageUrlChange={handleImageUrlChange}
                moduleId={module.id}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Learn More URL
              </label>
              <input
                type="url"
                value={editLearnMoreUrl}
                onChange={(e) => setEditLearnMoreUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/learn-more"
              />
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Optional: Add a URL for the 'Learn more' link
              </p>
            </div>

            <ModuleFeaturesList
              features={editFeatures}
              onAddFeature={addFeature}
              onUpdateFeature={updateFeature}
              onRemoveFeature={removeFeature}
            />

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={cancelEditing}
                className="px-4 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <XMarkIcon className="w-5 h-5" />
                Cancel
              </button>
              <button
                onClick={saveModule}
                disabled={isSaving}
                className={`px-4 py-2 bg-blue-600 text-white rounded-lg transition-colors flex items-center gap-2 ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
                }`}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <CheckIcon className="w-5 h-5" />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
