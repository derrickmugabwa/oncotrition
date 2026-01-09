'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BiImageAdd } from 'react-icons/bi';
import { Database } from '@/types/supabase';

type HomepageMentorship = Database['public']['Tables']['homepage_mentorship']['Row'];

const HomepageMentorshipTab = () => {
  const [mentorshipData, setMentorshipData] = useState<HomepageMentorship | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [features, setFeatures] = useState<string[]>([]);
  const [newFeature, setNewFeature] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const supabase = createClient();

  useEffect(() => {
    fetchMentorshipData();
  }, []);

  const fetchMentorshipData = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_mentorship')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setMentorshipData(data);
        setFeatures(data.features as string[]);
        setPreviewUrl(data.image_url || '');
      }
    } catch (error) {
      console.error('Error fetching mentorship data:', error);
      toast.error('Failed to load mentorship data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }

    setImageFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const uploadImage = async () => {
    if (!imageFile) return null;

    const fileExt = imageFile.name.split('.').pop();
    const fileName = `mentorship-banner-${Date.now()}.${fileExt}`;
    const filePath = `mentorship/${fileName}`;

    try {
      const { data: existingFiles } = await supabase.storage
        .from('site_assets')
        .list('mentorship');

      const existingFile = existingFiles?.find(file => 
        file.name.startsWith('mentorship-banner-')
      );

      if (existingFile) {
        await supabase.storage
          .from('site_assets')
          .remove([`mentorship/${existingFile.name}`]);
      }

      const { error: uploadError, data } = await supabase.storage
        .from('site_assets')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      if (!data) {
        throw new Error('Upload failed - no data returned');
      }

      const { data: { publicUrl } } = supabase.storage
        .from('site_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageUrl = mentorshipData?.image_url;

      if (imageFile) {
        try {
          imageUrl = await uploadImage();
        } catch (error) {
          toast.error('Failed to upload image. Please try again.');
          return;
        }
      }

      if (!mentorshipData?.id) {
        const { error } = await supabase
          .from('homepage_mentorship')
          .insert({
            title: mentorshipData?.title || '',
            subtitle: mentorshipData?.subtitle || '',
            description: mentorshipData?.description || '',
            image_url: imageUrl,
            button_text: mentorshipData?.button_text || 'Learn More',
            button_link: mentorshipData?.button_link || '/mentorship',
            features: features
          });

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('homepage_mentorship')
          .update({
            title: mentorshipData?.title || '',
            subtitle: mentorshipData?.subtitle || '',
            description: mentorshipData?.description || '',
            image_url: imageUrl,
            button_text: mentorshipData?.button_text || 'Learn More',
            button_link: mentorshipData?.button_link || '/mentorship',
            features: features
          })
          .eq('id', mentorshipData.id);

        if (error) throw error;
      }

      toast.success('Mentorship section updated successfully');
      await fetchMentorshipData();
    } catch (error: any) {
      console.error('Error saving mentorship data:', error);
      toast.error(error.message || 'Failed to update mentorship section');
    } finally {
      setIsSaving(false);
    }
  };

  const addFeature = () => {
    if (newFeature.trim() && features.length < 6) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const removeFeature = (index: number) => {
    setFeatures(features.filter((_, i) => i !== index));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Image Upload Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Banner Image
        </label>
        <div className="relative">
          {previewUrl ? (
            <div className="relative h-[300px] rounded-lg overflow-hidden">
              <Image
                src={previewUrl}
                alt="Mentorship banner preview"
                fill
                className="object-cover"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-8 text-center">
              <BiImageAdd className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Click or drag to upload an image
              </p>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Text Content Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Subtitle
          </label>
          <input
            type="text"
            value={mentorshipData?.subtitle || ''}
            onChange={(e) => setMentorshipData(prev => ({ ...prev!, subtitle: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Title
          </label>
          <input
            type="text"
            value={mentorshipData?.title || ''}
            onChange={(e) => setMentorshipData(prev => ({ ...prev!, title: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Description
          </label>
          <textarea
            value={mentorshipData?.description || ''}
            onChange={(e) => setMentorshipData(prev => ({ ...prev!, description: e.target.value }))}
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Button Text
          </label>
          <input
            type="text"
            value={mentorshipData?.button_text || ''}
            onChange={(e) => setMentorshipData(prev => ({ ...prev!, button_text: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Button Link
          </label>
          <input
            type="text"
            value={mentorshipData?.button_link || ''}
            onChange={(e) => setMentorshipData(prev => ({ ...prev!, button_link: e.target.value }))}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Features Section */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Features (Max 6)
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
            placeholder="Add a feature"
          />
          <button
            type="button"
            onClick={addFeature}
            disabled={features.length >= 6}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full"
            >
              <span>{feature}</span>
              <button
                type="button"
                onClick={() => removeFeature(index)}
                className="opacity-0 group-hover:opacity-100 text-red-500 hover:text-red-700 transition-opacity"
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50"
        >
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default HomepageMentorshipTab;
