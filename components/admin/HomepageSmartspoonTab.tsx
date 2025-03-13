'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { toast } from 'react-hot-toast';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { BiImageAdd } from 'react-icons/bi';
import { Database } from '@/types/supabase';
import { FiPlus, FiTrash } from 'react-icons/fi';

interface Service {
  id: number;
  title: string;
  description: string;
  icon: string;
}

type HomepageSmartspoon = Database['public']['Tables']['homepage_smartspoon']['Row'];

const defaultServices: Service[] = [
  {
    id: 1,
    title: "Smart Meal Tracking",
    description: "Automatically track your meals and portions with our intelligent spoon",
    icon: "ClockIcon"
  },
  {
    id: 2,
    title: "Real-time Analytics",
    description: "Get instant nutritional insights as you eat with advanced sensors",
    icon: "ChartBarIcon"
  },
  {
    id: 3,
    title: "Nutrient Detection",
    description: "Advanced technology that detects macro and micronutrients in your food",
    icon: "BeakerIcon"
  },
  {
    id: 4,
    title: "Smart Recommendations",
    description: "Receive personalized dietary suggestions based on your eating habits",
    icon: "SparklesIcon"
  }
];

const availableIcons = [
  { name: 'ClockIcon', label: 'Clock' },
  { name: 'ChartBarIcon', label: 'Chart Bar' },
  { name: 'BeakerIcon', label: 'Beaker' },
  { name: 'SparklesIcon', label: 'Sparkles' },
  { name: 'HeartIcon', label: 'Heart' },
  { name: 'ScaleIcon', label: 'Scale' }
];

const HomepageSmartspoonTab = () => {
  const [smartspoonData, setSmartspoonData] = useState<HomepageSmartspoon | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [title, setTitle] = useState('Smart Spoon Technology');
  const [description, setDescription] = useState('Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.');
  const [buttonText, setButtonText] = useState('Learn More About Smart Spoon');
  const [buttonLink, setButtonLink] = useState('/smart-spoon');
  const [services, setServices] = useState<Service[]>(defaultServices);

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    fetchSmartspoonData();
  }, []);

  const fetchSmartspoonData = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_smartspoon')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setSmartspoonData(data);
        setPreviewUrl(data.image_url || '');
        setTitle(data.title || 'Smart Spoon Technology');
        setDescription(data.description || 'Experience the future of nutrition tracking with our innovative smart spoon that helps you make informed dietary decisions in real-time.');
        setButtonText(data.button_text || 'Learn More About Smart Spoon');
        setButtonLink(data.button_link || '/smart-spoon');
        setServices(data.services || defaultServices);
      }
    } catch (error) {
      console.error('Error fetching smartspoon data:', error);
      toast.error('Failed to load smartspoon data');
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
    const fileName = `smartspoon-${Date.now()}.${fileExt}`;
    const filePath = `smartspoon/${fileName}`;

    try {
      const { data: existingFiles } = await supabase.storage
        .from('site_assets')
        .list('smartspoon');

      const existingFile = existingFiles?.find(file => 
        file.name.startsWith('smartspoon-')
      );

      if (existingFile) {
        await supabase.storage
          .from('site_assets')
          .remove([`smartspoon/${existingFile.name}`]);
      }

      const { error: uploadError, data } = await supabase.storage
        .from('site_assets')
        .upload(filePath, imageFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site_assets')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  const handleAddService = () => {
    const newId = Math.max(...services.map(s => s.id), 0) + 1;
    setServices([...services, {
      id: newId,
      title: 'New Service',
      description: 'Service description',
      icon: 'SparklesIcon'
    }]);
  };

  const handleRemoveService = (id: number) => {
    setServices(services.filter(service => service.id !== id));
  };

  const handleServiceChange = (id: number, field: keyof Service, value: string) => {
    setServices(services.map(service => 
      service.id === id ? { ...service, [field]: value } : service
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      let imageUrl = smartspoonData?.image_url || '';

      if (imageFile) {
        imageUrl = await uploadImage() || imageUrl;
      }

      // Convert services to JSONB array format
      const servicesJsonb = services.map(service => ({
        id: service.id,
        title: service.title,
        description: service.description,
        icon: service.icon
      }));

      const updatedData = {
        id: smartspoonData?.id,
        title,
        description,
        button_text: buttonText,
        button_link: buttonLink,
        image_url: imageUrl,
        services: servicesJsonb
      };

      const { error } = await supabase
        .from('homepage_smartspoon')
        .upsert(updatedData);

      if (error) throw error;

      toast.success('Smartspoon section updated successfully');
      fetchSmartspoonData();
    } catch (error) {
      console.error('Error saving smartspoon data:', error);
      toast.error('Failed to update smartspoon section');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Title Section */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        {/* Description Section */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
            Description
          </label>
          <textarea
            id="description"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
          />
        </div>

        {/* Button Settings */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="buttonText" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Button Text
            </label>
            <input
              type="text"
              id="buttonText"
              value={buttonText}
              onChange={(e) => setButtonText(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="buttonLink" className="block text-sm font-medium text-gray-700 dark:text-gray-200">
              Button Link
            </label>
            <input
              type="text"
              id="buttonLink"
              value={buttonLink}
              onChange={(e) => setButtonLink(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
            />
          </div>
        </div>

        {/* Image Section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
            Smart Spoon Image
          </h3>
          <div className="relative">
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-700 border-dashed rounded-lg hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors cursor-pointer">
              <div className="space-y-1 text-center">
                {previewUrl ? (
                  <div className="relative w-full h-64">
                    <Image
                      src={previewUrl}
                      alt="Smart Spoon Preview"
                      fill
                      className="object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <BiImageAdd className="mx-auto h-12 w-12 text-gray-400" />
                )}
                <div className="flex text-sm text-gray-600 dark:text-gray-400">
                  <label className="relative cursor-pointer rounded-md font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500">
                    <span>Upload a file</span>
                    <input
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  PNG, JPG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services Section */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
              Services
            </h3>
            <button
              type="button"
              onClick={handleAddService}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
            >
              <FiPlus className="mr-2" />
              Add Service
            </button>
          </div>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex-grow space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Title
                      </label>
                      <input
                        type="text"
                        value={service.title}
                        onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={service.description}
                        onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-200">
                        Icon
                      </label>
                      <select
                        value={service.icon}
                        onChange={(e) => handleServiceChange(service.id, 'icon', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500 dark:bg-gray-800 dark:border-gray-600 dark:text-white sm:text-sm"
                      >
                        {availableIcons.map((icon) => (
                          <option key={icon.name} value={icon.name}>
                            {icon.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveService(service.id)}
                    className="ml-4 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                  >
                    <FiTrash className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={isSaving}
            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
              isSaving ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

export default HomepageSmartspoonTab;
