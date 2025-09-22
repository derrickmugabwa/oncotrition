'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import Logo from './Logo';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useOnClickOutside } from '@/hooks/use-click-outside';
import MegaMenu from './navigation/MegaMenu';
import DropdownMenu from './navigation/DropdownMenu';

interface NavSection {
  id: string;
  nav_item_id: string;
  title: string;
  column_index: number;
  order_index: number;
  url?: string;
}

interface NavItem {
  id: string;
  name: string;
  href: string;
  order: number;
  open_in_new_tab?: boolean;
  type: 'link' | 'dropdown' | 'mega';
  description?: string;
  column_index?: number;
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [navItems, setNavItems] = useState<NavItem[]>([]);
  const [sections, setSections] = useState<NavSection[]>([]);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileItems, setExpandedMobileItems] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const supabase = createClientComponentClient();

  // Global dropdown management functions
  const showDropdown = (itemId: string, delay: number = 0) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (delay > 0) {
      timeoutRef.current = setTimeout(() => {
        setActiveDropdown(itemId);
      }, delay);
    } else {
      setActiveDropdown(itemId);
    }
  };

  const hideDropdown = (delay: number = 300) => {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, delay);
  };

  const cancelHideTimeout = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  const toggleMobileItem = (itemId: string) => {
    setExpandedMobileItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  useOnClickOutside(headerRef, () => setActiveDropdown(null));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    fetchNavItems();
    fetchSections();
  }, []);

  const fetchNavItems = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_items')
        .select('*')
        .order('order', { ascending: true });
      
      if (error) throw error;
      setNavItems(data || []);
    } catch (error) {
      console.error('Error fetching navigation items:', error);
    }
  };

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('navigation_sections')
        .select('*')
        .order('order_index', { ascending: true });
      
      if (error) throw error;
      setSections(data || []);
    } catch (error) {
      console.error('Error fetching navigation sections:', error);
    }
  };

  const renderDropdownMenu = (item: NavItem) => (
    <DropdownMenu
      item={item}
      sections={sections}
      isScrolled={isScrolled}
      activeDropdown={activeDropdown}
      showDropdown={showDropdown}
      hideDropdown={hideDropdown}
      cancelHideTimeout={cancelHideTimeout}
    />
  );

  const renderMegaMenu = (item: NavItem) => (
    <MegaMenu
      item={item}
      sections={sections}
      isScrolled={isScrolled}
      activeDropdown={activeDropdown}
      showDropdown={showDropdown}
      hideDropdown={hideDropdown}
      cancelHideTimeout={cancelHideTimeout}
    />
  );

  const renderNavLink = (item: NavItem) => {
    switch (item.type) {
      case 'dropdown':
        return renderDropdownMenu(item);
      case 'mega':
        return renderMegaMenu(item);
      default:
        return (
          <Link
            key={item.id}
            href={item.href}
            target={item.open_in_new_tab ? "_blank" : undefined}
            rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
            className={`nav-link text-sm font-medium transition-colors duration-200 ${
              isScrolled
                ? 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
                : 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
            }`}
          >
            {item.name}
          </Link>
        );
    }
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
                {navItems.map((item) => {
                  if (item.type === 'dropdown' || item.type === 'mega') {
                    const isExpanded = expandedMobileItems.has(item.id);
                    const itemSections = sections.filter(section => section.nav_item_id === item.id);

                    return (
                      <div key={item.id} className="space-y-1">
                        {/* Main dropdown button */}
                        <button
                          onClick={() => toggleMobileItem(item.id)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                        >
                          <span>{item.name}</span>
                          <svg
                            className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown items */}
                        <AnimatePresence>
                          {isExpanded && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="ml-4 space-y-1"
                            >
                              {/* Overview link */}
                              <Link
                                href={item.href}
                                className="block px-3 py-2 rounded-md text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors duration-200"
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                {item.name} Overview
                              </Link>

                              {/* Section links */}
                              {itemSections
                                .sort((a, b) => a.order_index - b.order_index)
                                .map((section) => (
                                  <Link
                                    key={section.id}
                                    href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                                    className="block px-3 py-2 rounded-md text-sm text-gray-600 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {section.title}
                                  </Link>
                                ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  }

                  // Regular mobile link
                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      target={item.open_in_new_tab ? "_blank" : undefined}
                      rel={item.open_in_new_tab ? "noopener noreferrer" : undefined}
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 dark:text-gray-200 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  );
}
