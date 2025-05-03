'use client';

import { Fragment } from 'react';
import { Listbox, Transition } from '@headlessui/react';
import { ChevronUpDownIcon, CheckIcon } from '@heroicons/react/24/outline';
import { ICON_CATEGORIES, ALL_ICONS, IconType } from '../constants/moduleIcons';

interface ModuleIconSelectorProps {
  selectedIcon: IconType | null;
  onChange: (icon: IconType | null) => void;
}

export default function ModuleIconSelector({ selectedIcon, onChange }: ModuleIconSelectorProps) {
  return (
    <Listbox value={selectedIcon} onChange={onChange}>
      <div className="relative mt-1">
        <Listbox.Button className="relative w-full cursor-default rounded-lg bg-white dark:bg-gray-700 py-2 pl-3 pr-10 text-left border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 sm:text-sm">
          <span className="flex items-center gap-3">
            {selectedIcon && (
              <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 dark:bg-blue-900/50">
                <selectedIcon.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" aria-hidden="true" />
              </div>
            )}
            <span className="block truncate text-gray-900 dark:text-white">
              {selectedIcon?.name || 'Select an icon'}
            </span>
          </span>
          <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon
              className="h-5 w-5 text-gray-400"
              aria-hidden="true"
            />
          </span>
        </Listbox.Button>
        <Transition
          as={Fragment}
          leave="transition ease-in duration-100"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <Listbox.Options className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white dark:bg-gray-800 py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
            {ICON_CATEGORIES.map((category) => (
              <div key={category.name}>
                <div className="px-3 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900">
                  {category.name}
                </div>
                <div className="grid grid-cols-3 gap-1 p-1">
                  {category.icons.map((icon) => (
                    <Listbox.Option
                      key={icon.name}
                      className={({ active }) =>
                        `relative cursor-default select-none p-2 rounded-md ${
                          active ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-white'
                        }`
                      }
                      value={icon}
                    >
                      {({ selected, active }) => (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-gray-100 dark:bg-gray-700">
                              <icon.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" aria-hidden="true" />
                            </div>
                            <span className={`block truncate ${selected ? 'font-medium' : 'font-normal'}`}>
                              {icon.name}
                            </span>
                          </div>
                          {selected ? (
                            <span className="text-blue-600 dark:text-blue-400">
                              <CheckIcon className="h-5 w-5" aria-hidden="true" />
                            </span>
                          ) : null}
                        </div>
                      )}
                    </Listbox.Option>
                  ))}
                </div>
              </div>
            ))}
          </Listbox.Options>
        </Transition>
      </div>
    </Listbox>
  );
}
