'use client';

import { Fragment, useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { 
  PlusIcon, PencilIcon, TrashIcon, XMarkIcon, ChevronUpDownIcon, CheckIcon,
  BeakerIcon, ChartPieIcon, ClipboardDocumentListIcon, 
  HeartIcon, AcademicCapIcon, UserGroupIcon, 
  SparklesIcon, ShieldCheckIcon, RocketLaunchIcon,
  BookOpenIcon, BoltIcon, CalendarIcon,
  ChartBarIcon, CloudIcon, CogIcon, CommandLineIcon,
  CpuChipIcon, DocumentTextIcon, FireIcon,
  GlobeAltIcon, LinkIcon, ListBulletIcon,
  MagnifyingGlassIcon, MapIcon, MusicalNoteIcon,
  PresentationChartBarIcon, ServerIcon,
  StarIcon, SunIcon, TableCellsIcon, TagIcon,
  TrophyIcon, VideoCameraIcon, WrenchIcon
} from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Listbox, Transition } from '@headlessui/react';
import toast from 'react-hot-toast';

interface Module {
  id: number;
  title: string;
  icon_svg: string;
  features: string[];
  display_order: number;
}

interface ModulesContent {
  id: number;
  heading: string;
  description: string;
}

const ICON_CATEGORIES = [
  {
    name: 'Education & Learning',
    icons: [
      { name: 'Academic', icon: AcademicCapIcon },
      { name: 'Book', icon: BookOpenIcon },
      { name: 'Presentation', icon: PresentationChartBarIcon },
      { name: 'Rocket', icon: RocketLaunchIcon },
      { name: 'Star', icon: StarIcon },
    ]
  },
  {
    name: 'Health & Wellness',
    icons: [
      { name: 'Heart', icon: HeartIcon },
      { name: 'Shield', icon: ShieldCheckIcon },
      { name: 'Sun', icon: SunIcon },
      { name: 'Trophy', icon: TrophyIcon },
      { name: 'Sparkles', icon: SparklesIcon },
    ]
  },
  {
    name: 'Data & Analytics',
    icons: [
      { name: 'Chart-Pie', icon: ChartPieIcon },
      { name: 'Chart-Bar', icon: ChartBarIcon },
      { name: 'List', icon: ListBulletIcon },
      { name: 'Table', icon: TableCellsIcon },
      { name: 'Clipboard', icon: ClipboardDocumentListIcon },
    ]
  },
  {
    name: 'Technology',
    icons: [
      { name: 'Chip', icon: CpuChipIcon },
      { name: 'Cloud', icon: CloudIcon },
      { name: 'Cog', icon: CogIcon },
      { name: 'Command', icon: CommandLineIcon },
      { name: 'Server', icon: ServerIcon },
    ]
  },
  {
    name: 'Features & Tools',
    icons: [
      { name: 'Bolt', icon: BoltIcon },
      { name: 'Fire', icon: FireIcon },
      { name: 'Wrench', icon: WrenchIcon },
      { name: 'Tag', icon: TagIcon },
      { name: 'Beaker', icon: BeakerIcon },
    ]
  },
  {
    name: 'Content & Media',
    icons: [
      { name: 'Document', icon: DocumentTextIcon },
      { name: 'Globe', icon: GlobeAltIcon },
      { name: 'Link', icon: LinkIcon },
      { name: 'Video', icon: VideoCameraIcon },
      { name: 'Calendar', icon: CalendarIcon },
    ]
  },
];

const ALL_ICONS = ICON_CATEGORIES.reduce((acc, category) => [...acc, ...category.icons], [] as typeof ICON_CATEGORIES[0]['icons']);

export default function ModulesTab() {
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editIconSvg, setEditIconSvg] = useState('');
  const [editFeatures, setEditFeatures] = useState<string[]>([]);
  const [content, setContent] = useState<ModulesContent | null>(null);
  const [editContent, setEditContent] = useState<Partial<ModulesContent>>({
    heading: '',
    description: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const supabase = createClientComponentClient();

  useEffect(() => {
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
              setEditContent({
                heading: newContent.heading,
                description: newContent.description
              });
            }
          } else {
            throw contentError;
          }
        } else if (contentData) {
          setContent(contentData);
          setEditContent({
            heading: contentData.heading || '',
            description: contentData.description || ''
          });
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load content');
      } finally {
        setIsLoading(false);
      }
    }

    fetchData();
  }, []);

  const saveContent = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('modules_content')
        .upsert({
          id: content?.id || 1,
          heading: editContent.heading || '',
          description: editContent.description || ''
        });

      if (error) throw error;

      setContent({
        id: content?.id || 1,
        heading: editContent.heading || '',
        description: editContent.description || ''
      });

      toast.success('Content saved successfully');
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Failed to save content');
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

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

  async function fetchContent() {
    const { data, error } = await supabase
      .from('modules_content')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching modules content:', error);
      return;
    }

    setContent(data);
  }

  const startEditing = (module: Module) => {
    setEditingModule(module);
    setEditTitle(module.title);
    setEditIconSvg(module.icon_svg);
    setEditFeatures(module.features);
  };

  const cancelEditing = () => {
    setEditingModule(null);
    setEditTitle('');
    setEditIconSvg('');
    setEditFeatures([]);
  };

  const saveModule = async (moduleId: number) => {
    const { error } = await supabase
      .from('modules')
      .update({
        title: editTitle,
        icon_svg: editIconSvg,
        features: editFeatures,
      })
      .eq('id', moduleId);

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
    const defaultIcon = ALL_ICONS[0];
    const { error } = await supabase
      .from('modules')
      .insert({
        title: 'New Module',
        icon_svg: defaultIcon.name,
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
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Modules Content</h3>
              <div className="flex-grow border-t dark:border-gray-700"></div>
            </div>
            <div className="flex gap-2">
              {error && (
                <p className="text-sm text-red-500 dark:text-red-400">
                  {error}
                </p>
              )}
              <button
                onClick={saveContent}
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
                  <>Save Content</>
                )}
              </button>
            </div>
          </div>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Heading
                </label>
                <input
                  type="text"
                  value={editContent.heading || ''}
                  onChange={(e) => setEditContent({ ...editContent, heading: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter section heading"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={editContent.description || ''}
                  onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter section description"
                />
              </div>
            </div>
          )}
        </div>

        {/* Modules List */}
        <div className="p-6">
          <div className="flex items-center gap-3 text-gray-700 dark:text-gray-300 mb-4">
            <h3 className="font-medium">Module Items</h3>
            <div className="flex-grow border-t dark:border-gray-700"></div>
          </div>
          
          <div className="space-y-4">
            {modules.map((module) => (
              <div
                key={module.id}
                className="bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                        {(() => {
                          const category = ICON_CATEGORIES.find(cat => 
                            cat.icons.some(icon => icon.name === module.icon_svg)
                          );
                          const icon = category?.icons.find(icon => icon.name === module.icon_svg);
                          const IconComponent = icon?.icon;
                          return IconComponent && <IconComponent className="w-6 h-6 text-white" />;
                        })()}
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
                        onClick={() => startEditing(module)}
                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => deleteModule(module.id)}
                        className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
                {editingModule?.id === module.id && (
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
                        <Listbox value={editIconSvg} onChange={setEditIconSvg}>
                          <div className="relative">
                            <Listbox.Button className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left flex items-center gap-2">
                              {(() => {
                                const category = ICON_CATEGORIES.find(cat => 
                                  cat.icons.some(icon => icon.name === editIconSvg)
                                );
                                const icon = category?.icons.find(icon => icon.name === editIconSvg);
                                const IconComponent = icon?.icon;
                                return (
                                  <>
                                    {IconComponent && <IconComponent className="w-5 h-5" />}
                                    <span>{editIconSvg}</span>
                                    <span className="text-gray-400 text-sm">({category?.name})</span>
                                    <ChevronUpDownIcon className="w-5 h-5 ml-auto text-gray-400" />
                                  </>
                                );
                              })()}
                            </Listbox.Button>
                            <Transition
                              as={Fragment}
                              leave="transition ease-in duration-100"
                              leaveFrom="opacity-100"
                              leaveTo="opacity-0"
                            >
                              <Listbox.Options className="absolute z-10 mt-1 w-full rounded-lg bg-white dark:bg-gray-700 shadow-lg border border-gray-200 dark:border-gray-600 py-1 max-h-60 overflow-auto focus:outline-none text-sm">
                                {ICON_CATEGORIES.map((category) => (
                                  <div key={category.name}>
                                    <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800">
                                      {category.name}
                                    </div>
                                    {category.icons.map((icon) => (
                                      <Listbox.Option
                                        key={icon.name}
                                        value={icon.name}
                                        className={({ active, selected }) =>
                                          `relative cursor-pointer select-none py-2 pl-10 pr-4 ${
                                            active
                                              ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                              : selected
                                              ? 'bg-blue-50/50 dark:bg-blue-900/20'
                                              : ''
                                          }`
                                        }
                                      >
                                        {({ selected }) => {
                                          const IconComponent = icon.icon;
                                          return (
                                            <>
                                              <div className="flex items-center gap-2">
                                                <IconComponent className="w-5 h-5" />
                                                <span className={selected ? 'font-medium' : ''}>
                                                  {icon.name}
                                                </span>
                                              </div>
                                              {selected && (
                                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-blue-600 dark:text-blue-400">
                                                  <CheckIcon className="w-5 h-5" />
                                                </span>
                                              )}
                                            </>
                                          );
                                        }}
                                      </Listbox.Option>
                                    ))}
                                  </div>
                                ))}
                              </Listbox.Options>
                            </Transition>
                          </div>
                        </Listbox>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Features
                        </label>
                        <div className="space-y-2">
                          {editFeatures.map((feature, index) => (
                            <div key={index} className="flex gap-2">
                              <input
                                type="text"
                                value={feature}
                                onChange={(e) => {
                                  const newFeatures = [...editFeatures];
                                  newFeatures[index] = e.target.value;
                                  setEditFeatures(newFeatures);
                                }}
                                className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Enter feature"
                              />
                              <button
                                onClick={() => {
                                  const newFeatures = editFeatures.filter((_, i) => i !== index);
                                  setEditFeatures(newFeatures);
                                }}
                                className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                              >
                                <TrashIcon className="w-5 h-5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => setEditFeatures([...editFeatures, ''])}
                            className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-400 dark:hover:border-gray-500 flex items-center justify-center gap-2"
                          >
                            <PlusIcon className="w-5 h-5" />
                            Add Feature
                          </button>
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 mt-4">
                        <button
                          onClick={cancelEditing}
                          className="px-4 py-2 text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => saveModule(module.id)}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
