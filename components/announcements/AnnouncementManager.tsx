'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import AnnouncementPopup from './AnnouncementPopup';
import { Announcement } from '@/types/events';

interface AnnouncementManagerProps {
  announcements: Announcement[];
}

export default function AnnouncementManager({ announcements }: AnnouncementManagerProps) {
  const [currentAnnouncement, setCurrentAnnouncement] = useState<Announcement | null>(null);
  const [announcementQueue, setAnnouncementQueue] = useState<Announcement[]>([]);
  const supabase = createClient();

  // Generate a simple session ID (browser fingerprint)
  const getSessionId = () => {
    let sessionId = localStorage.getItem('oncotrition_session_id');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('oncotrition_session_id', sessionId);
    }
    return sessionId;
  };

  // Check if announcement has been viewed
  const hasViewedAnnouncement = (announcementId: string, frequency: string): boolean => {
    const viewedKey = `announcement_viewed_${announcementId}`;
    const viewedData = localStorage.getItem(viewedKey);

    if (!viewedData) return false;

    if (frequency === 'once') {
      return true; // Already viewed, don't show again
    }

    if (frequency === 'daily') {
      const viewedDate = new Date(viewedData);
      const today = new Date();
      // Check if viewed today
      return viewedDate.toDateString() === today.toDateString();
    }

    // 'always' frequency - never mark as viewed
    return false;
  };

  // Mark announcement as viewed
  const markAsViewed = async (announcementId: string) => {
    const viewedKey = `announcement_viewed_${announcementId}`;
    localStorage.setItem(viewedKey, new Date().toISOString());

    // Track view in database
    const sessionId = getSessionId();
    try {
      await supabase
        .from('user_announcement_views')
        .upsert({
          announcement_id: announcementId,
          user_session_id: sessionId,
        }, {
          onConflict: 'announcement_id,user_session_id'
        });
    } catch (error) {
      console.error('Error tracking announcement view:', error);
    }
  };

  // Mark announcement as permanently dismissed
  const markAsPermanentlyDismissed = (announcementId: string) => {
    const dismissedKey = `announcement_dismissed_${announcementId}`;
    localStorage.setItem(dismissedKey, 'true');
  };

  // Check if announcement is permanently dismissed
  const isPermanentlyDismissed = (announcementId: string): boolean => {
    const dismissedKey = `announcement_dismissed_${announcementId}`;
    return localStorage.getItem(dismissedKey) === 'true';
  };

  // Filter and sort announcements
  useEffect(() => {
    const filteredAnnouncements = announcements
      .filter(announcement => {
        // Check if permanently dismissed
        if (isPermanentlyDismissed(announcement.id)) {
          return false;
        }

        // Check if already viewed based on frequency
        if (hasViewedAnnouncement(announcement.id, announcement.display_frequency ?? 'once')) {
          return false;
        }

        return true;
      })
      .sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0)); // Sort by priority (highest first)

    setAnnouncementQueue(filteredAnnouncements);
  }, [announcements]);

  // Show first announcement after a short delay
  useEffect(() => {
    if (announcementQueue.length > 0 && !currentAnnouncement) {
      const timer = setTimeout(() => {
        setCurrentAnnouncement(announcementQueue[0]);
        // Don't mark as viewed here - only when user closes it
      }, 1500); // Show popup 1.5 seconds after page load

      return () => clearTimeout(timer);
    }
  }, [announcementQueue, currentAnnouncement]);

  const handleClose = () => {
    if (currentAnnouncement) {
      // Mark as viewed when closing (respects display frequency)
      markAsViewed(currentAnnouncement.id);
    }
    setCurrentAnnouncement(null);
    
    // Remove the closed announcement from queue
    setAnnouncementQueue(prev => prev.filter(a => a.id !== currentAnnouncement?.id));
  };

  const handleDontShowAgain = () => {
    if (currentAnnouncement) {
      // Permanently dismiss this announcement
      markAsPermanentlyDismissed(currentAnnouncement.id);
      // Also mark as viewed
      markAsViewed(currentAnnouncement.id);
    }
    setCurrentAnnouncement(null);
    
    // Remove the dismissed announcement from queue
    setAnnouncementQueue(prev => prev.filter(a => a.id !== currentAnnouncement?.id));
  };

  if (!currentAnnouncement) return null;

  return (
    <AnnouncementPopup
      announcement={currentAnnouncement}
      onClose={handleClose}
      onDontShowAgain={handleDontShowAgain}
    />
  );
}
