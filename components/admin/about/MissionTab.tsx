'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

interface MissionContent {
  id?: number;
  title: string;
  subtitle: string;
  description: string;
  image_url: string;
  created_at?: string;
}

export default function MissionTab() {
  const [isLoading, setIsLoading] = useState(false);
  const [content, setContent] = useState<MissionContent>({
    title: '',
    subtitle: '',
    description: '',
    image_url: ''
  });
  
  const supabase = createClient();

  useEffect(() => {
    fetchMissionContent();
  }, []);

  const fetchMissionContent = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mission_content')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setContent(data as any);
      }
    } catch (error) {
      console.error('Error fetching mission content:', error);
      toast.error('Failed to load mission content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('mission_content')
        .upsert({
          ...content,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      toast.success('Mission content saved successfully');
      if (data) {
        setContent(data as any);
      }
    } catch (error) {
      console.error('Error saving mission content:', error);
      toast.error('Failed to save mission content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsLoading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `mission-${Date.now()}.${fileExt}`;

      // Upload to the site-assets bucket
      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(`about/mission/${fileName}`, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(`about/mission/${fileName}`);

      setContent(prev => ({ ...prev, image_url: publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 max-w-4xl mx-auto p-6"
    >
      <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Mission Statement
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Edit your organization's mission and values
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={isLoading}
          className={`
            px-6 py-2.5 rounded-lg font-medium transition-all duration-200
            ${isLoading 
              ? 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-primary to-secondary text-white hover:shadow-lg hover:shadow-primary/20'
            }
          `}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Saving...
            </span>
          ) : 'Save Changes'}
        </motion.button>
      </div>

      <div className="grid gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid md:grid-cols-2 gap-6"
        >
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Title</span>
              <input
                type="text"
                value={content.title}
                onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                placeholder="Enter mission title"
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subtitle</span>
              <input
                type="text"
                value={content.subtitle}
                onChange={(e) => setContent(prev => ({ ...prev, subtitle: e.target.value }))}
                className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200"
                placeholder="Enter mission subtitle"
              />
            </label>
          </div>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Mission Image</span>
              <div className="mt-1 space-y-4">
                <div className="relative group">
                  {content.image_url ? (
                    <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                      <img
                        src={content.image_url}
                        alt="Mission"
                        className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-video rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <span className="text-gray-400">No image uploaded</span>
                    </div>
                  )}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-500 
                    file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 
                    file:text-sm file:font-medium file:bg-primary/10 file:text-primary 
                    hover:file:bg-primary/20 file:transition-colors file:duration-200"
                />
              </div>
            </label>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <label className="block">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</span>
            <textarea
              value={content.description}
              onChange={(e) => setContent(prev => ({ ...prev, description: e.target.value }))}
              rows={6}
              className="mt-1 block w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors duration-200 resize-none"
              placeholder="Enter mission description"
            />
          </label>
        </motion.div>
      </div>
    </motion.div>
  );
}
