'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';

// Icon categories for better organization
const iconOptions = {
  'Health & Nutrition': [
    { name: 'Apple', path: 'M9 7.5l3 4.5m0 0l3-4.5M12 12v5.5M15 7.5v-4a1 1 0 00-1-1h-4a1 1 0 00-1 1v4M15 7.5H9m12 5a9 9 0 11-18 0 9 9 0 0118 0z' },
    { name: 'Heart', path: 'M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z' },
    { name: 'Scale', path: 'M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0012 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.988 5.988 0 01-2.031.352 5.988 5.988 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L18.75 4.97zm-13.5 0l2.62 10.726c.122.499-.106 1.028-.589 1.202a5.989 5.989 0 01-2.031.352 5.989 5.989 0 01-2.031-.352c-.483-.174-.711-.703-.59-1.202L5.25 4.97z' },
  ],
  'Experience & Expertise': [
    { name: 'Certificate', path: 'M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z' },
    { name: 'Badge', path: 'M16.5 18.75h-9A2.25 2.25 0 015.25 21h13.5a2.25 2.25 0 01-2.25-2.25zm-9-10.125h9M7.5 15h9M7.5 11.25h9M16.5 8.625h-9A2.25 2.25 0 015.25 6.375h13.5a2.25 2.25 0 01-2.25 2.25z' },
    { name: 'Academic Cap', path: 'M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5' },
  ],
  'Support & Care': [
    { name: 'Support', path: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z' },
    { name: 'Chat', path: 'M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z' },
    { name: 'Phone', path: 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z' },
  ],
  'Quality & Standards': [
    { name: 'Shield Check', path: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z' },
    { name: 'Trophy', path: 'M16.5 18.75h-9A2.25 2.25 0 015.25 21h13.5a2.25 2.25 0 01-2.25-2.25zm-9-10.125h9M7.5 15h9M7.5 11.25h9M16.5 8.625h-9A2.25 2.25 0 015.25 6.375h13.5a2.25 2.25 0 01-2.25 2.25z' },
    { name: 'Check Badge', path: 'M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
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
  const [editForm, setEditForm] = useState<Partial<Feature>>({});
  const [selectedIcon, setSelectedIcon] = useState<IconOption | null>(null);
  const [sectionContent, setSectionContent] = useState({
    heading: '',
    description: ''
  });
  const [isEditingSection, setIsEditingSection] = useState(false);

  const supabase = createClientComponentClient();

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
          description: sectionData.description || 'Experience excellence in nutrition management with our comprehensive platform'
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Heading
              </label>
              <input
                type="text"
                value={sectionContent.heading}
                onChange={(e) => setSectionContent({ ...sectionContent, heading: e.target.value })}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                placeholder="Enter section heading"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description
              </label>
              <textarea
                value={sectionContent.description}
                onChange={(e) => setSectionContent({ ...sectionContent, description: e.target.value })}
                rows={2}
                className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                placeholder="Enter section description"
              />
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
              // Edit Mode
              <div className="p-6 space-y-4">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editForm.title || ''}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
                      placeholder="Enter feature title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Description
                    </label>
                    <textarea
                      value={editForm.description || ''}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200 resize-none"
                      placeholder="Enter feature description"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Icon
                    </label>
                    <Listbox 
                      value={selectedIcon} 
                      onChange={(icon) => {
                        setSelectedIcon(icon);
                        if (icon) {
                          setEditForm({ ...editForm, icon_path: icon.path });
                        }
                      }}
                    >
                      <div className="relative mt-1">
                        <Listbox.Button className="relative w-full cursor-pointer rounded-lg bg-white dark:bg-gray-900 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
                          <span className="flex items-center gap-3">
                            {selectedIcon && (
                              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/50">
                                <svg className="w-5 h-5 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={selectedIcon.path} />
                                </svg>
                              </div>
                            )}
                            <span className="block truncate text-gray-900 dark:text-white">
                              {selectedIcon?.name || 'Select an icon'}
                            </span>
                          </span>
                          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                            <ChevronUpDownIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                          </span>
                        </Listbox.Button>
                        <Transition
                          as={Fragment}
                          leave="transition ease-in duration-100"
                          leaveFrom="opacity-100"
                          leaveTo="opacity-0"
                        >
                          <Listbox.Options className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                            {Object.entries(iconOptions).map(([category, icons]) => (
                              <div key={category}>
                                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 px-3 py-2">
                                  <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {category}
                                  </h3>
                                </div>
                                {icons.map((icon) => (
                                  <Listbox.Option
                                    key={icon.name}
                                    className={({ active }) =>
                                      `relative cursor-pointer select-none py-2 pl-3 pr-9 ${
                                        active ? 'bg-blue-50 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                                      }`
                                    }
                                    value={icon}
                                  >
                                    {({ selected, active }) => (
                                      <>
                                        <div className="flex items-center gap-3">
                                          <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md ${
                                            selected ? 'bg-blue-100 dark:bg-blue-800' : 'bg-gray-50 dark:bg-gray-700'
                                          }`}>
                                            <svg className={`w-5 h-5 ${
                                              selected ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'
                                            }`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon.path} />
                                            </svg>
                                          </div>
                                          <span className={`block truncate ${selected ? 'font-semibold' : 'font-normal'}`}>
                                            {icon.name}
                                          </span>
                                        </div>
                                        {selected && (
                                          <span className={`absolute inset-y-0 right-0 flex items-center pr-3 ${
                                            active ? 'text-blue-600 dark:text-blue-400' : 'text-blue-600 dark:text-blue-400'
                                          }`}>
                                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </Listbox.Option>
                                ))}
                              </div>
                            ))}
                          </Listbox.Options>
                        </Transition>
                      </div>
                    </Listbox>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4 border-t dark:border-gray-700">
                  <button
                    onClick={() => {
                      setEditingId(null);
                      setEditForm({});
                      setSelectedIcon(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              // View Mode
              <div className="p-6">
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
