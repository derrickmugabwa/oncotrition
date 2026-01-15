// Event types
export interface Event {
  id: string;
  title: string;
  description: string | null;
  event_date: string; // ISO date string
  event_time: string | null; // Time string (HH:MM:SS)
  location: string | null;
  additional_info: string | null;
  featured_image_url: string | null;
  status: string | null;
  max_attendees: number | null;
  current_attendees: number | null;
  registration_link: string | null;
  organizer_name: string | null;
  organizer_contact: string | null;
  is_featured: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  
  // Registration system fields (NEW)
  has_internal_registration: boolean | null;
  registration_type: string | null;
  registration_deadline: string | null;
  early_bird_deadline: string | null;
  early_bird_discount: number | null;
  terms_and_conditions: string | null;
  requires_payment: boolean | null;
  venue_details: string | null;
}

// Announcement types
export interface Announcement {
  id: string;
  title: string;
  message: string;
  announcement_type: string | null;
  event_id: string | null;
  cta_text: string | null;
  cta_link: string | null;
  image_url: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean | null;
  priority: number | null;
  display_frequency: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  // Registration system fields
  has_internal_registration?: boolean;
  registration_type?: string;
  registration_deadline?: string;
  early_bird_deadline?: string;
  early_bird_discount?: number;
  terms_and_conditions?: string;
  requires_payment?: boolean;
  venue_details?: string;
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
