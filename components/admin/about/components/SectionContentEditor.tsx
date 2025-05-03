'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import BackgroundImageUploader from './BackgroundImageUploader';

interface SectionContentEditorProps {
  sectionContent: {
    heading: string;
    description: string;
    background_image?: string;
  };
  setSectionContent: (content: any) => void;
  isEditingSection: boolean;
  setIsEditingSection: (isEditing: boolean) => void;
}

export default function SectionContentEditor({
  sectionContent,
  setSectionContent,
  isEditingSection,
  setIsEditingSection
}: SectionContentEditorProps) {
  const supabase = createClientComponentClient();

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
          background_image: sectionContent.background_image,
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



  return (
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
            <label htmlFor="heading" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Heading
            </label>
            <input
              type="text"
              id="heading"
              value={sectionContent.heading}
              onChange={(e) => setSectionContent({ ...sectionContent, heading: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <textarea
              id="description"
              value={sectionContent.description}
              onChange={(e) => setSectionContent({ ...sectionContent, description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-white"
            />
          </div>
          
          {/* Background Image Upload */}
          <div>
            <BackgroundImageUploader 
              backgroundImage={sectionContent.background_image || ''}
              onImageChange={(imageUrl) => setSectionContent({ ...sectionContent, background_image: imageUrl })}
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
          {sectionContent.background_image && (
            <div className="mt-2">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium text-gray-900 dark:text-white">Background Image:</span>
              </p>
              <div className="w-40 h-24 rounded-md overflow-hidden">
                <img 
                  src={sectionContent.background_image} 
                  alt="Background" 
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
