'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { createClient } from '@/utils/supabase/client';

interface ModuleContentEditorProps {
  content: {
    id: number;
    heading: string;
    description: string;
  } | null;
  onContentSaved: () => void;
}

export default function ModuleContentEditor({ content, onContentSaved }: ModuleContentEditorProps) {
  const [editContent, setEditContent] = useState({
    heading: content?.heading || '',
    description: content?.description || ''
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

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
        } as any);

      if (error) throw error;

      toast.success('Content saved successfully');
      onContentSaved();
    } catch (error) {
      console.error('Error saving content:', error);
      setError('Failed to save content');
      toast.error('Failed to save content');
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
      <div className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Heading
          </label>
          <input
            type="text"
            value={editContent.heading}
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
            value={editContent.description}
            onChange={(e) => setEditContent({ ...editContent, description: e.target.value })}
            rows={3}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter section description"
          />
        </div>
      </div>
    </div>
  );
}
