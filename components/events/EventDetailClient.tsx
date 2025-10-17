'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Share2, Calendar as CalendarIcon, Link as LinkIcon, Facebook, Twitter, Linkedin, Check } from 'lucide-react';
import { Event } from '@/types/events';

interface EventDetailClientProps {
  event: Event;
}

export default function EventDetailClient({ event }: EventDetailClientProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);

  const eventUrl = typeof window !== 'undefined' ? window.location.href : '';

  // Generate iCal file content
  const generateICalFile = () => {
    const eventDate = new Date(event.event_date);
    const eventTime = event.event_time.split(':');
    const startDateTime = new Date(eventDate);
    startDateTime.setHours(parseInt(eventTime[0]), parseInt(eventTime[1]), 0);
    
    // Assume 2 hour duration
    const endDateTime = new Date(startDateTime);
    endDateTime.setHours(startDateTime.getHours() + 2);

    const formatDate = (date: Date) => {
      return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    };

    const icalContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Oncotrition//Events//EN',
      'BEGIN:VEVENT',
      `UID:${event.id}@oncotrition.com`,
      `DTSTAMP:${formatDate(new Date())}`,
      `DTSTART:${formatDate(startDateTime)}`,
      `DTEND:${formatDate(endDateTime)}`,
      `SUMMARY:${event.title}`,
      `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
      `LOCATION:${event.location}`,
      'STATUS:CONFIRMED',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    return icalContent;
  };

  const handleAddToCalendar = () => {
    const icalContent = generateICalFile();
    const blob = new Blob([icalContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${event.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(eventUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(eventUrl)}&text=${encodeURIComponent(event.title)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(eventUrl)}`
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 pb-12">
      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-wrap gap-4 justify-center"
      >
        {/* Add to Calendar Button */}
        <button
          onClick={handleAddToCalendar}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-[#009688] text-[#009688] rounded-lg font-semibold hover:bg-[#009688] hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
        >
          <CalendarIcon className="w-5 h-5" />
          Add to Calendar
        </button>

        {/* Share Button */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-md hover:shadow-lg"
          >
            <Share2 className="w-5 h-5" />
            Share Event
          </button>

          {/* Share Menu */}
          {showShareMenu && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 right-0 bg-white rounded-lg shadow-xl border border-gray-200 p-4 min-w-[200px] z-10"
            >
              <div className="space-y-2">
                {/* Copy Link */}
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors text-left"
                >
                  {copied ? (
                    <>
                      <Check className="w-5 h-5 text-green-600" />
                      <span className="text-green-600 font-medium">Copied!</span>
                    </>
                  ) : (
                    <>
                      <LinkIcon className="w-5 h-5 text-gray-600" />
                      <span className="text-gray-700">Copy Link</span>
                    </>
                  )}
                </button>

                {/* Facebook */}
                <a
                  href={shareLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5 text-blue-600" />
                  <span className="text-gray-700">Facebook</span>
                </a>

                {/* Twitter */}
                <a
                  href={shareLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Twitter className="w-5 h-5 text-sky-500" />
                  <span className="text-gray-700">Twitter</span>
                </a>

                {/* LinkedIn */}
                <a
                  href={shareLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Linkedin className="w-5 h-5 text-blue-700" />
                  <span className="text-gray-700">LinkedIn</span>
                </a>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
