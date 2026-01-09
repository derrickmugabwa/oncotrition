'use client';

import { useState, useRef } from 'react';
import { PhotoIcon, ArrowUpTrayIcon, XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';

interface FloatingImageUploaderProps {
  currentImageUrl?: string;
  onImageUploaded: (url: string) => void;
  title?: string;
  description?: string;
}

export default function FloatingImageUploader({
  currentImageUrl,
  onImageUploaded,
  title = 'Floating Image',
  description = 'This image will appear as a small floating element overlapping with the main image.'
}: FloatingImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a preview
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to Supabase
    await uploadImage(file);

    // Clean up the object URL
    return () => URL.revokeObjectURL(objectUrl);
  };

  const uploadImage = async (file: File) => {
    try {
      setIsUploading(true);
      
      const fileExt = file.name.split('.').pop();
      const filePath = `floating-images/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      
      if (data && data.publicUrl) {
        onImageUploaded(data.publicUrl);
        toast.success('Floating image uploaded successfully');
      }
    } catch (error) {
      console.error('Error uploading floating image:', error);
      toast.error('Failed to upload floating image');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onImageUploaded('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="mt-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
      <h3 className="text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{description}</p>
      
      <div className="mt-4">
        {previewUrl ? (
          <div className="relative">
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border border-gray-200">
              <Image 
                src={previewUrl} 
                alt="Floating image preview" 
                fill 
                style={{ objectFit: 'cover' }} 
              />
            </div>
            <button
              type="button"
              onClick={handleRemoveImage}
              className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
            >
              <XMarkIcon className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        ) : (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50"
          >
            <PhotoIcon className="w-8 h-8 text-gray-400" />
            <span className="mt-2 text-sm font-medium text-gray-500">
              {isUploading ? 'Uploading...' : 'Add floating image'}
            </span>
          </div>
        )}
        
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={isUploading}
        />
        
        {!previewUrl && (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-4 inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-md shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50"
          >
            <ArrowUpTrayIcon className="-ml-0.5 mr-2 h-4 w-4" />
            {isUploading ? 'Uploading...' : 'Upload Image'}
          </button>
        )}
      </div>
    </div>
  );
}
