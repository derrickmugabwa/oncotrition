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

interface MegaMenuProps {
  item: NavItem;
  sections: NavSection[];
  isScrolled: boolean;
  activeDropdown: string | null;
  showDropdown: (itemId: string, delay?: number) => void;
  hideDropdown: (delay?: number) => void;
  cancelHideTimeout: () => void;
}

export default function MegaMenu({ item, sections, isScrolled, activeDropdown, showDropdown, hideDropdown, cancelHideTimeout }: MegaMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [menuPosition, setMenuPosition] = useState<'center' | 'left' | 'right'>('center');
  
  useOnClickOutside(dropdownRef as any, () => hideDropdown(0));

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
  
  // Determine if menu should be left, right, or center aligned based on button position
  useEffect(() => {
    if (activeDropdown === item.id && buttonRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
      const windowWidth = window.innerWidth;
      const buttonCenter = buttonRect.left + (buttonRect.width / 2);
      
      // Calculate space on left and right sides
      const spaceOnLeft = buttonCenter;
      const spaceOnRight = windowWidth - buttonCenter;
      const menuWidth = 1000; // max width of the menu
      
      // Determine the best position based on available space
      if (spaceOnLeft < menuWidth/2 && spaceOnRight < menuWidth/2) {
        // Not enough space on either side for center alignment
        if (spaceOnLeft > spaceOnRight) {
          setMenuPosition('left');
        } else {
          setMenuPosition('right');
        }
      } else if (spaceOnLeft < menuWidth/2) {
        // Not enough space on the left
        setMenuPosition('left');
      } else if (spaceOnRight < menuWidth/2) {
        // Not enough space on the right
        setMenuPosition('right');
      } else {
        // Enough space on both sides
        setMenuPosition('center');
      }
    }
  }, [activeDropdown, item.id]);
  
  // Determine the style for the menu based on position
  const getMenuStyle = () => {
    switch (menuPosition) {
      case 'left':
        return { left: '0', transform: 'none' };
      case 'right':
        return { right: '0', transform: 'none' };
      case 'center':
      default:
        return { left: '50%', transform: 'translateX(-50%)' };
    }
  };
  
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
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 mt-2 w-screen max-w-screen-lg px-4"
            style={{ maxWidth: '1000px', ...getMenuStyle() }}
            ref={dropdownRef}
            onMouseEnter={handleDropdownEnter}
            onMouseLeave={handleMouseLeave}
          >
            <div className="overflow-hidden rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5">
              {/* Parent navigation link at the top */}
              <div className="px-6 py-3 border-b border-gray-100 dark:border-gray-700">
                <Link
                  href={item.href}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center"
                  onClick={() => hideDropdown(0)}
                >
                  {item.name} Overview
                </Link>
              </div>
              
              <div className="relative grid grid-cols-2 gap-6 px-6 py-6 sm:gap-8 sm:p-8 lg:grid-cols-4">
                {Array.from(new Set(sections.filter(s => s.nav_item_id === item.id).map(s => s.column_index))).map((columnIndex) => {
                  const columnSections = sections
                    .filter(section => section.nav_item_id === item.id && section.column_index === columnIndex)
                    .sort((a, b) => a.order_index - b.order_index);
                  
                  return (
                    <div key={columnIndex} className="space-y-5">
                      {/* Column header - first item in bold */}
                      {columnSections.length > 0 && (
                        <div className="mb-3">
                          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-4">
                            {columnSections[0].title}
                          </h3>
                          {/* Rest of the items in the column */}
                          {columnSections.slice(1).map(section => (
                            <Link
                              key={section.id}
                              href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                              className="block py-2 text-sm text-gray-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                              onClick={() => hideDropdown(0)}
                            >
                              {section.title}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Footer with subtle background */}
              <div className="bg-gray-50 dark:bg-gray-700/50 px-6 py-3 flex justify-between items-center">
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.description || `Explore ${item.name} options`}</p>
                <Link
                  href={item.href}
                  className="text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 flex items-center"
                  onClick={() => hideDropdown(0)}
                >
                  View all
                  <svg className="ml-1 h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
