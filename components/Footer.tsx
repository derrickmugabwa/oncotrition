'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import Image from 'next/image';

interface FooterSettings {
  social_links: {
    facebook: string;
    twitter: string;
    instagram: string;
    linkedin: string;
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
  promo_images: Array<{
    image_url: string;
    link_url: string;
  }>;
  promo_title: string;
}

const defaultSettings: FooterSettings = {
  social_links: {
    facebook: 'https://www.facebook.com/profile.php?id=61564768904026',
    twitter: '',
    instagram: 'https://www.instagram.com/smart.spoon.plus/',
    linkedin: ''
  },
  contact_info: {
    email: 'info@oncotrition.com',
    phone: '0714034902',
    address: ''
  },
  quick_links: [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/contact' }
  ],
  legal_links: {
    privacy_policy: '/privacy',
    terms_of_service: '/terms',
    cookie_policy: '/cookies'
  },
  newsletter: {
    enabled: true,
    description: 'Subscribe to our newsletter for tips and updates.'
  },
  brand: {
    description: 'Empowering your journey to better health through personalized nutrition guidance.'
  },
  copyright_text: ` ${new Date().getFullYear()} Oncotrition. All rights reserved.`,
  promo_images: [],
  promo_title: 'Featured Content'
};

const Footer = () => {
  const [settings, setSettings] = useState<FooterSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase
          .from('footer_settings')
          .select('*')
          .eq('id', 1)
          .single();

        if (error) {
          console.error('Error fetching footer settings:', error);
          return;
        }

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
            promo_images: data.promo_images || defaultSettings.promo_images,
            promo_title: data.promo_title || defaultSettings.promo_title
          });
        }
      } catch (error) {
        console.error('Error fetching footer settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [supabase]);

  const socialIcons = {
    facebook: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
      </svg>
    ),
    twitter: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
      </svg>
    ),
    instagram: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
      </svg>
    ),
    linkedin: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
      </svg>
    ),
  };

  const contactIcons = {
    email: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    phone: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    address: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  };

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-gray-300">
      <div className="container mx-auto px-6 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Oncotrition
            </h3>
            <p className="text-gray-400">
              {settings.brand.description}
            </p>
            <div className="flex space-x-4">
              {Object.entries(settings.social_links).map(([platform, url]) =>
                url ? (
                  <a
                    key={platform}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    {socialIcons[platform as keyof typeof socialIcons]}
                  </a>
                ) : null
              )}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              {settings.quick_links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-400 hover:text-primary transition-colors duration-300"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Contact Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <h4 className="text-lg font-semibold mb-6 text-white">Contact</h4>
            <ul className="space-y-3">
              {Object.entries(settings.contact_info).map(([key, value]) => 
                value ? (
                  <li key={key} className="flex items-start space-x-3 text-gray-400">
                    <span className="mt-1">{contactIcons[key as keyof typeof contactIcons]}</span>
                    <span>{value}</span>
                  </li>
                ) : null
              )}
            </ul>
          </motion.div>

          {/* Promotional Images Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            viewport={{ once: true }}
            className="space-y-6"
          >
            {settings.promo_images.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">{settings.promo_title}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                  {settings.promo_images.map((promo, index) => (
                    <motion.a
                      key={index}
                      href={promo.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block relative w-full h-40 sm:h-32 md:h-36 rounded-lg overflow-hidden bg-gray-800/50 backdrop-blur-sm"
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <Image
                        src={promo.image_url}
                        alt="Promotional content"
                        fill
                        className="object-contain p-2"
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
                    </motion.a>
                  ))}
                </div>
              </div>
            )}

            {settings.newsletter.enabled && (
              <div>
                <h4 className="text-lg font-semibold mb-6 text-white">Newsletter</h4>
                <p className="text-gray-400 mb-4">
                  {settings.newsletter.description}
                </p>
                <form className="space-y-3">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-gray-300 focus:outline-none focus:border-primary transition-colors duration-300"
                  />
                  <button
                    type="submit"
                    className="w-full px-4 py-2 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors duration-300"
                  >
                    Subscribe
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-800 my-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 text-sm text-gray-400">
          <p>{settings.copyright_text}</p>
          <div className="flex space-x-6">
            {settings.legal_links.privacy_policy && (
              <Link href={settings.legal_links.privacy_policy} className="hover:text-primary transition-colors duration-300">
                Privacy Policy
              </Link>
            )}
            {settings.legal_links.terms_of_service && (
              <Link href={settings.legal_links.terms_of_service} className="hover:text-primary transition-colors duration-300">
                Terms of Service
              </Link>
            )}
            {settings.legal_links.cookie_policy && (
              <Link href={settings.legal_links.cookie_policy} className="hover:text-primary transition-colors duration-300">
                Cookie Policy
              </Link>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
