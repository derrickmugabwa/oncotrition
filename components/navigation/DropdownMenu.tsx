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
  setActiveDropdown: (id: string | null) => void;
}

export default function DropdownMenu({ item, sections, isScrolled, activeDropdown, setActiveDropdown }: DropdownMenuProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  useOnClickOutside(dropdownRef, () => setActiveDropdown(null));
  
  const filteredSections = sections
    .filter(section => section.nav_item_id === item.id)
    .sort((a, b) => a.order_index - b.order_index);
  
  const [menuPosition, setMenuPosition] = useState<'left' | 'right'>('left');
  const buttonRef = useRef<HTMLButtonElement>(null);
  
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
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={(e) => {
          e.preventDefault();
          setActiveDropdown(activeDropdown === item.id ? null : item.id);
        }}
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
            className={`absolute z-50 mt-2 w-96 rounded-xl bg-white dark:bg-gray-800 shadow-xl ring-1 ring-black ring-opacity-5 ${
              menuPosition === 'right' ? 'right-0' : 'left-0'
            }`}
            ref={dropdownRef}
          >
            <div className="p-4">
              <div className="flex flex-row gap-6">
                {/* Left column - Overview */}
                <div className="w-1/2 border-r border-gray-100 dark:border-gray-700 pr-6">
                  <Link
                    href={item.href}
                    className="block py-3 px-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-700 dark:hover:text-emerald-300 rounded-lg transition-colors"
                    onClick={() => setActiveDropdown(null)}
                  >
                    <div className="flex flex-col">
                      <span className="text-base font-semibold mb-1">{item.name}</span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Overview</span>
                    </div>
                  </Link>
                </div>
                
                {/* Right column - Section links */}
                <div className="w-1/2 grid grid-cols-1 gap-1">
                  {filteredSections.map(section => (
                    <Link
                      key={section.id}
                      href={section.url || `${item.href}#${section.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      {section.title}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
