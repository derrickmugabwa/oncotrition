'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useOnClickOutside } from '@/hooks/use-click-outside';

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
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClientComponentClient();

  useOnClickOutside(dropdownRef, () => setActiveDropdown(null));

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
    <div className="relative group">
      <Link
        href={item.href}
        className={`nav-link text-sm font-medium transition-colors duration-200 ${
          isScrolled
            ? 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
            : 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
        }`}
      >
        {item.name}
      </Link>
      
      <div className="absolute left-0 mt-2 w-48 rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="py-1">
          {sections
            .filter(section => section.nav_item_id === item.id)
            .map(section => (
              <Link
                key={section.id}
                href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {section.title}
              </Link>
            ))}
        </div>
      </div>
    </div>
  );

  const renderMegaMenu = (item: NavItem) => (
    <div className="relative group">
      <Link
        href={item.href}
        className={`nav-link text-sm font-medium transition-colors duration-200 ${
          isScrolled
            ? 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
            : 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
        }`}
      >
        {item.name}
      </Link>
      
      <div className="absolute left-0 mt-2 w-screen max-w-screen-lg -translate-x-1/2 transform px-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5">
          <div className="relative grid grid-cols-2 gap-6 px-6 py-6 sm:gap-8 sm:p-8 lg:grid-cols-4">
            {Array.from(new Set(sections.filter(s => s.nav_item_id === item.id).map(s => s.column_index))).map((columnIndex) => (
              <div key={columnIndex} className="space-y-4">
                {sections
                  .filter(section => section.nav_item_id === item.id && section.column_index === columnIndex)
                  .map(section => (
                    <Link
                      key={section.id}
                      href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      <p className="font-medium text-gray-900 dark:text-gray-100">{section.title}</p>
                      {item.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.description}</p>
                      )}
                    </Link>
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

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

    if (!isMobile) {
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
    }

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
        } ${isMobile ? 'block px-3 py-2 rounded-md' : ''}`}
        onClick={() => isMobile && setIsMobileMenuOpen(false)}
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
