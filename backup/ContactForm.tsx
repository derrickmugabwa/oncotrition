import type { FC } from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram } from 'react-icons/fi';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { Database } from '@/types/supabase';

interface ContactInfo {
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

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const ContactForm: FC = () => {
  const supabase = createClientComponentClient<Database>();
  const [loading, setLoading] = useState<boolean>(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .single();

      if (error) throw error;
      setContactInfo(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const { error } = await supabase
        .from('form_submissions')
        .insert([formData]);

      if (error) throw error;

      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success('Message sent successfully! We will get back to you soon.');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Contact Information */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            {contactInfo?.title || 'Get in Touch'}
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8">
            {contactInfo?.description || 'Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.'}
          </p>

          <div className="space-y-6">
            {contactInfo?.email && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiMail className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                    {contactInfo.email}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.phone && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiPhone className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary">
                    {contactInfo.phone}
                  </a>
                </div>
              </div>
            )}

            {contactInfo?.address && (
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <FiMapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {contactInfo.address}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Social Links */}
          {contactInfo?.social_links && Object.keys(contactInfo.social_links).length > 0 && (
            <div className="mt-8">
              <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">Follow Us</p>
              <div className="flex space-x-4">
                {contactInfo.social_links.facebook && (
                  <a
                    href={contactInfo.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary"
                  >
                    <FiFacebook className="h-6 w-6" />
                  </a>
                )}
                {contactInfo.social_links.twitter && (
                  <a
                    href={contactInfo.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary"
                  >
                    <FiTwitter className="h-6 w-6" />
                  </a>
                )}
                {contactInfo.social_links.instagram && (
                  <a
                    href={contactInfo.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary"
                  >
                    <FiInstagram className="h-6 w-6" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 lg:p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Send us a Message</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Name
              </label>
              <input
                type="text"
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email
              </label>
              <input
                type="email"
                id="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="subject" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Message
              </label>
              <textarea
                id="message"
                required
                rows={4}
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactForm;
