'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon, Eye } from 'lucide-react';
import { Announcement, AnnouncementFormData, Event } from '@/types/events';
import Image from 'next/image';
import AnnouncementPopup from '@/components/announcements/AnnouncementPopup';

// Minimal event type for dropdown selection
interface EventOption {
  id: string;
  title: string;
  event_date: string;
}

interface AnnouncementEditorProps {
  announcement: Announcement | null;
  onClose: () => void;
}

export default function AnnouncementEditor({ announcement, onClose }: AnnouncementEditorProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState<AnnouncementFormData>({
    title: announcement?.title || '',
    message: announcement?.message || '',
    announcement_type: (announcement?.announcement_type as any) || 'general',
    event_id: announcement?.event_id || undefined,
    cta_text: announcement?.cta_text || '',
    cta_link: announcement?.cta_link || '',
    image_url: announcement?.image_url || '',
    start_date: announcement?.start_date ? announcement.start_date.split('T')[0] : new Date().toISOString().split('T')[0],
    end_date: announcement?.end_date ? announcement.end_date.split('T')[0] : '',
    is_active: announcement?.is_active ?? true,
    priority: announcement?.priority || 5,
    display_frequency: (announcement?.display_frequency as any) || 'once',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('id, title, event_date')
        .eq('status', 'upcoming')
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error: any) {
      console.error('Error fetching events:', error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `announcement-${Date.now()}.${fileExt}`;
    const filePath = `announcements/${fileName}`;

    setUploading(true);
    try {
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL');

      setFormData(prev => ({ ...prev, image_url: publicUrlData.publicUrl }));
      toast.success('Image uploaded successfully');
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter an announcement title');
      return;
    }
    if (!formData.message.trim()) {
      toast.error('Please enter an announcement message');
      return;
    }
    if (!formData.end_date) {
      toast.error('Please select an end date');
      return;
    }

    setSaving(true);
    try {
      const announcementData = {
        ...formData,
        event_id: formData.event_id || null,
        cta_text: formData.cta_text || null,
        cta_link: formData.cta_link || null,
        image_url: formData.image_url || null,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date + 'T23:59:59').toISOString(),
      };

      if (announcement) {
        const { error } = await supabase
          .from('announcements')
          .update(announcementData)
          .eq('id', announcement.id);

        if (error) throw error;
        toast.success('Announcement updated successfully');
      } else {
        const { error } = await supabase
          .from('announcements')
          .insert([announcementData]);

        if (error) throw error;
        toast.success('Announcement created successfully');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving announcement:', error);
      toast.error('Failed to save announcement');
    } finally {
      setSaving(false);
    }
  };

  const previewAnnouncement: Announcement = {
    id: 'preview',
    title: formData.title || 'Preview Title',
    message: formData.message || 'Preview message',
    announcement_type: formData.announcement_type,
    event_id: formData.event_id || null,
    cta_text: formData.cta_text || null,
    cta_link: formData.cta_link || null,
    image_url: formData.image_url || null,
    start_date: formData.start_date,
    end_date: formData.end_date,
    is_active: formData.is_active,
    priority: formData.priority,
    display_frequency: formData.display_frequency,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {announcement ? 'Edit Announcement' : 'Create New Announcement'}
            </h2>
            <p className="text-gray-600 mt-1">
              {announcement ? 'Update announcement details' : 'Fill in the announcement information'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <Eye className="w-4 h-4" />
          Preview
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
          
          <div className="space-y-4">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="e.g., 🎉 New Workshop Alert!"
              />
            </div>

            {/* Message */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="Write your announcement message..."
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Announcement Type *
              </label>
              <select
                name="announcement_type"
                value={formData.announcement_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              >
                <option value="event">Event</option>
                <option value="general">General</option>
                <option value="promotion">Promotion</option>
                <option value="alert">Alert</option>
              </select>
            </div>

            {/* Link to Event (if type is event) */}
            {formData.announcement_type === 'event' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link to Event
                </label>
                <select
                  name="event_id"
                  value={formData.event_id || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                >
                  <option value="">No event linked</option>
                  {events.map(event => (
                    <option key={event.id} value={event.id}>
                      {event.title} - {new Date(event.event_date).toLocaleDateString()}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Call to Action</h3>
          
          <div className="space-y-4">
            {/* CTA Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Text
              </label>
              <input
                type="text"
                name="cta_text"
                value={formData.cta_text}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="e.g., Register Now, Learn More"
              />
            </div>

            {/* CTA Link */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Button Link
              </label>
              <input
                type="text"
                name="cta_link"
                value={formData.cta_link}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="/events or https://example.com"
              />
              <p className="text-xs text-gray-500 mt-1">
                Use relative paths (/events) for internal links or full URLs for external links
              </p>
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
          
          {formData.image_url ? (
            <div className="relative">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={formData.image_url}
                  alt="Announcement image"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    <span>Upload Image</span>
                  </>
                )}
              </button>
              <p className="text-sm text-gray-500 mt-2">Recommended: 1200x800px</p>
            </div>
          )}
        </div>

        {/* Schedule & Display Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule & Display Settings</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date *
              </label>
              <input
                type="date"
                name="start_date"
                value={formData.start_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date *
              </label>
              <input
                type="date"
                name="end_date"
                value={formData.end_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
            </div>

            {/* Display Frequency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Frequency
              </label>
              <select
                name="display_frequency"
                value={formData.display_frequency}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              >
                <option value="once">Once (show only once per user)</option>
                <option value="daily">Daily (show once per day)</option>
                <option value="always">Always (show on every visit)</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Priority (1-10)
              </label>
              <input
                type="number"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
              <p className="text-xs text-gray-500 mt-1">Higher numbers appear first</p>
            </div>
          </div>

          {/* Active Toggle */}
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              name="is_active"
              checked={formData.is_active}
              onChange={handleChange}
              className="w-4 h-4 text-[#009688] border-gray-300 rounded focus:ring-[#009688]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
              Active (announcement will be shown to users)
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-[#009688] text-white rounded-lg hover:bg-[#00796b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>{announcement ? 'Update Announcement' : 'Create Announcement'}</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Preview Modal */}
      {showPreview && (
        <AnnouncementPopup
          announcement={previewAnnouncement}
          onClose={() => setShowPreview(false)}
          onDontShowAgain={() => setShowPreview(false)}
        />
      )}
    </div>
  );
}
