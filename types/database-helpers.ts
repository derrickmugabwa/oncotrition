/**
 * Database Type Helpers
 * 
 * Use these helpers to get properly typed database rows, inserts, and updates
 * instead of creating custom interfaces that drift from the database schema.
 */

import { Database } from '@/lib/database.types';

// Helper types for table operations
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];

// Commonly used table types (for convenience)
export type Event = Tables<'events'>;
export type BlogPost = Tables<'blog_posts'>;
export type BlogCategory = Tables<'blog_categories'>;
export type BlogAuthor = Tables<'blog_authors'>;
export type BlogTag = Tables<'blog_tags'>;
export type Announcement = Tables<'announcements'>;
export type NavItem = Tables<'navigation_items'>;
export type NavSection = Tables<'navigation_sections'>;
export type TeamMember = Tables<'team_members'>;
export type Module = Tables<'modules'>;
export type NutrivibeRegistration = Tables<'nutrivibe_registrations'>;
export type NutrivibePricing = Tables<'nutrivibe_pricing'>;
export type NutrivibeInterestArea = Tables<'nutrivibe_interest_areas'>;
export type MentorshipEvent = Tables<'mentorship_events'>;
export type EventBooking = Tables<'event_bookings'>;

// JSON field helpers - cast Json to specific types
export type JsonArray = any[];
export type JsonObject = { [key: string]: any };
