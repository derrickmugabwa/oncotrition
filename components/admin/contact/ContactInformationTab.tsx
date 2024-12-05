'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiSave } from 'react-icons/fi';
import { motion } from 'framer-motion';

interface ContactInfo {
  id: number;
  title: string;
  description: string;
  email: string;
  phone: string;
  address: string;
  social_links: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
  };
}

export default function ContactInformationTab() {
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClientComponentClient();

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error) throw error;
      setContactInfo(data);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to fetch contact information');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!contactInfo) return;

    try {
      setSaving(true);
      const { error } = await supabase
        .from('contact_info')
        .update({
          title: contactInfo.title,
          description: contactInfo.description,
          email: contactInfo.email,
          phone: contactInfo.phone,
          address: contactInfo.address,
          social_links: contactInfo.social_links
        })
        .eq('id', contactInfo.id);

      if (error) throw error;
      toast.success('Contact information updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!contactInfo) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        No contact information found
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden"
    >
      <div className="p-6">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex justify-between items-center mb-6"
        >
          <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            Contact Information
          </h3>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center px-6 py-3 border-2 border-primary rounded-xl text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 ease-in-out shadow-md hover:shadow-lg"
          >
            <FiSave className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save Changes'}
          </motion.button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-6"
        >
          {/* Title and Description */}
          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={contactInfo.title}
                onChange={(e) => setContactInfo({ ...contactInfo, title: e.target.value })}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter title"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                id="description"
                rows={2}
                value={contactInfo.description}
                onChange={(e) => setContactInfo({ ...contactInfo, description: e.target.value })}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter description"
              />
            </div>
          </div>

          {/* Contact Details */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiMail className="mr-2 h-5 w-5 text-primary" />
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter email"
                />
              </div>
              <div>
                <label htmlFor="phone" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiPhone className="mr-2 h-5 w-5 text-primary" />
                  Phone
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
            <div>
              <label htmlFor="address" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                <FiMapPin className="mr-2 h-5 w-5 text-primary" />
                Address
              </label>
              <textarea
                id="address"
                rows={2}
                value={contactInfo.address}
                onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="Enter address"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4">
            <h4 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
              Social Media Links
              <span className="ml-2 h-px flex-1 bg-gray-200 dark:bg-gray-700"></span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="facebook" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiFacebook className="mr-2 h-5 w-5 text-[#1877F2]" />
                  Facebook
                </label>
                <input
                  type="url"
                  id="facebook"
                  value={contactInfo.social_links.facebook || ''}
                  onChange={(e) => setContactInfo({
                    ...contactInfo,
                    social_links: { ...contactInfo.social_links, facebook: e.target.value }
                  })}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter Facebook URL"
                />
              </div>
              <div>
                <label htmlFor="twitter" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiTwitter className="mr-2 h-5 w-5 text-[#1DA1F2]" />
                  Twitter
                </label>
                <input
                  type="url"
                  id="twitter"
                  value={contactInfo.social_links.twitter || ''}
                  onChange={(e) => setContactInfo({
                    ...contactInfo,
                    social_links: { ...contactInfo.social_links, twitter: e.target.value }
                  })}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter Twitter URL"
                />
              </div>
              <div>
                <label htmlFor="instagram" className="flex items-center text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <FiInstagram className="mr-2 h-5 w-5 text-[#E4405F]" />
                  Instagram
                </label>
                <input
                  type="url"
                  id="instagram"
                  value={contactInfo.social_links.instagram || ''}
                  onChange={(e) => setContactInfo({
                    ...contactInfo,
                    social_links: { ...contactInfo.social_links, instagram: e.target.value }
                  })}
                  className="block w-full rounded-xl border-2 border-gray-200 px-4 py-2 focus:border-primary focus:ring focus:ring-primary/20 transition-all duration-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter Instagram URL"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
