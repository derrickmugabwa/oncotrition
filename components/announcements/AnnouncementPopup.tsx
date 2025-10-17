'use client';

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { X, ExternalLink } from 'lucide-react';
import { Announcement } from '@/types/events';
import { useEffect } from 'react';

interface AnnouncementPopupProps {
  announcement: Announcement;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export default function AnnouncementPopup({ announcement, onClose, onDontShowAgain }: AnnouncementPopupProps) {
  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Prevent body scroll when popup is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'event':
        return 'from-[#009688] to-blue-600';
      case 'promotion':
        return 'from-purple-600 to-pink-600';
      case 'alert':
        return 'from-red-600 to-orange-600';
      default:
        return 'from-gray-600 to-gray-800';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-colors shadow-lg"
            aria-label="Close announcement"
          >
            <X className="w-5 h-5 text-gray-700" />
          </button>

          {/* Image Section */}
          {announcement.image_url && (
            <div className="relative h-48 md:h-56 bg-gradient-to-br from-gray-100 to-gray-200">
              <Image
                src={announcement.image_url}
                alt={announcement.title}
                fill
                className="object-cover"
                priority
              />
              <div className={`absolute inset-0 bg-gradient-to-t ${getTypeColor(announcement.announcement_type)} opacity-20`} />
            </div>
          )}

          {/* Content Section */}
          <div className="p-6">
            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {announcement.title}
            </h2>

            {/* Message */}
            <p className="text-gray-700 text-base mb-5 whitespace-pre-line">
              {announcement.message}
            </p>

            {/* CTA Button */}
            {announcement.cta_text && announcement.cta_link && (
              <div className="mb-5">
                {announcement.cta_link.startsWith('http') ? (
                  <a
                    href={announcement.cta_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${getTypeColor(announcement.announcement_type)} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-base`}
                  >
                    {announcement.cta_text}
                    <ExternalLink className="w-5 h-5" />
                  </a>
                ) : (
                  <Link
                    href={announcement.cta_link}
                    onClick={onClose}
                    className={`inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r ${getTypeColor(announcement.announcement_type)} text-white rounded-lg font-semibold hover:shadow-lg transition-all duration-300 text-base`}
                  >
                    {announcement.cta_text}
                  </Link>
                )}
              </div>
            )}

            {/* Don't Show Again */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <button
                onClick={onDontShowAgain}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Don't show this again
              </button>
              <button
                onClick={onClose}
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors font-medium"
              >
                Maybe later
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
