'use client';

import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Feature {
  id: number;
  title: string;
  description: string;
  icon_path: string;
  display_order: number;
}

interface FeatureItemProps {
  feature: Feature;
  onEdit: (feature: Feature) => void;
  onDelete: (id: number) => void;
}

export default function FeatureItem({ feature, onEdit, onDelete }: FeatureItemProps) {
  return (
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
            onClick={() => onEdit(feature)}
            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
            title="Edit feature"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
          <button
            onClick={() => onDelete(feature.id)}
            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-200"
            title="Delete feature"
          >
            <TrashIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
