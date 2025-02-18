'use client'

import { useState, useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { HiPlus, HiTrash } from 'react-icons/hi'
import { FiSave } from 'react-icons/fi'
import { toast } from 'react-hot-toast'
import Image from 'next/image'
import { PhotoIcon } from '@heroicons/react/24/outline'

interface FooterSettings {
  id?: number;
  logo: string;
  description: string;
  copyright: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
  };
  contact_info: {
    email: string;
    phone: string;
    address: string;
  };
  quick_links: Array<{
    name: string;
    href: string;
  }>;
  legal_links: {
    privacy_policy: string;
    terms_of_service: string;
    cookie_policy: string;
  };
  newsletter: {
    enabled: boolean;
    description: string;
  };
  brand: {
    description: string;
  };
  copyright_text: string;
  promo_image?: string;
  promo_url?: string;
}

const defaultSettings: FooterSettings = {
  logo: '',
  description: '',
  copyright: '',
  social_links: {
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: ''
  },
  contact_info: {
    email: '',
    phone: '',
    address: ''
  },
  quick_links: [],
  legal_links: {
    privacy_policy: '',
    terms_of_service: '',
    cookie_policy: ''
  },
  newsletter: {
    enabled: true,
    description: 'Subscribe to our newsletter for tips and updates.'
  },
  brand: {
    description: 'Empowering your journey to better health through personalized nutrition guidance.'
  },
  copyright_text: `  ${new Date().getFullYear()} Oncotrition. All rights reserved.`,
  promo_image: '',
  promo_url: ''
};

const Section = ({ children, title }: { children: React.ReactNode; title: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white dark:bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 space-y-4 shadow-lg border border-gray-100 dark:border-gray-700"
  >
    <h3 className="text-lg font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
      {title}
    </h3>
    {children}
  </motion.div>
);

const Input = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input
    {...props}
    className={`w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors duration-300 ${props.className || ''}`}
  />
);

const TextArea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea
    {...props}
    className={`w-full px-4 py-2 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-primary transition-colors duration-300 ${props.className || ''}`}
  />
);

export default function FooterTab() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings)
  
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .eq('id', 1)
        .single()

      if (error) throw error

      if (data) {
        setSettings({
          ...defaultSettings,
          ...data,
          social_links: { ...defaultSettings.social_links, ...data.social_links },
          contact_info: { ...defaultSettings.contact_info, ...data.contact_info },
          quick_links: data.quick_links || defaultSettings.quick_links,
          legal_links: { ...defaultSettings.legal_links, ...data.legal_links },
          newsletter: { ...defaultSettings.newsletter, ...data.newsletter },
          brand: { ...defaultSettings.brand, ...data.brand },
          promo_image: data.promo_image || defaultSettings.promo_image,
          promo_url: data.promo_url || defaultSettings.promo_url
        })
      }
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // First check if we have any existing settings
      const { data: existingSettings } = await supabase
        .from('footer_settings')
        .select('id')
        .single();

      // Create a copy of settings without the id field
      const { id, ...settingsWithoutId } = settings;

      if (existingSettings) {
        // Update existing settings
        const { error } = await supabase
          .from('footer_settings')
          .update(settingsWithoutId)
          .eq('id', existingSettings.id);

        if (error) throw error;
      } else {
        // Insert new settings with id = 1
        const { error } = await supabase
          .from('footer_settings')
          .insert({ ...settingsWithoutId, id: 1 });

        if (error) throw error;
      }

      toast.success('Footer settings saved successfully!')
      router.refresh()
    } catch (error: any) {
      console.error('Error:', error)
      setError(error.message)
      toast.error('Failed to save footer settings')
    } finally {
      setIsSaving(false)
    }
  }

  const updateSocialLink = (platform: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      social_links: {
        ...prev.social_links,
        [platform]: value
      }
    }))
  }

  const updateQuickLink = (index: number, field: string, value: string) => {
    setSettings(prev => {
      const newQuickLinks = [...prev.quick_links]
      newQuickLinks[index] = {
        ...newQuickLinks[index],
        [field]: value
      }
      return {
        ...prev,
        quick_links: newQuickLinks
      }
    })
  }

  const addQuickLink = () => {
    setSettings(prev => ({
      ...prev,
      quick_links: [...prev.quick_links, { name: '', href: '' }]
    }))
  }

  const removeQuickLink = (index: number) => {
    setSettings(prev => ({
      ...prev,
      quick_links: prev.quick_links.filter((_, i) => i !== index)
    }))
  }

  const updateContactInfo = (field: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      contact_info: {
        ...prev.contact_info,
        [field]: value
      }
    }))
  }

  const updateLegalLinks = (key: string, value: string) => {
    setSettings(prev => ({
      ...prev,
      legal_links: {
        ...prev.legal_links,
        [key]: value
      }
    }))
  }

  const handleImageUpload = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `footer/promo-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('site-assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('site-assets')
        .getPublicUrl(filePath);

      setSettings(prev => ({
        ...prev,
        promo_image: publicUrl
      }));

      toast.success('Image uploaded successfully');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image');
    }
  };

  if (isLoading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="space-y-8 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          Footer Settings
        </h2>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors duration-300"
        >
          <FiSave className="w-5 h-5" />
          <span>{isSaving ? 'Saving...' : 'Save Changes'}</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <Section title="Brand Information">
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Brand Description
          </label>
          <TextArea
            value={settings.brand.description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings(prev => ({
              ...prev,
              brand: { ...prev.brand, description: e.target.value }
            }))}
            placeholder="Enter brand description"
            className="mt-2"
          />
        </div>
      </Section>

      <Section title="Social Media Links">
        {['facebook', 'twitter', 'instagram', 'linkedin'].map(platform => (
          <div key={platform} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {platform}
            </label>
            <div className="mt-1">
              <Input
                type="url"
                value={settings.social_links[platform as keyof typeof settings.social_links]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateSocialLink(platform, e.target.value)}
                placeholder={`Enter ${platform} URL`}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Quick Links">
        <div className="space-y-4">
          {settings.quick_links.map((link, index) => (
            <div key={index} className="flex items-start space-x-4">
              <div className="flex-1 space-y-4">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <Input
                      value={link.name}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuickLink(index, 'name', e.target.value)}
                      placeholder="Link Name"
                    />
                  </div>
                  <div className="flex-1">
                    <Input
                      value={link.href}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateQuickLink(index, 'href', e.target.value)}
                      placeholder="Link URL"
                    />
                  </div>
                  <button
                    onClick={() => removeQuickLink(index)}
                    className="p-2 text-red-500 hover:text-red-600 transition-colors duration-300"
                  >
                    <HiTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
          <button
            onClick={addQuickLink}
            className="flex items-center space-x-2 text-primary hover:text-primary/90 transition-colors duration-300"
          >
            <HiPlus className="w-5 h-5" />
            <span>Add Quick Link</span>
          </button>
        </div>
      </Section>

      <Section title="Contact Information">
        {['email', 'phone', 'address'].map(field => (
          <div key={field} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
              {field}
            </label>
            <div className="mt-1">
              <Input
                type={field === 'email' ? 'email' : 'text'}
                value={settings.contact_info[field as keyof typeof settings.contact_info]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateContactInfo(field, e.target.value)}
                placeholder={`Enter ${field}`}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Newsletter">
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={settings.newsletter.enabled}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSettings(prev => ({
                ...prev,
                newsletter: { ...prev.newsletter, enabled: e.target.checked }
              }))}
              className="rounded border-gray-300 text-primary focus:ring-primary"
            />
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Enable Newsletter Section
            </label>
          </div>

          {settings.newsletter.enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Newsletter Description
              </label>
              <TextArea
                value={settings.newsletter.description}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings(prev => ({
                  ...prev,
                  newsletter: { ...prev.newsletter, description: e.target.value }
                }))}
                placeholder="Enter newsletter description"
                className="mt-2"
              />
            </div>
          )}
        </div>
      </Section>

      <Section title="Legal Links">
        {[
          { key: 'privacy_policy', label: 'Privacy Policy' },
          { key: 'terms_of_service', label: 'Terms of Service' },
          { key: 'cookie_policy', label: 'Cookie Policy' }
        ].map(({ key, label }) => (
          <div key={key} className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {label}
            </label>
            <div className="mt-1">
              <Input
                type="url"
                value={settings.legal_links[key as keyof typeof settings.legal_links]}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateLegalLinks(key, e.target.value)}
                placeholder={`Enter ${label} URL`}
              />
            </div>
          </div>
        ))}
      </Section>

      <Section title="Promotional Content">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Image
            </label>
            <div className="flex items-center gap-4">
              {settings.promo_image && (
                <div className="relative w-40 h-24">
                  <Image
                    src={settings.promo_image}
                    alt="Promotional"
                    fill
                    className="object-cover rounded-lg"
                  />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                  className="hidden"
                  id="promo-image-upload"
                />
                <label
                  htmlFor="promo-image-upload"
                  className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none"
                >
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  Upload Image
                </label>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL
            </label>
            <input
              type="url"
              value={settings.promo_url || ''}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                promo_url: e.target.value
              }))}
              placeholder="Enter URL for the promotional image"
              className="w-full px-4 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors duration-200"
            />
          </div>
        </div>
      </Section>

      <Section title="Copyright Text">
        <TextArea
          value={settings.copyright_text}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSettings(prev => ({ 
            ...prev, 
            copyright_text: e.target.value 
          }))}
          rows={2}
          placeholder="Enter copyright text"
        />
      </Section>
    </div>
  )
}
