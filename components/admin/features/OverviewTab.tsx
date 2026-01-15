'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

interface BannerContent {
  id: number;
  title: string;
  subtitle: string | null;
  heading: string | null;
  bullet_points: string[] | any;
}

export default function OverviewTab() {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [heading, setHeading] = useState('');
  const [bulletPoints, setBulletPoints] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchBannerContent();
  }, []);

  async function fetchBannerContent() {
    const { data, error } = await supabase
      .from('features_banner')
      .select('*')
      .single();

    if (error) {
      console.error('Error fetching banner content:', error);
      return;
    }

    if (data) {
      setTitle(data.title);
      setSubtitle(data.subtitle ?? '');
      setHeading(data.heading ?? '');
      setBulletPoints((data.bullet_points as any) ?? []);
    }
    setIsLoading(false);
  }

  async function saveBannerContent() {
    setIsSaving(true);
    const { error } = await supabase
      .from('features_banner')
      .upsert({
        id: 1,
        title,
        subtitle,
        heading,
        bullet_points: bulletPoints,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Error saving banner content:', error);
    }
    setIsSaving(false);
  }

  const addBulletPoint = () => {
    setBulletPoints([...bulletPoints, '']);
  };

  const updateBulletPoint = (index: number, value: string) => {
    const newPoints = [...bulletPoints];
    newPoints[index] = value;
    setBulletPoints(newPoints);
  };

  const removeBulletPoint = (index: number) => {
    const newPoints = bulletPoints.filter((_, i) => i !== index);
    setBulletPoints(newPoints);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 shadow-lg rounded-2xl p-8 space-y-8"
      >
        <div className="grid gap-8 md:grid-cols-2">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Banner Title
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Banner Subtitle
              </label>
              <input
                type="text"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Main Heading
            </label>
            <textarea
              value={heading}
              onChange={(e) => setHeading(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 resize-none"
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              Bullet Points
            </label>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={addBulletPoint}
              className="inline-flex items-center px-4 py-2 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Point
            </motion.button>
          </div>
          
          <motion.div layout className="space-y-3">
            {bulletPoints.map((point, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  value={point}
                  onChange={(e) => updateBulletPoint(index, e.target.value)}
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Enter bullet point"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => removeBulletPoint(index)}
                  className="p-2 rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-200"
                >
                  <TrashIcon className="h-5 w-5" />
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </div>

        <div className="flex justify-end pt-6">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={saveBannerContent}
            disabled={isSaving}
            className="inline-flex items-center px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
