'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, PencilIcon, TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
}

export default function ModulesTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const supabase = createClientComponentClient();

  // Form states
  const [editTitle, setEditTitle] = useState('');
  const [editIconSvg, setEditIconSvg] = useState('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);

  useEffect(() => {
    fetchModules();
  }, []);

  async function fetchModules() {
    const { data, error } = await supabase
      .from('modules')
      .select('*')
      .order('display_order');
    
    if (error) {
      console.error('Error fetching modules:', error);
      return;
    }

    setModules(data || []);
    setIsLoading(false);
  }

  const startEditing = (module: Module) => {
    setEditingId(module.id);
    setEditTitle(module.title);
    setEditIconSvg(module.icon_svg);
    setEditFeatures(module.features);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditTitle('');
    setEditIconSvg('');
    setEditFeatures([]);
  };

  const saveModule = async (module: Module) => {
    const { error } = await supabase
      .from('modules')
      .update({
        title: editTitle,
        icon_svg: editIconSvg,
        features: editFeatures,
      })
      .eq('id', module.id);

    if (error) {
      console.error('Error updating module:', error);
      return;
    }

    cancelEditing();
    fetchModules();
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

  const addNewModule = async () => {
    const maxOrder = Math.max(...modules.map(m => m.display_order), 0);
    const { error } = await supabase
      .from('modules')
      .insert({
        title: 'New Module',
        icon_svg: '<svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>',
        features: ['New Feature'],
        display_order: maxOrder + 1,
      });

    if (error) {
      console.error('Error adding module:', error);
      return;
    }

    fetchModules();
  };

  const deleteModule = async (id: number) => {
    const { error } = await supabase
      .from('modules')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting module:', error);
      return;
    }

    fetchModules();
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Modules</h2>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={addNewModule}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5 mr-2" />
          Add Module
        </motion.button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {modules.map((module) => (
            <motion.div
              key={module.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-shadow"
            >
              {editingId === module.id ? (
                <div className="p-4 space-y-3">
                  <div className="flex justify-between items-center mb-2">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="flex-1 px-3 py-1.5 text-sm border rounded-lg mr-2"
                      placeholder="Module Title"
                    />
                    <button
                      onClick={cancelEditing}
                      className="p-1.5 text-gray-500 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>

                  <div>
                    <textarea
                      value={editIconSvg}
                      onChange={(e) => setEditIconSvg(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 text-sm border rounded-lg"
                      placeholder="SVG Icon Code"
                    />
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div dangerouslySetInnerHTML={{ __html: editIconSvg }} />
                    </div>
                  </div>

                  <div>
                    {editFeatures.map((feature, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={feature}
                          onChange={(e) => updateFeature(index, e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border rounded-lg"
                          placeholder="Feature"
                        />
                        <button
                          onClick={() => removeFeature(index)}
                          className="p-1.5 text-red-500 hover:text-red-700 rounded-lg hover:bg-red-50"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={addFeature}
                      className="text-sm text-blue-600 hover:text-blue-700 mt-1"
                    >
                      + Add Feature
                    </button>
                  </div>

                  <div className="flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => saveModule(module)}
                      className="px-4 py-1.5 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </div>
                </div>
              ) : (
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <div dangerouslySetInnerHTML={{ __html: module.icon_svg }} />
                      </div>
                      <h3 className="text-lg font-medium">{module.title}</h3>
                    </div>
                    <div className="flex space-x-1">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => startEditing(module)}
                        className="p-1.5 text-gray-500 hover:text-blue-600 rounded-lg hover:bg-blue-50"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => deleteModule(module.id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 rounded-lg hover:bg-red-50"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    {module.features.map((feature, index) => (
                      <div
                        key={index}
                        className="text-sm text-gray-600 dark:text-gray-300 flex items-center space-x-2"
                      >
                        <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
