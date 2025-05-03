'use client';

import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';

interface ModuleFeaturesListProps {
  features: string[];
  onAddFeature: () => void;
  onUpdateFeature: (index: number, value: string) => void;
  onRemoveFeature: (index: number) => void;
}

export default function ModuleFeaturesList({
  features,
  onAddFeature,
  onUpdateFeature,
  onRemoveFeature
}: ModuleFeaturesListProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Features
        </label>
        <button
          type="button"
          onClick={onAddFeature}
          className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <PlusIcon className="w-4 h-4" />
          Add Feature
        </button>
      </div>
      <div className="space-y-2">
        {features.map((feature, index) => (
          <div key={index} className="flex items-center gap-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => onUpdateFeature(index, e.target.value)}
              className="flex-grow px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter feature"
            />
            <button
              type="button"
              onClick={() => onRemoveFeature(index)}
              className="p-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        {features.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 italic">
            No features added yet. Click "Add Feature" to add one.
          </p>
        )}
      </div>
    </div>
  );
}
