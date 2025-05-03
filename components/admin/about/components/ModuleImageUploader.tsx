'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { TrashIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { v4 as uuidv4 } from 'uuid';

interface ModuleImageUploaderProps {
  initialImageUrl: string;
  onImageUrlChange: (imageUrl: string) => void;
  moduleId: number;
}

export default function ModuleImageUploader({
  initialImageUrl,
  onImageUrlChange,
  moduleId
}: ModuleImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClientComponentClient();

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    setIsUploading(true);
    try {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${uuidv4()}.${fileExt}`;
      const filePath = `module-images/module-${moduleId}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (error) throw error;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const newUrl = urlData.publicUrl;
      setImageUrl(newUrl);
      onImageUrlChange(newUrl);
      toast.success('Module image uploaded successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImageUrl('');
    onImageUrlChange('');
    toast.success('Module image removed');
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Module Image
      </label>
      <div className="mt-1 flex items-center">
        {imageUrl ? (
          <div className="relative group">
            <div className="w-full h-32 rounded-md overflow-hidden">
              <img 
                src={imageUrl} 
                alt="Module" 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="p-1.5 bg-red-600 rounded-full text-white hover:bg-red-700 transition-colors"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="flex justify-center items-center w-full h-32 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-md hover:border-emerald-500 dark:hover:border-emerald-500 cursor-pointer transition-colors"
          >
            <div className="space-y-1 text-center">
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  Click to upload
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-500">
                PNG, JPG, GIF up to 5MB
              </p>
            </div>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleImageUpload}
        />
      </div>
      {isUploading && (
        <div className="mt-2 flex items-center">
          <div className="w-4 h-4 rounded-full border-2 border-t-emerald-600 border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Uploading...</span>
        </div>
      )}
    </div>
  );
}
