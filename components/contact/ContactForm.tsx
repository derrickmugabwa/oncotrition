'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { FiMail, FiPhone, FiMapPin, FiFacebook, FiTwitter, FiInstagram, FiSend } from 'react-icons/fi';
import { createClient } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import { motion, AnimatePresence } from 'framer-motion';

type ContactInfo = {
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
};

type FormData = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  exit: { opacity: 0, y: -20 }
};

const staggerContainer = {
  initial: { opacity: 1 },
  animate: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

function ContactForm() {
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
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

  async function fetchContactInfo() {
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
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
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
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  return (
    <motion.div 
      variants={fadeInUp}
      initial="initial"
      animate="animate"
      exit="exit"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <motion.div 
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
      >
        {/* Contact Information */}
        <motion.div 
          variants={fadeInUp}
          className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 lg:p-6 transform transition-all duration-300 hover:shadow-xl"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-poppins"
          >
            {contactInfo?.title || 'Get in Touch'}
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-gray-600 dark:text-gray-300 mb-6 text-sm font-poppins"
          >
            {contactInfo?.description || "Have questions? We'll love to hear from you. Send us a message and we'll respond as soon as possible."}
          </motion.p>

          <motion.div variants={staggerContainer} className="space-y-4">
            {contactInfo?.email && (
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <FiMail className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <a href={`mailto:${contactInfo.email}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                    {contactInfo.email}
                  </a>
                </div>
              </motion.div>
            )}

            {contactInfo?.phone && (
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <FiPhone className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Phone</p>
                  <a href={`tel:${contactInfo.phone}`} className="text-sm text-gray-600 dark:text-gray-300 hover:text-primary transition-colors duration-200">
                    {contactInfo.phone}
                  </a>
                </div>
              </motion.div>
            )}

            {contactInfo?.address && (
              <motion.div 
                variants={fadeInUp}
                whileHover={{ scale: 1.02 }}
                className="flex items-start p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 transition-colors duration-200"
              >
                <div className="flex-shrink-0">
                  <FiMapPin className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Address</p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{contactInfo.address}</p>
                </div>
              </motion.div>
            )}
          </motion.div>

          {contactInfo?.social_links && Object.keys(contactInfo.social_links).length > 0 && (
            <motion.div 
              variants={fadeInUp}
              className="mt-6"
            >
              <motion.p variants={fadeInUp} className="text-sm font-medium text-gray-900 dark:text-white mb-4">
                Follow Us
              </motion.p>
              <motion.div variants={staggerContainer} className="flex space-x-4">
                {contactInfo.social_links.facebook && (
                  <motion.a
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    href={contactInfo.social_links.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <FiFacebook className="h-6 w-6" />
                  </motion.a>
                )}
                {contactInfo.social_links.twitter && (
                  <motion.a
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    href={contactInfo.social_links.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <FiTwitter className="h-6 w-6" />
                  </motion.a>
                )}
                {contactInfo.social_links.instagram && (
                  <motion.a
                    variants={fadeInUp}
                    whileHover={{ scale: 1.1 }}
                    href={contactInfo.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-200"
                  >
                    <FiInstagram className="h-6 w-6" />
                  </motion.a>
                )}
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Contact Form */}
        <motion.div 
          variants={fadeInUp}
          className="lg:col-span-7 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-5 lg:p-6 transform transition-all duration-300 hover:shadow-xl"
        >
          <motion.h2 
            variants={fadeInUp}
            className="text-2xl font-bold text-gray-900 dark:text-white mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent font-poppins"
          >
            Send us a Message
          </motion.h2>
          <motion.form 
            variants={staggerContainer}
            onSubmit={handleSubmit} 
            className="space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <label htmlFor="name" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your name"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="email" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder-gray-400"
                placeholder="Enter your email"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="subject" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder-gray-400"
                placeholder="What is this about?"
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <label htmlFor="message" className="block text-base font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={6}
                value={formData.message}
                onChange={handleInputChange}
                className="mt-1 block w-full px-4 py-3 text-base rounded-lg border-2 border-gray-300 shadow-sm focus:border-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-all duration-200 placeholder-gray-400"
                placeholder="Type your message here..."
              />
            </motion.div>

            <motion.div variants={fadeInUp}>
              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex justify-center items-center space-x-3 py-4 px-6 border-2 border-transparent rounded-lg shadow-sm text-base font-medium font-poppins text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
              >
                <span>{loading ? 'Sending...' : 'Send Message'}</span>
                <FiSend className={`h-4 w-4 ${loading ? 'animate-pulse' : 'animate-none'}`} />
              </motion.button>
            </motion.div>
          </motion.form>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

export default ContactForm;