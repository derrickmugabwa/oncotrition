'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [settings, setSettings] = useState<{
    logo_url: string | null;
    show_site_name: boolean;
  }>({
    logo_url: null,
    show_site_name: true
  });
  const supabase = createClientComponentClient();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Get the most recent settings
        const { data: allSettings, error } = await supabase
          .from('site_settings')
          .select('logo_url, show_site_name')
          .order('created_at', { ascending: false })
          .limit(1);

        if (error) throw error;

        const settings = allSettings?.[0];
        console.log('Fetched site settings:', settings);
        
        if (settings) {
          // Preload logo if it exists
          if (settings.logo_url) {
            const preloadLink = document.createElement('link');
            preloadLink.rel = 'preload';
            preloadLink.as = 'image';
            preloadLink.href = settings.logo_url;
            preloadLink.crossOrigin = 'anonymous';
            document.head.appendChild(preloadLink);
          }
          setSettings(settings);
        } else {
          // Use default settings if none found
          setSettings({
            logo_url: null,
            show_site_name: true
          });
        }
      } catch (error: any) {
        console.error('Error fetching site settings:', error.message);
        // Handle the error gracefully - show default logo/name
        setSettings({
          logo_url: null,
          show_site_name: true
        });
      }
    };

    fetchSettings();
  }, [supabase]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/about' },
    { name: 'Features', href: '/features' },
    { name: 'Mentorship', href: '/mentorship' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <motion.header
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white dark:bg-gray-900/95 backdrop-blur-md shadow-lg'
          : 'bg-white dark:bg-gray-900/90'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3">
            {settings.logo_url ? (
              <div className="relative w-16 h-16 sm:w-32 sm:h-32">
                <Image
                  src={settings.logo_url}
                  alt="Site Logo"
                  fill
                  className="object-contain"
                  sizes="(max-width: 640px) 64px, 128px"
                  priority
                />
              </div>
            ) : null}
            {/* {settings.show_site_name && (
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Oncotrition<span className="text-blue-500"></span>
              </span>
            )} */}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link text-sm font-medium transition-colors duration-200 ${
                  isScrolled
                    ? 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                    : 'text-gray-700 hover:text-primary dark:text-gray-200'
                }`}
              >
                {item.name}
              </Link>
            ))}
            <ThemeToggle />
            <Link
              href="/smartspoon"
              className="btn btn-primary"
            >
              Smartspoon+
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center space-x-6 md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={`p-2 rounded-md ${
                isScrolled
                  ? 'text-gray-700 dark:text-gray-200'
                  : 'text-gray-700 dark:text-gray-200'
              }`}
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}></path>
              </svg>
            </button>
            <ThemeToggle />
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden"
            >
              <div className="px-2 pt-2 pb-3 space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`block px-3 py-2 rounded-md text-base font-medium ${
                      isScrolled
                        ? 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                        : 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <Link
                  href="/smartspoon"
                  className="block w-full btn btn-primary mt-4 text-center"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Smartspoon+
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
