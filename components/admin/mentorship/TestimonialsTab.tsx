'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { Star, Trash2 } from 'lucide-react';

interface TestimonialsContent {
  id: string;
  title: string;
  description: string;
}

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company: string;
  content: string;
  rating: number;
  image: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

const defaultTestimonial: Omit<Testimonial, 'id' | 'order_index'> = {
  name: '',
  role: '',
  company: '',
  content: '',
  rating: 5,
  image: '/testimonials/placeholder.jpg'
};

export default function TestimonialsTab() {
  const [content, setContent] = useState<TestimonialsContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editStates, setEditStates] = useState<{ [key: string]: Partial<Testimonial> }>({});
  const supabase = createClient();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch section content
      const { data: contentData, error: contentError } = await supabase
        .from('mentorship_testimonials_content')
        .select('*')
        .single();

      if (contentError) throw contentError;
      setContent(contentData);

      // Fetch testimonials
      const { data: testimonialsData, error: testimonialsError } = await supabase
        .from('mentorship_testimonials')
        .select('*')
        .order('order_index');

      if (testimonialsError) throw testimonialsError;
      setTestimonials(testimonialsData || []);

      // Initialize edit states
      const initialEditStates = (testimonialsData || []).reduce((acc, testimonial) => ({
        ...acc,
        [testimonial.id]: { ...testimonial }
      }), {});
      setEditStates(initialEditStates);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load testimonials data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContent = async (updates: Partial<TestimonialsContent>) => {
    if (!content?.id) return;

    const toastId = toast.loading('Saving content...');
    try {
      const { error } = await supabase
        .from('mentorship_testimonials_content')
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

  const handleAddTestimonial = async () => {
    const toastId = toast.loading('Adding new testimonial...');
    try {
      const newOrderIndex = testimonials.length > 0
        ? Math.max(...testimonials.map(t => t.order_index)) + 1
        : 1;

      const { data, error } = await supabase
        .from('mentorship_testimonials')
        .insert([{ ...defaultTestimonial, order_index: newOrderIndex }])
        .select()
        .single();

      if (error) throw error;
      setTestimonials([...testimonials, data]);
      setEditStates(prev => ({
        ...prev,
        [data.id]: { ...data }
      }));
      toast.success('New testimonial added successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error adding testimonial:', error);
      toast.error(error.message || 'Failed to add testimonial', { id: toastId });
    }
  };

  const handleUpdateTestimonial = (id: string, updates: Partial<Testimonial>) => {
    setEditStates(prev => ({
      ...prev,
      [id]: { ...prev[id], ...updates }
    }));
  };

  const handleSaveTestimonial = async (id: string) => {
    const updates = editStates[id];
    if (!updates) return;

    const toastId = toast.loading('Saving testimonial...');
    try {
      // Validate required fields
      if (!updates.name?.trim()) {
        toast.error('Name is required', { id: toastId });
        return;
      }
      if (!updates.role?.trim()) {
        toast.error('Role is required', { id: toastId });
        return;
      }
      if (!updates.content?.trim()) {
        toast.error('Testimonial content is required', { id: toastId });
        return;
      }

      const { error } = await supabase
        .from('mentorship_testimonials')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      setTestimonials(prev =>
        prev.map(t => t.id === id ? { ...t, ...updates } : t)
      );
      toast.success('Testimonial saved successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error saving testimonial:', error);
      toast.error(error.message || 'Failed to save testimonial', { id: toastId });
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Are you sure you want to delete this testimonial?')) return;

    const toastId = toast.loading('Deleting testimonial...');
    try {
      const { error } = await supabase
        .from('mentorship_testimonials')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setTestimonials(testimonials.filter(t => t.id !== id));
      setEditStates(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
      toast.success('Testimonial deleted successfully', { id: toastId });
    } catch (error: any) {
      console.error('Error deleting testimonial:', error);
      toast.error(error.message || 'Failed to delete testimonial', { id: toastId });
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
      const fileName = `testimonial-${id}-${Date.now()}.${fileExt}`;
      const filePath = `testimonials/${fileName}`;

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

      handleUpdateTestimonial(id, { image: publicUrl });
      toast.dismiss('uploadToast');
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.dismiss('uploadToast');
      toast.error(error.message || 'Failed to upload image');
    }
  };

  if (isLoading) {
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

        {/* Testimonials Management */}
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Manage Testimonials</h3>
          <button
            onClick={handleAddTestimonial}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-emerald-500/50 shadow-md hover:shadow-lg"
          >
            Add Testimonial
          </button>
        </div>

        <div className="space-y-8">
          {testimonials.map((testimonial) => {
            const editState = editStates[testimonial.id] || testimonial;
            return (
              <div
                key={testimonial.id}
                className="border dark:border-gray-700 rounded-xl p-6 space-y-6 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {editState.name || 'New Testimonial'}
                  </h4>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleSaveTestimonial(testimonial.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all duration-300 transform hover:scale-105 focus:ring-2 focus:ring-emerald-500/50 shadow-md hover:shadow-lg"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => handleDeleteTestimonial(testimonial.id)}
                      className="text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editState.name}
                        onChange={(e) => handleUpdateTestimonial(testimonial.id, { name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Role
                      </label>
                      <input
                        type="text"
                        value={editState.role}
                        onChange={(e) => handleUpdateTestimonial(testimonial.id, { role: e.target.value })}
                        placeholder="e.g., Fitness Coach"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={editState.company}
                        onChange={(e) => handleUpdateTestimonial(testimonial.id, { company: e.target.value })}
                        placeholder="e.g., FitLife Studio"
                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm focus:border-primary focus:ring-2 focus:ring-primary/50 transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((rating) => (
                          <button
                            key={rating}
                            onClick={() => handleUpdateTestimonial(testimonial.id, { rating })}
                            className={`p-2 rounded-lg transition-all duration-300 ${
                              (editState?.rating ?? testimonial.rating) >= rating
                                ? 'text-yellow-400 hover:text-yellow-500'
                                : 'text-gray-300 hover:text-gray-400'
                            }`}
                          >
                            <Star className="w-6 h-6" fill={rating <= (editState?.rating ?? testimonial.rating) ? 'currentColor' : 'none'} />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Image
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="relative w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden ring-2 ring-primary/20">
                          <Image
                            src={editState?.image ?? testimonial.image}
                            alt={editState?.name ?? testimonial.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(testimonial.id, file);
                          }}
                          className="text-sm text-gray-500 dark:text-gray-400
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-emerald-600 file:text-white
                          hover:file:bg-emerald-700
                          file:transition-colors
                          file:cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Testimonial
                  </label>
                  <textarea
                    rows={3}
                    value={editState.content}
                    onChange={(e) => handleUpdateTestimonial(testimonial.id, { content: e.target.value })}
                    placeholder="Enter client testimonial"
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
