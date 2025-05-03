'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ALL_ICONS } from './constants/moduleIcons';
import ModuleContentEditor from './components/ModuleContentEditor';
import ModuleItem from './components/ModuleItem';

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
  image_url?: string;
  learn_more_url?: string;
}

interface ModulesContent {
  id: number;
  heading: string;
  description: string;
}

export default function ModulesTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState<ModulesContent | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('modules')
        .select('*')
        .order('display_order');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Fetch modules content
      const { data: contentData, error: contentError } = await supabase
        .from('modules_content')
        .select('*')
        .single();

      if (contentError) {
        if (contentError.code === 'PGRST116') {
          // No content found, create default
          const { data: newContent, error: insertError } = await supabase
            .from('modules_content')
            .insert([
              {
                heading: 'Our Modules',
                description: 'Explore our comprehensive modules designed to help you achieve your goals.'
              }
            ])
            .select()
            .single();

          if (insertError) throw insertError;
          
          if (newContent) {
            setContent(newContent);
          }
        } else {
          throw contentError;
        }
      } else if (contentData) {
        setContent(contentData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load content');
    } finally {
      setIsLoading(false);
    }
  }

  const addNewModule = async () => {
    const maxOrder = Math.max(...modules.map(m => m.display_order), 0);
    const defaultIcon = ALL_ICONS[0];
    const { error } = await supabase
      .from('modules')
      .insert({
        title: 'New Module',
        icon_svg: defaultIcon.name,
        features: ['New Feature'],
        display_order: maxOrder + 1,
        image_url: '',
      });

    if (error) {
      console.error('Error adding module:', error);
      toast.error('Failed to add module');
      return;
    }

    toast.success('Module added successfully');
    fetchData();
  };

  if (isLoading) {
    return <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Modules</h2>
        <button
          onClick={addNewModule}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          Add Module
        </button>
      </div>

      {/* Content Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        {/* Modules Content Section */}
        {content && (
          <ModuleContentEditor 
            content={content} 
            onContentSaved={fetchData} 
          />
        )}

        {/* Modules List */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-4">
            <h3 className="font-medium">Module Items</h3>
            <div className="flex-grow border-t dark:border-gray-700"></div>
          </div>
          
          <div className="space-y-4">
            {modules.map((module) => (
              <ModuleItem 
                key={module.id} 
                module={module} 
                onModuleUpdated={fetchData} 
              />
            ))}

            {modules.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No modules found. Add your first module to get started.</p>
                <button
                  onClick={addNewModule}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <PlusIcon className="w-5 h-5" />
                  Add Module
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}