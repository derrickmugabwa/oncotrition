'use client';

import { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
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

interface DropdownMenuProps {
  item: NavItem;
  sections: NavSection[];
  isScrolled: boolean;
  activeDropdown: string | null;
  showDropdown: (itemId: string, delay?: number) => void;
  hideDropdown: (delay?: number) => void;
  cancelHideTimeout: () => void;
}

export default function DropdownMenu({ item, sections, isScrolled, activeDropdown, showDropdown, hideDropdown, cancelHideTimeout }: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(dropdownRef, () => hideDropdown(0));
  
  const filteredSections = sections
    .filter(section => section.nav_item_id === item.id)
    .sort((a, b) => a.order_index - b.order_index);
  
  const [menuPosition, setMenuPosition] = useState<'left' | 'right'>('left');
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Handle mouse enter - show dropdown with smart timing
  const handleMouseEnter = () => {
    // If another dropdown is already open, switch immediately
    if (activeDropdown && activeDropdown !== item.id) {
      showDropdown(item.id);
    } else if (!activeDropdown) {
      // Add small delay for initial hover to prevent flickering
      showDropdown(item.id, 50);
    }
  };

  // Handle mouse leave - set timeout to close, but allow time for moving to other dropdowns
  const handleMouseLeave = () => {
    hideDropdown(300);
  };

  // Cancel hide timeout when entering dropdown area
  const handleDropdownEnter = () => {
    cancelHideTimeout();
  };


  
  // Determine if menu should be left or right aligned based on button position
  useEffect(() => {
    if (activeDropdown === item.id && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const buttonRightEdge = buttonRect.right;
      const spaceOnRight = windowWidth - buttonRightEdge;
      
      // If there's not enough space on the right (less than 300px), align to the right
      if (spaceOnRight < 300) {
        setMenuPosition('right');
      } else {
        setMenuPosition('left');
      }
    }
  }, [activeDropdown, item.id]);
  
  return (
    <div 
      className="relative" 
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        ref={buttonRef}
        className={`nav-link text-sm font-medium transition-colors duration-200 flex items-center ${
          isScrolled
            ? 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
            : 'text-gray-800 hover:text-emerald-600 dark:text-gray-100 dark:hover:text-emerald-400'
        } ${activeDropdown === item.id ? 'text-emerald-600 dark:text-emerald-400' : ''}`}
      >
        {item.name}
        <svg
          className={`ml-1 h-4 w-4 transition-transform duration-200 ${activeDropdown === item.id ? 'rotate-180' : ''}`}
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      
      <AnimatePresence>
        {activeDropdown === item.id && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className={`absolute z-50 mt-3 w-80 rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 ${
              menuPosition === 'right' ? 'right-0' : 'left-0'
            }`}
            ref={dropdownRef}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="p-2">
              <div className="flex flex-col space-y-1">
                {/* Overview at the top */}
                <Link
                  href={item.href}
                  className="group relative overflow-hidden rounded-xl p-4 bg-gradient-to-r from-emerald-50 to-blue-50 dark:from-emerald-900/20 dark:to-blue-900/20 hover:from-emerald-100 hover:to-blue-100 dark:hover:from-emerald-800/30 dark:hover:to-blue-800/30 transition-all duration-300 border border-emerald-200/50 dark:border-emerald-700/50"
                  onClick={() => hideDropdown(0)}
                >
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-emerald-700 dark:text-emerald-300 mb-1 group-hover:text-emerald-800 dark:group-hover:text-emerald-200 transition-colors">
                          {item.name}
                        </span>
                        <span className="text-sm text-emerald-600/80 dark:text-emerald-400/80 font-medium">
                          Overview & Main Page
                        </span>
                      </div>
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-800/50 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-700/50 transition-colors">
                        <svg className="w-4 h-4 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 to-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
                
                {/* Section links below */}
                {filteredSections.length > 0 && (
                  <div className="pt-2">
                    <div className="px-3 py-2">
                      <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        Quick Links
                      </span>
                    </div>
                    <div className="space-y-1">
                      {filteredSections.map(section => (
                        <Link
                          key={section.id}
                          href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                          className="group flex items-center justify-between px-4 py-3 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-xl transition-all duration-200 hover:translate-x-1"
                          onClick={() => hideDropdown(0)}
                        >
                          <span className="font-medium">{section.title}</span>
                          <svg className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-200 transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
