'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Trash2, Link2 } from 'lucide-react';

interface BusinessTipsContent {
  id: string;
  title: string;
  description: string;
}

interface BusinessTip {
  id: string;
  title: string;
  description: string;
  image: string;
  url: string;
  order_index: number;
}

const defaultTip: Omit<BusinessTip, 'id' | 'order_index'> = {
  title: '',
  description: '',
  image: '/images/mentorship/placeholder.svg',
  url: ''
};

const validateUrl = (url: string): boolean => {
  try {
    const parsedUrl = new URL(url);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
  } catch {
    return false;
  }
};

export default function BusinessTipsTab() {
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState<BusinessTipsContent | null>(null);
  const [tips, setTips] = useState<BusinessTip[]>([]);
  const [editStates, setEditStates] = useState<{ [key: string]: Partial<BusinessTip> }>({});
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch section content
      const { data: contentData, error: contentError } = await supabase
        .from('mentorship_business_tips_content')
        .select('*')
        .single();

      if (contentError) throw contentError;
      setContent(contentData);

      // Fetch tips
      const { data: tipsData, error: tipsError } = await supabase
        .from('mentorship_business_tips')
        .select('*')
        .order('order_index');

      if (tipsError) throw tipsError;
      setTips(tipsData || []);

      // Initialize edit states
      const initialEditStates = (tipsData || []).reduce((acc, tip) => ({
        ...acc,
        [tip.id]: { ...tip }
      }), {});
      setEditStates(initialEditStates);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load business tips data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateContent = async (updates: Partial<BusinessTipsContent>) => {
    if (!content?.id) return;

    const toastId = toast.loading('Saving content...');
    try {
      const { error } = await supabase
        .from('mentorship_business_tips_content')
        .update(updates)
        .eq('id', content.id);

      if (error) throw error;
      setContent(prev => prev ? { ...prev, ...updates } : null);
      toast.success('Content saved successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error saving content:', error);
      toast.error(error.message || 'Failed to save content', { id: toastId });
    }
  };

  const handleAddTip = async () => {
    const toastId = toast.loading('Adding new tip...');
    try {
      const newOrderIndex = tips.length > 0
        ? Math.max(...tips.map(t => t.order_index)) + 1
        : 1;

      const { data, error } = await supabase
        .from('mentorship_business_tips')
        .insert([{ ...defaultTip, order_index: newOrderIndex }])
        .select()
        .single();

      if (error) throw error;
      setTips([...tips, data]);
      setEditStates(prev => ({
        ...prev,
        [data.id]: { ...data }
      }));
      toast.success('New tip added successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error adding tip:', error);
      toast.error(error.message || 'Failed to add tip', { id: toastId });
    }
  };

  const handleUpdateTip = (id: string, updates: Partial<BusinessTip>) => {
    // If updating URL, validate it first
    if ('url' in updates) {
      const url = updates.url?.trim() || '';
      if (url && !validateUrl(url)) {
        toast.error('Please enter a valid URL starting with http:// or https://');
        return;
      }
    }

    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleSaveTip = async (id: string) => {
    const updates = editStates[id];
    if (!updates) return;

    const toastId = toast.loading('Saving tip...');
    try {
      // Validate required fields
      if (!updates.title?.trim()) {
        toast.error('Title is required', { id: toastId });
        return;
      }
      if (!updates.description?.trim()) {
        toast.error('Description is required', { id: toastId });
        return;
      }
      if (!updates.url?.trim()) {
        toast.error('URL is required', { id: toastId });
        return;
      }

      // Validate URL format
      if (!validateUrl(updates.url)) {
        toast.error('Please enter a valid URL starting with http:// or https://', { id: toastId });
        return;
      }

      const { error } = await supabase
        .from('mentorship_business_tips')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTips(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
      toast.success('Tip saved successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error saving tip:', error);
      toast.error(error.message || 'Failed to save tip', { id: toastId });
    }
  };

  const handleDeleteTip = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tip?')) return;

    const toastId = toast.loading('Deleting tip...');
    try {
      const { error } = await supabase
        .from('mentorship_business_tips')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTips(tips.filter(t => t.id !== id));
      setEditStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast.success('Tip deleted successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error deleting tip:', error);
      toast.error(error.message || 'Failed to delete tip', { id: toastId });
    }
  };

  const handleImageUpload = async (id: string, file: File) => {
    try {
      // Check file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }

      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        throw new Error('File size should be less than 2MB');
      }

      const fileExt = file.name.split('.').pop()?.toLowerCase() || '';
      const fileName = `business-tip-${id}-${Date.now()}.${fileExt}`;
      const filePath = `business-tips/${fileName}`;

      toast.loading('Uploading image...', { id: 'uploadToast' });

      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      handleUpdateTip(id, { image: publicUrl });
      toast.dismiss('uploadToast');
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.dismiss('uploadToast');
      toast.error(error.message || 'Failed to upload image');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
        {/* Section Content */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Section Content</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                value={content?.title || ''}
                onChange={(e) => handleUpdateContent({ title: e.target.value })}
                placeholder="Enter section title"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                rows={3}
                value={content?.description || ''}
                onChange={(e) => handleUpdateContent({ description: e.target.value })}
                placeholder="Enter section description"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Tips Management */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Tips</h3>
          <button
            onClick={handleAddTip}
            className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg"
          >
            Add Tip
          </button>
        </div>

        <div className="space-y-8">
          {tips.map((tip) => {
            const editState = editStates[tip.id] || tip;
            return (
              <div
                key={tip.id}
                className="border dark:border-gray-700 rounded-xl p-6 space-y-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editState.title || 'New Tip'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSaveTip(tip.id)}
                      className="px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-primary/50 shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => handleDeleteTip(tip.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editState.title}
                      onChange={(e) => handleUpdateTip(tip.id, { title: e.target.value })}
                      placeholder="Enter tip title"
                      className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <div className="relative">
                      <input
                        type="url"
                        value={editState.url}
                        onChange={(e) => handleUpdateTip(tip.id, { url: e.target.value })}
                        placeholder="Enter tip URL (e.g., https://example.com)"
                        className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                      <Link2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Image
                    </label>
                    <div className="flex items-center space-x-4">
                      <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ring-2 ring-primary/20">
                        <Image
                          src={editState?.image ?? tip.image}
                          alt={editState?.title ?? tip.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleImageUpload(tip.id, file);
                        }}
                        className="text-sm text-gray-500 dark:text-gray-400
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-primary file:text-white
                        hover:file:bg-primary/90
                        file:transition-colors
                        file:cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={editState.description}
                    onChange={(e) => handleUpdateTip(tip.id, { description: e.target.value })}
                    placeholder="Enter tip description"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300 resize-none"
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
