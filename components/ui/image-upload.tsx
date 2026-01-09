'use client';

import { useCallback, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, X, Upload } from 'lucide-react';
import { toast } from 'react-hot-toast';

import { Button } from '@/components/ui/button';

interface ImageUploadProps {
  value: string;
  onChange: (value: string) => void;
  onRemove: () => void;
  bucket?: string;
  folder?: string;
}

export function ImageUpload({
  value,
  onChange,
  onRemove,
  bucket = 'images',
  folder = 'uploads'
}: ImageUploadProps) {
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleUpload = useCallback(async (file: File) => {
    try {
      setLoading(true);

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image must be less than 5MB');
        return;
      }

      // Generate unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${folder}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      onChange(publicUrl);
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setLoading(false);
    }
  }, [supabase, onChange, bucket, folder]);

  const handleRemove = useCallback(async () => {
    try {
      setLoading(true);

      // Extract file path from URL
      const filePath = value.split('/').pop();
      if (!filePath) return;

      // Remove from Supabase storage
      const { error } = await supabase.storage
        .from(bucket)
        .remove([`${folder}/${filePath}`]);

      if (error) throw error;
      onRemove();
      toast.success('Image removed successfully');
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error('Failed to remove image');
    } finally {
      setLoading(false);
    }
  }, [value, supabase, onRemove, bucket, folder]);

  return (
    <div className="flex items-center gap-4">
      <div className="relative w-[200px] h-[200px] rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 flex items-center justify-center">
        {value ? (
          <>
            <img
              src={value}
              alt="Uploaded"
              className="w-full h-full object-cover rounded-lg"
            />
            <Button
              type="button"
              onClick={handleRemove}
              variant="destructive"
              size="icon"
              className="absolute top-2 right-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <X className="w-4 h-4" />
              )}
            </Button>
          </>
        ) : (
          <div className="text-center">
            <Upload className="mx-auto w-10 h-10 text-gray-400" />
            <label
              htmlFor="image-upload"
              className="mt-2 cursor-pointer rounded-md bg-white dark:bg-gray-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Upload Image'
              )}
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);
              }}
              disabled={loading}
            />
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
