// Event types
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string; // ISO date string
  event_time: string; // Time string (HH:MM:SS)
  location: string;
  additional_info: string | null;
  featured_image_url: string | null;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_attendees: number | null;
  current_attendees: number;
  registration_link: string | null;
  organizer_name: string | null;
  organizer_contact: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: 'event' | 'general' | 'promotion' | 'alert';
  event_id: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  display_frequency: 'once' | 'daily' | 'always';
  created_at: string;
  updated_at: string;
}

// Announcement with event details (for joined queries)
export interface AnnouncementWithEvent extends Announcement {
  events?: Event | null;
}

// User announcement view tracking
export interface UserAnnouncementView {
  id: string;
  announcement_id: string;
  user_session_id: string;
  viewed_at: string;
}

// Form types for creating/editing
export interface EventFormData {
  title: string;
  description: string;
  event_date: string;
  event_time: string;
  location: string;
  additional_info?: string;
  featured_image_url?: string;
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  max_attendees?: number;
  current_attendees?: number;
  registration_link?: string;
  organizer_name?: string;
  organizer_contact?: string;
  is_featured: boolean;
}

export interface AnnouncementFormData {
  title: string;
  message: string;
  announcement_type: 'event' | 'general' | 'promotion' | 'alert';
  event_id?: string;
  cta_text?: string;
  cta_link?: string;
  image_url?: string;
  start_date: string;
  end_date: string;
  is_active: boolean;
  priority: number;
  display_frequency: 'once' | 'daily' | 'always';
}

// Filter types
export interface EventFilters {
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  isFeatured?: boolean;
}

// Props types for components
export interface EventsListProps {
  events: Event[];
  initialFilters?: EventFilters;
}

export interface EventCardProps {
  event: Event;
}

export interface EventDetailProps {
  event: Event;
}

export interface AnnouncementPopupProps {
  announcement: Announcement;
  onClose: () => void;
  onDontShowAgain: () => void;
}

export interface AnnouncementManagerProps {
  announcements: Announcement[];
}
