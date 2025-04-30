'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import { Image as ImageIcon, Type, Text, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

interface HeroContent {
  id?: string;
  title: string;
  subtitle: string;
  tagline: string;
  background_image: string;
}

export default function HeroSectionTab() {
  const supabase = createClientComponentClient();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<HeroContent>({
    title: '',
    subtitle: '',
    tagline: '',
    background_image: ''
  });

  useEffect(() => {
    fetchHeroContent();
  }, []);

  const fetchHeroContent = async () => {
    try {
      const { data: heroContent, error } = await supabase
        .from('smartspoon_hero')
        .select('*')
        .single();

      if (error) throw error;

      if (heroContent) {
        setFormData({
          id: heroContent.id,
          title: heroContent.title,
          subtitle: heroContent.subtitle,
          tagline: heroContent.tagline,
          background_image: heroContent.background_image
        });
      }
    } catch (error) {
      console.error('Error fetching hero content:', error);
      toast.error('Failed to load hero content');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Validate required fields
    if (!formData.title || !formData.subtitle || !formData.tagline || !formData.background_image) {
      toast.error('All fields are required');
      setSaving(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/smartspoon/hero', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to update hero section');
      }

      const data = await response.json();
      toast.success('Hero section updated successfully');
    } catch (error) {
      console.error('Error updating hero section:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update hero section');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `smartspoon/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      setFormData({ ...formData, background_image: publicUrl });
      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white p-4 rounded-lg shadow-sm">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Hero Section Content</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          {/* Preview */}
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-700 mb-4">Preview</h3>
            <div className="bg-gray-50 p-6 rounded-lg border">
              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-block px-3 py-1 rounded-full bg-gray-100 text-sm">
                  {formData.tagline || 'Tagline'}
                </div>
                <div className="text-2xl font-bold">
                  {formData.title || 'Title'}
                </div>
                <div className="text-sm text-center">
                  {formData.subtitle || 'Subtitle'}
                </div>
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Text className="w-4 h-4" />
                  Tagline
                </div>
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Enter the tagline text"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Title
                </div>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Enter the main title"
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <Text className="w-4 h-4" />
                  Subtitle
                </div>
              </label>
              <textarea
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Enter the subtitle text"
                rows={3}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <div className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Background Image
                </div>
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                disabled={saving}
              />
              {formData.background_image && (
                <p className="mt-1 text-sm text-gray-500">
                  Current image: {formData.background_image.split('/').pop()}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className={cn(
                "flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
