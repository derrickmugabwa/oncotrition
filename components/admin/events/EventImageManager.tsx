'use client';

import { useState, useRef, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'react-hot-toast';
import { Upload, X, GripVertical, Star } from 'lucide-react';
import Image from 'next/image';
import { EventImage } from '@/types/events';

interface EventImageManagerProps {
  eventId: string;
  images: EventImage[];
  onImagesUpdate: () => void;
}

export default function EventImageManager({ 
  eventId, 
  images: initialImages,
  onImagesUpdate 
}: EventImageManagerProps) {
  const supabase = createClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [images, setImages] = useState<EventImage[]>(initialImages);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update images when initialImages prop changes
  useEffect(() => {
    setImages(initialImages);
  }, [initialImages]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedImages: EventImage[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = `event-${eventId}-${Date.now()}-${i}.${fileExt}`;
        const filePath = `events/${fileName}`;

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

        // Insert into database
        const { data: newImage, error: insertError } = await supabase
          .from('event_images' as any)
          .insert({
            event_id: eventId,
            image_url: publicUrlData.publicUrl,
            display_order: images.length + uploadedImages.length,
            is_primary: images.length === 0 && uploadedImages.length === 0, // First image is primary
          })
          .select()
          .single();

        if (insertError) throw insertError;
        if (newImage) uploadedImages.push(newImage as any);
      }

      setImages([...images, ...uploadedImages]);
      toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      onImagesUpdate();
    } catch (error: any) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDeleteImage = async (imageId: string, imageUrl: string) => {
    try {
      // Extract file path from URL
      const urlParts = imageUrl.split('/');
      const filePath = `events/${urlParts[urlParts.length - 1]}`;

      // Delete from storage
      await supabase.storage.from('images').remove([filePath]);

      // Delete from database
      const { error } = await supabase
        .from('event_images' as any)
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.filter(img => img.id !== imageId));
      toast.success('Image deleted successfully');
      onImagesUpdate();
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast.error('Failed to delete image');
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      // Unset all primary flags
      await supabase
        .from('event_images' as any)
        .update({ is_primary: false })
        .eq('event_id', eventId);

      // Set new primary
      const { error } = await supabase
        .from('event_images' as any)
        .update({ is_primary: true })
        .eq('id', imageId);

      if (error) throw error;

      setImages(images.map(img => ({
        ...img,
        is_primary: img.id === imageId
      })));
      toast.success('Primary image updated');
      onImagesUpdate();
    } catch (error: any) {
      console.error('Error setting primary image:', error);
      toast.error('Failed to set primary image');
    }
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newImages = [...images];
    const draggedImage = newImages[draggedIndex];
    newImages.splice(draggedIndex, 1);
    newImages.splice(index, 0, draggedImage);

    setImages(newImages);
    setDraggedIndex(index);
  };

  const handleDragEnd = async () => {
    if (draggedIndex === null) return;

    try {
      // Update display_order for all images
      const updates = images.map((img, index) => ({
        id: img.id,
        display_order: index
      }));

      for (const update of updates) {
        await supabase
          .from('event_images' as any)
          .update({ display_order: update.display_order })
          .eq('id', update.id);
      }

      toast.success('Image order updated');
      onImagesUpdate();
    } catch (error: any) {
      console.error('Error updating image order:', error);
      toast.error('Failed to update image order');
    } finally {
      setDraggedIndex(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Event Images Gallery</h3>
      
      {/* Upload Area */}
      <div className="mb-6">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={uploading}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#009688] hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">
            {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            PNG, JPG, GIF up to 10MB (multiple files supported)
          </p>
        </button>
      </div>

      {/* Images Grid */}
      {images.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images
            .sort((a, b) => a.display_order - b.display_order)
            .map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`relative group cursor-move rounded-lg overflow-hidden border-2 ${
                  image.is_primary ? 'border-[#009688]' : 'border-gray-200'
                } ${draggedIndex === index ? 'opacity-50' : ''}`}
              >
                {/* Drag Handle */}
                <div className="absolute top-2 left-2 z-10 bg-white/90 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                </div>

                {/* Primary Badge */}
                {image.is_primary && (
                  <div className="absolute top-2 right-2 z-10 bg-[#009688] text-white rounded-full p-1">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                )}

                {/* Image */}
                <div className="relative aspect-video">
                  <Image
                    src={image.image_url}
                    alt={image.caption || `Event image ${index + 1}`}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Actions */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!image.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(image.id)}
                      className="p-2 bg-white text-gray-800 rounded-full hover:bg-gray-100 transition-colors"
                      title="Set as primary"
                    >
                      <Star className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(image.id, image.image_url)}
                    className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    title="Delete image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Order Number */}
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  #{index + 1}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>No images uploaded yet. Upload images to create a gallery slider.</p>
        </div>
      )}

      {images.length > 0 && (
        <p className="text-xs text-gray-500 mt-4">
          💡 Drag and drop images to reorder. The first image (or starred image) will be the primary image.
        </p>
      )}
    </div>
  );
}
