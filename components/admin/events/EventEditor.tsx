'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { ArrowLeft, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { Event, EventFormData } from '@/types/events';
import Image from 'next/image';

interface EventEditorProps {
  event: Event | null;
  onClose: () => void;
}

export default function EventEditor({ event, onClose }: EventEditorProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState<EventFormData>({
    title: event?.title || '',
    description: event?.description || '',
    event_date: event?.event_date || '',
    event_time: event?.event_time || '14:00:00',
    location: event?.location || '',
    additional_info: event?.additional_info || '',
    featured_image_url: event?.featured_image_url || '',
    status: event?.status || 'upcoming',
    max_attendees: event?.max_attendees || undefined,
    current_attendees: event?.current_attendees || 0,
    registration_link: event?.registration_link || '',
    organizer_name: event?.organizer_name || '',
    organizer_contact: event?.organizer_contact || '',
    is_featured: event?.is_featured || false,
    // Registration fields
    has_internal_registration: event?.has_internal_registration || false,
    registration_type: event?.registration_type || 'external',
    registration_deadline: event?.registration_deadline || '',
    early_bird_deadline: event?.early_bird_deadline || '',
    early_bird_discount: event?.early_bird_discount || 0,
    requires_payment: event?.requires_payment || false,
    venue_details: event?.venue_details || '',
    terms_and_conditions: event?.terms_and_conditions || '',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? parseInt(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const fileExt = file.name.split('.').pop();
    const fileName = `event-${Date.now()}.${fileExt}`;
    const filePath = `events/${fileName}`;

    setUploading(true);
    try {
      // Upload image to storage
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      if (!publicUrlData.publicUrl) throw new Error('Failed to get public URL');

      setFormData(prev => ({ ...prev, featured_image_url: publicUrlData.publicUrl }));
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
    setFormData(prev => ({ ...prev, featured_image_url: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.title.trim()) {
      toast.error('Please enter an event title');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter an event description');
      return;
    }
    if (!formData.event_date) {
      toast.error('Please select an event date');
      return;
    }
    if (!formData.location.trim()) {
      toast.error('Please enter an event location');
      return;
    }

    setSaving(true);
    try {
      const eventData = {
        ...formData,
        additional_info: formData.additional_info || null,
        featured_image_url: formData.featured_image_url || null,
        max_attendees: formData.max_attendees || null,
        registration_link: formData.registration_link || null,
        organizer_name: formData.organizer_name || null,
        organizer_contact: formData.organizer_contact || null,
        // Handle date fields - convert empty strings to null
        registration_deadline: formData.registration_deadline || null,
        early_bird_deadline: formData.early_bird_deadline || null,
        venue_details: formData.venue_details || null,
        terms_and_conditions: formData.terms_and_conditions || null,
      };

      if (event) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(eventData)
          .eq('id', event.id);

        if (error) throw error;
        toast.success('Event updated successfully');
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([eventData]);

        if (error) throw error;
        toast.success('Event created successfully');
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving event:', error);
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
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
              {event ? 'Edit Event' : 'Create New Event'}
            </h2>
            <p className="text-gray-600 mt-1">
              {event ? 'Update event details' : 'Fill in the event information'}
            </p>
          </div>
        </div>
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
                Event Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="e.g., Nutrition Workshop: Meal Planning"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="Describe the event in detail..."
              />
            </div>

            {/* Additional Info */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Additional Information
              </label>
              <textarea
                name="additional_info"
                value={formData.additional_info}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="Any additional notes or requirements..."
              />
            </div>
          </div>
        </div>

        {/* Date, Time & Location */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Date, Time & Location</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Date *
              </label>
              <input
                type="date"
                name="event_date"
                value={formData.event_date}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
            </div>

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Time *
              </label>
              <input
                type="time"
                name="event_time"
                value={formData.event_time.slice(0, 5)}
                onChange={(e) => setFormData(prev => ({ ...prev, event_time: e.target.value + ':00' }))}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
            </div>

            {/* Location */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="e.g., Oncotrition Center, Nairobi or Virtual Event (Zoom)"
              />
            </div>
          </div>
        </div>

        {/* Attendees & Registration */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendees & Registration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Max Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Maximum Attendees
              </label>
              <input
                type="number"
                name="max_attendees"
                value={formData.max_attendees || ''}
                onChange={handleChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="Leave empty for unlimited"
              />
            </div>

            {/* Current Attendees */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Attendees
              </label>
              <input
                type="number"
                name="current_attendees"
                value={formData.current_attendees}
                onChange={handleChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              />
            </div>

            {/* Registration Link */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                External Registration Link
              </label>
              <input
                type="url"
                name="registration_link"
                value={formData.registration_link}
                onChange={handleChange}
                disabled={formData.has_internal_registration && formData.registration_type === 'internal'}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688] disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="https://forms.gle/example (only for external registration)"
              />
              {formData.has_internal_registration && formData.registration_type === 'internal' && (
                <p className="text-xs text-gray-500 mt-1">
                  External link disabled when using internal registration
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Internal Registration Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Registration System</h3>
          
          <div className="space-y-4">
            {/* Enable Internal Registration */}
            <div className="flex items-center gap-3 p-4 bg-teal-50 border border-teal-200 rounded-lg">
              <input
                type="checkbox"
                name="has_internal_registration"
                id="has_internal_registration"
                checked={formData.has_internal_registration}
                onChange={handleChange}
                className="w-5 h-5 text-[#009688] border-gray-300 rounded focus:ring-[#009688]"
              />
              <label htmlFor="has_internal_registration" className="flex-1 cursor-pointer">
                <span className="block font-medium text-gray-900">
                  Enable Internal Registration System
                </span>
                <span className="block text-sm text-gray-600">
                  Allow attendees to register directly through the platform with payment processing, QR codes, and check-in management
                </span>
              </label>
            </div>

            {/* Registration Type */}
            {formData.has_internal_registration && (
              <div className="space-y-4 pl-4 border-l-4 border-teal-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Type *
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="registration_type"
                        value="internal"
                        checked={formData.registration_type === 'internal'}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#009688] border-gray-300 focus:ring-[#009688]"
                      />
                      <span className="text-sm">
                        <strong>Internal:</strong> Full registration system with payment, QR codes, and check-in
                      </span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="registration_type"
                        value="external"
                        checked={formData.registration_type === 'external'}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#009688] border-gray-300 focus:ring-[#009688]"
                      />
                      <span className="text-sm">
                        <strong>External:</strong> Use external registration link (Google Forms, Eventbrite, etc.)
                      </span>
                    </label>
                  </div>
                </div>

                {formData.registration_type === 'internal' && (
                  <>
                    {/* Requires Payment */}
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        name="requires_payment"
                        id="requires_payment"
                        checked={formData.requires_payment}
                        onChange={handleChange}
                        className="w-4 h-4 text-[#009688] border-gray-300 rounded focus:ring-[#009688]"
                      />
                      <label htmlFor="requires_payment" className="text-sm font-medium text-gray-700 cursor-pointer">
                        Requires Payment (Paystack integration)
                      </label>
                    </div>

                    {/* Deadlines */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Registration Deadline
                        </label>
                        <input
                          type="date"
                          name="registration_deadline"
                          value={formData.registration_deadline}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Early Bird Deadline
                        </label>
                        <input
                          type="date"
                          name="early_bird_deadline"
                          value={formData.early_bird_deadline}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                        />
                      </div>
                    </div>

                    {/* Early Bird Discount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Early Bird Discount (%)
                      </label>
                      <input
                        type="number"
                        name="early_bird_discount"
                        value={formData.early_bird_discount}
                        onChange={handleChange}
                        min="0"
                        max="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                        placeholder="e.g., 20 for 20% discount"
                      />
                    </div>

                    {/* Venue Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Venue Details
                      </label>
                      <textarea
                        name="venue_details"
                        value={formData.venue_details}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                        placeholder="Detailed venue information, directions, parking, etc."
                      />
                    </div>

                    {/* Terms and Conditions */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Terms and Conditions
                      </label>
                      <textarea
                        name="terms_and_conditions"
                        value={formData.terms_and_conditions}
                        onChange={handleChange}
                        rows={5}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                        placeholder="Registration terms, cancellation policy, code of conduct, etc."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        These terms will be shown during registration and must be accepted by attendees
                      </p>
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <p className="text-sm text-blue-900 font-medium mb-2">
                        📝 After Enabling Internal Registration:
                      </p>
                      <ul className="text-sm text-blue-700 space-y-1">
                        <li>• Set up pricing tiers in the Pricing Management page</li>
                        <li>• Configure interest areas in the Interest Areas page</li>
                        <li>• Attendees can register and pay through the platform</li>
                        <li>• QR codes will be generated automatically</li>
                        <li>• Use the Check-in Scanner on event day</li>
                      </ul>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Organizer Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Organizer Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Organizer Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizer Name
              </label>
              <input
                type="text"
                name="organizer_name"
                value={formData.organizer_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="e.g., Dr. Jane Doe"
              />
            </div>

            {/* Organizer Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organizer Contact
              </label>
              <input
                type="email"
                name="organizer_contact"
                value={formData.organizer_contact}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
                placeholder="organizer@example.com"
              />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Featured Image</h3>
          
          {formData.featured_image_url ? (
            <div className="relative">
              <div className="relative h-64 rounded-lg overflow-hidden">
                <Image
                  src={formData.featured_image_url}
                  alt="Event featured image"
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
              <p className="text-sm text-gray-500 mt-2">Recommended: 1200x600px</p>
            </div>
          )}
        </div>

        {/* Status & Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Status & Settings</h3>
          
          <div className="space-y-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Event Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#009688]"
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_featured"
                name="is_featured"
                checked={formData.is_featured}
                onChange={handleChange}
                className="w-4 h-4 text-[#009688] border-gray-300 rounded focus:ring-[#009688]"
              />
              <label htmlFor="is_featured" className="text-sm font-medium text-gray-700">
                Mark as Featured Event
              </label>
            </div>
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
                <span>{event ? 'Update Event' : 'Create Event'}</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
