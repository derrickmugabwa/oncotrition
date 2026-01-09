'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon, TrashIcon, PencilIcon, CheckIcon } from '@heroicons/react/24/outline';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon } from '@heroicons/react/20/solid';
import { Fragment } from 'react';
import { toast } from 'react-hot-toast';

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

interface FeatureEditorProps {
  feature: Feature;
  onSave: () => void;
  onCancel: () => void;
  editForm: any;
  setEditForm: (form: any) => void;
  selectedIcon: IconOption | null;
  setSelectedIcon: (icon: IconOption | null) => void;
  iconOptions: Record<string, IconOption[]>;
}

export default function FeatureEditor({
  feature,
  onSave,
  onCancel,
  editForm,
  setEditForm,
  selectedIcon,
  setSelectedIcon,
  iconOptions
}: FeatureEditorProps) {
  return (
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
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          onClick={onSave}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}
