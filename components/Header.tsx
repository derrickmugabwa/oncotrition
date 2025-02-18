'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  open_in_new_tab?: boolean;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchNavItems();
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) {
        console.error('Error fetching navigation items:', error);
        return;
      }
      
      setNavItems(data || []);
    } catch (error) {
      console.error('Error in fetchNavItems:', error);
    }
  };

  const renderNavLink = (item: NavItem, isMobile = false) => {
    if (item.href === '/smartspoon') {
      return (
        <Link
          key={item.id}
          href={item.href}
          target={item.open_in_new_tab ? "_blank" : undefined}
          rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
          className={`relative group ${
            isMobile
              ? 'block w-full text-center'
              : 'inline-flex items-center'
          } px-4 py-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium hover:from-emerald-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 hover:shadow-lg`}
        >
          <span className="relative z-10">
            {item.name}
            <span className="absolute inset-x-0 -bottom-px h-px bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
          </span>
          {!isMobile && (
            <motion.span
              className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              initial={{ x: -10, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
            >
              +
            </motion.span>
          )}
          <motion.div
            className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"
            initial={false}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        </Link>
      );
    }

    return (
      <Link
        key={item.id}
        href={item.href}
        target={item.open_in_new_tab ? "_blank" : undefined}
        rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
        className={`nav-link text-sm font-medium transition-colors duration-200 ${
          isScrolled
            ? 'text-gray-700 hover:text-primary dark:text-gray-200 dark:hover:text-primary'
            : 'text-gray-100 hover:text-white'
        } ${isMobile ? 'block px-3 py-2 rounded-md' : ''}`}
      >
        {item.name}
      </Link>
    );
  };

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
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Logo />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => renderNavLink(item))}
            <ThemeToggle />
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
              <div className="px-2 pt-2 pb-3 space-y-3">
                {navItems.map((item) => renderNavLink(item, true))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
