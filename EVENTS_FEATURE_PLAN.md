# Events Page & Announcement Popup - Implementation Plan

## Overview
Create a dedicated Events page to display upcoming nutrition events and workshops, with an announcement popup system for promoting events and other important notifications.

---

## 1. Database Schema

### 1.1 Events Table (`events`)
```sql
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  additional_info TEXT,
  featured_image_url TEXT,
  status TEXT DEFAULT 'upcoming' CHECK (status IN ('upcoming', 'ongoing', 'completed', 'cancelled')),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  registration_link TEXT,
  organizer_name TEXT,
  organizer_contact TEXT,
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_date ON events(event_date);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_featured ON events(is_featured);
```

### 1.2 Announcements Table (`announcements`)
```sql
CREATE TABLE announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  announcement_type TEXT DEFAULT 'event' CHECK (announcement_type IN ('event', 'general', 'promotion', 'alert')),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  cta_text TEXT, -- Call to action button text (e.g., "Learn More", "Register Now")
  cta_link TEXT, -- Link for the CTA button
  image_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 1, -- Higher number = higher priority
  display_frequency TEXT DEFAULT 'once' CHECK (display_frequency IN ('once', 'daily', 'always')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_announcements_active ON announcements(is_active);
CREATE INDEX idx_announcements_dates ON announcements(start_date, end_date);
CREATE INDEX idx_announcements_priority ON announcements(priority);
```

### 1.3 User Announcement Views Table (`user_announcement_views`)
```sql
CREATE TABLE user_announcement_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  user_session_id TEXT NOT NULL, -- Browser fingerprint or session ID
  viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, user_session_id)
);

CREATE INDEX idx_user_views_session ON user_announcement_views(user_session_id);
```

---

## 2. Frontend Components

### 2.1 Events Page Components (Server Components)

#### **Main Page: `/app/(site)/events/page.tsx`** ⚡ SERVER COMPONENT
- Async server component with SSR
- Fetch events from database server-side using public Supabase client
- Pre-filter upcoming, ongoing, and past events
- Generate SEO metadata server-side
- Pass data to client components as props
- Zero client-side loading delay

#### **EventsList Component: `/components/events/EventsList.tsx`** 🎨 CLIENT COMPONENT
- Receives events data as props (no fetching)
- Interactive filter by status (upcoming, ongoing, past)
- Client-side search functionality
- Client-side sort by date
- Smooth animations with framer-motion

#### **EventCard Component: `/components/events/EventCard.tsx`** ⚡ SERVER COMPONENT
- Stateless display component
- Event thumbnail with Next.js Image optimization
- Title, date, time, location
- Brief description
- Link to event detail page
- Featured badge for featured events
- Attendee count display

#### **EventDetail Component: `/components/events/EventDetail.tsx`** ⚡ SERVER COMPONENT
- Server-fetched full event information
- Static content rendering
- Registration button/link
- Organizer information
- Map/location details
- Client wrapper for interactive features

#### **EventDetailClient Component: `/components/events/EventDetailClient.tsx`** 🎨 CLIENT COMPONENT
- Share functionality (client-side APIs)
- Add to calendar button (downloads iCal file)
- Interactive map
- Copy link functionality

#### **EventFilters Component: `/components/events/EventFilters.tsx`** 🎨 CLIENT COMPONENT
- Interactive filter controls
- Client-side state management
- URL query params for shareable filters
- Real-time filtering without page reload

### 2.2 Announcement Popup Components (Client Components)

#### **AnnouncementPopup Component: `/components/announcements/AnnouncementPopup.tsx`** 🎨 CLIENT COMPONENT
- Modal overlay with backdrop
- Responsive design (mobile/desktop)
- Close button with state management
- CTA button with click tracking
- Next.js Image for optimized display
- Animation (fade in/slide up) with framer-motion
- Auto-close option with timer
- "Don't show again" checkbox (localStorage)
- Keyboard accessibility (ESC to close)

#### **AnnouncementManager Component: `/components/announcements/AnnouncementManager.tsx`** 🎨 CLIENT COMPONENT
- Receives server-fetched announcements as props
- Client-side logic for popup display timing
- Check if announcement already viewed (localStorage)
- Respect display frequency settings
- Priority-based display (show highest priority first)
- Session tracking with browser fingerprinting
- Queue management for multiple announcements

### 2.3 Admin Components (Client Components)

#### **EventsTab Component: `/components/admin/events/EventsTab.tsx`** 🎨 CLIENT COMPONENT
- Client-side CRUD operations for events
- Real-time event list with status indicators
- Quick edit functionality with inline forms
- Bulk actions (delete, change status)
- Image upload to Supabase Storage
- Toast notifications for feedback
- Loading states during operations

#### **EventEditor Component: `/components/admin/events/EventEditor.tsx`** 🎨 CLIENT COMPONENT
- Interactive form for creating/editing events
- Date and time pickers (client-side widgets)
- Rich text editor for description
- Image uploader with preview
- Registration link input with validation
- Attendee management interface
- Auto-save functionality

#### **AnnouncementsTab Component: `/components/admin/announcements/AnnouncementsTab.tsx`** 🎨 CLIENT COMPONENT
- Client-side CRUD operations for announcements
- Preview popup functionality (live preview)
- Active/inactive toggle with instant feedback
- Date range selector
- Priority management with drag-and-drop
- Analytics display (views, clicks)

#### **AnnouncementEditor Component: `/components/admin/announcements/AnnouncementEditor.tsx`** 🎨 CLIENT COMPONENT
- Interactive form for creating/editing announcements
- Link to events (searchable dropdown)
- Image uploader with crop functionality
- CTA customization (text, link, style)
- Display frequency settings
- Date range picker with presets
- Live preview panel

---

## 3. Server-Side Data Fetching & API Routes

### 3.1 Server Component Data Fetching (Preferred)

#### **Events Page Server Fetch**
```typescript
// app/(site)/events/page.tsx
import { createClient } from '@supabase/supabase-js';

export default async function EventsPage() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  
  // Fetch events server-side
  const { data: events } = await supabase
    .from('events')
    .select('*')
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true });
  
  return <EventsList events={events || []} />;
}
```

#### **Event Detail Page Server Fetch**
```typescript
// app/(site)/events/[id]/page.tsx
export default async function EventDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient(...);
  
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single();
  
  return <EventDetail event={event} />;
}
```

#### **Root Layout Announcement Fetch**
```typescript
// app/layout.tsx
export default async function RootLayout({ children }) {
  const supabase = createClient(...);
  
  const { data: announcements } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_active', true)
    .gte('end_date', new Date().toISOString())
    .lte('start_date', new Date().toISOString())
    .order('priority', { ascending: false });
  
  return (
    <html>
      <body>
        {children}
        <AnnouncementManager announcements={announcements || []} />
      </body>
    </html>
  );
}
```

### 3.2 API Routes (For Admin Operations Only)

#### **POST `/api/admin/events`** 🔒 ADMIN ONLY
- Create new event
- Requires authentication
- Validates input data
- Returns created event

#### **PUT `/api/admin/events/[id]`** 🔒 ADMIN ONLY
- Update existing event
- Requires authentication
- Validates input data
- Returns updated event

#### **DELETE `/api/admin/events/[id]`** 🔒 ADMIN ONLY
- Delete event
- Requires authentication
- Cascades to related announcements

#### **POST `/api/admin/announcements`** 🔒 ADMIN ONLY
- Create new announcement
- Requires authentication
- Validates date ranges
- Returns created announcement

#### **PUT `/api/admin/announcements/[id]`** 🔒 ADMIN ONLY
- Update announcement
- Requires authentication
- Validates input data

#### **DELETE `/api/admin/announcements/[id]`** 🔒 ADMIN ONLY
- Delete announcement
- Requires authentication

#### **POST `/api/announcements/view`** 📊 PUBLIC
- Track announcement view
- Store session ID and announcement ID
- No authentication required
- Rate limited

---

## 4. Features & Functionality

### 4.1 Events Page Features
- ✅ Display upcoming events in card grid
- ✅ Featured events section at top
- ✅ Filter by date, status, keyword
- ✅ Individual event detail pages
- ✅ Registration links/buttons
- ✅ Add to calendar functionality (iCal format)
- ✅ Social sharing (Facebook, Twitter, LinkedIn)
- ✅ Responsive design (mobile-first)
- ✅ Loading states and error handling
- ✅ Empty state when no events

### 4.2 Announcement Popup Features
- ✅ Auto-display on page load (configurable)
- ✅ Display frequency control (once, daily, always)
- ✅ Priority-based display
- ✅ Session tracking (localStorage)
- ✅ "Don't show again" option
- ✅ Countdown timer for urgent announcements
- ✅ Multiple announcement queue
- ✅ Responsive design
- ✅ Smooth animations
- ✅ Accessibility (keyboard navigation, ARIA labels)

### 4.3 Admin Features
- ✅ Full CRUD for events and announcements
- ✅ Image upload to Supabase Storage
- ✅ Preview functionality
- ✅ Bulk operations
- ✅ Analytics (views, clicks)
- ✅ Schedule announcements
- ✅ Duplicate events/announcements
- ✅ Event status management

---

## 5. Implementation Steps

### Phase 1: Database Setup (Day 1)
1. Create migration file for events table
2. Create migration file for announcements table
3. Create migration file for user_announcement_views table
4. Set up Row Level Security (RLS) policies
5. Add database types to TypeScript definitions

### Phase 2: Events Page (Day 2-3)
1. Create events page route as async server component
2. Implement server-side data fetching with public Supabase client
3. Build EventsList client component (receives props)
4. Build EventCard server component (stateless display)
5. Build EventFilters client component (interactive)
6. Add server-side SEO metadata generation
7. Create event detail page as server component
8. Build EventDetailClient wrapper for interactive features
9. Test SSR performance and loading times

### Phase 3: Announcement Popup (Day 4)
1. Add server-side announcement fetch to root layout
2. Build AnnouncementPopup client component
3. Build AnnouncementManager client component (receives server props)
4. Implement session tracking logic with localStorage
5. Test display frequency logic (once, daily, always)
6. Add animations and transitions with framer-motion
7. Implement priority queue system
8. Test with multiple announcements

### Phase 4: Admin Interface (Day 5-6)
1. Create EventsTab component
2. Create EventEditor component
3. Create AnnouncementsTab component
4. Create AnnouncementEditor component
5. Implement image upload functionality
6. Add to admin dashboard navigation

### Phase 5: API Routes (Day 7)
1. Create events API routes
2. Create announcements API routes
3. Add authentication middleware
4. Implement error handling
5. Add rate limiting

### Phase 6: Testing & Polish (Day 8)
1. Test all CRUD operations
2. Test popup display logic
3. Test responsive design
4. Accessibility audit
5. Performance optimization
6. Add loading states
7. Error handling

---

## 6. Technical Considerations

### 6.1 Performance
- ⚡ **Server Components**: Events page, event cards, event details all server-rendered
- ⚡ **Zero Client-Side Fetching**: All data fetched server-side, passed as props
- ⚡ **Static Generation**: Events pages can be statically generated at build time
- 🖼️ **Image Optimization**: Next.js Image component with priority loading
- 📦 **Reduced Bundle Size**: Server components don't ship JavaScript to client
- 🎯 **Selective Hydration**: Only interactive components use client-side JavaScript
- 💾 **Caching Strategy**: Server-side caching for announcements
- 🔄 **Incremental Static Regeneration**: Update events without full rebuild

### 6.2 SEO
- Dynamic metadata for event pages
- Structured data (JSON-LD) for events
- Open Graph tags for social sharing
- Sitemap inclusion

### 6.3 Accessibility
- Keyboard navigation for popup
- ARIA labels and roles
- Focus management
- Screen reader support
- Color contrast compliance

### 6.4 Security
- RLS policies for database
- Admin-only routes protection
- Input validation and sanitization
- XSS prevention
- CSRF protection

### 6.5 User Experience
- Smooth animations
- Loading states
- Error messages
- Empty states
- Mobile-first design
- Touch-friendly buttons

---

## 7. Future Enhancements

### 7.1 Advanced Features
- Event registration system (collect attendee info)
- Email notifications for upcoming events
- Calendar integration (Google Calendar, Outlook)
- Event reminders
- Waitlist functionality
- Ticket sales integration
- Virtual event support (Zoom links)
- Event categories/tags
- Multi-day events support

### 7.2 Analytics
- Track announcement views and clicks
- Event page analytics
- Registration conversion tracking
- Popular events dashboard
- User engagement metrics

### 7.3 Social Features
- Event comments/discussions
- Attendee list (public/private)
- Event ratings/reviews
- Social media integration
- Event sharing incentives

---

## 8. File Structure

```
oncotrition/
├── app/
│   ├── (site)/
│   │   └── events/
│   │       ├── page.tsx                    # Main events page
│   │       └── [id]/
│   │           └── page.tsx                # Individual event page
│   └── api/
│       ├── events/
│       │   ├── route.ts                    # GET all events
│       │   └── [id]/
│       │       └── route.ts                # GET single event
│       ├── announcements/
│       │   ├── active/
│       │   │   └── route.ts                # GET active announcements
│       │   └── view/
│       │       └── route.ts                # POST track view
│       └── admin/
│           ├── events/
│           │   ├── route.ts                # POST create event
│           │   └── [id]/
│           │       └── route.ts            # PUT/DELETE event
│           └── announcements/
│               ├── route.ts                # POST create announcement
│               └── [id]/
│                   └── route.ts            # PUT/DELETE announcement
├── components/
│   ├── events/
│   │   ├── EventsList.tsx
│   │   ├── EventCard.tsx
│   │   ├── EventDetail.tsx
│   │   └── EventFilters.tsx
│   ├── announcements/
│   │   ├── AnnouncementPopup.tsx
│   │   └── AnnouncementManager.tsx
│   └── admin/
│       ├── events/
│       │   ├── EventsTab.tsx
│       │   └── EventEditor.tsx
│       └── announcements/
│           ├── AnnouncementsTab.tsx
│           └── AnnouncementEditor.tsx
├── supabase/
│   └── migrations/
│       ├── YYYYMMDD_create_events_table.sql
│       ├── YYYYMMDD_create_announcements_table.sql
│       └── YYYYMMDD_create_user_announcement_views_table.sql
└── types/
    └── events.ts                           # TypeScript interfaces
```

---

## 9. Sample Data

### Sample Event
```json
{
  "title": "Nutrition Workshop: Meal Planning for Cancer Patients",
  "description": "Join our expert nutritionists for an interactive workshop on creating balanced meal plans specifically designed for cancer patients undergoing treatment.",
  "event_date": "2025-11-15",
  "event_time": "14:00:00",
  "location": "Oncotrition Center, Nairobi",
  "additional_info": "Please bring a notebook. Light refreshments will be provided.",
  "featured_image_url": "/images/events/meal-planning-workshop.jpg",
  "status": "upcoming",
  "max_attendees": 50,
  "current_attendees": 23,
  "registration_link": "https://forms.gle/example",
  "organizer_name": "Dr. Jane Doe",
  "organizer_contact": "jane@oncotrition.com",
  "is_featured": true
}
```

### Sample Announcement
```json
{
  "title": "🎉 New Workshop Alert!",
  "message": "Join us for an exclusive Nutrition Workshop on November 15th. Limited seats available!",
  "announcement_type": "event",
  "event_id": "uuid-of-event",
  "cta_text": "Register Now",
  "cta_link": "/events/uuid-of-event",
  "image_url": "/images/announcements/workshop-promo.jpg",
  "start_date": "2025-10-20T00:00:00Z",
  "end_date": "2025-11-14T23:59:59Z",
  "is_active": true,
  "priority": 10,
  "display_frequency": "daily"
}
```

---

## 10. Success Metrics

### Key Performance Indicators (KPIs)
- Event page views
- Event registration clicks
- Announcement popup views
- Announcement CTA click-through rate
- Average time on events page
- Event detail page views
- Social shares count
- Mobile vs desktop engagement

### Goals
- 80% of users view at least one announcement
- 30% click-through rate on announcement CTAs
- 50% of event page visitors view event details
- 20% of event detail viewers click registration link

---

## 11. Notes & Considerations

### Design Consistency
- Follow existing Oncotrition design system
- Use brand colors (#009688 teal, purple accents)
- Maintain font family (Poppins)
- Consistent spacing and shadows
- Reuse existing UI components where possible

### Mobile Optimization
- Touch-friendly buttons (min 44x44px)
- Swipeable event cards
- Bottom sheet for filters on mobile
- Optimized images for mobile bandwidth

### Internationalization (Future)
- Support for multiple languages
- Date/time localization
- Currency localization (if paid events)

---

## 12. Timeline Summary

| Phase | Duration | Deliverables |
|-------|----------|-------------|
| Database Setup | 1 day | Tables, migrations, RLS policies |
| Events Page | 2 days | Page, components, filters, detail view |
| Announcement Popup | 1 day | Popup component, manager, tracking |
| Admin Interface | 2 days | CRUD interfaces, image upload |
| API Routes | 1 day | All endpoints, authentication |
| Testing & Polish | 1 day | Bug fixes, optimization, accessibility |
| **Total** | **8 days** | Complete events & announcements system |

---

## End of Plan

This plan provides a comprehensive roadmap for implementing the Events page and Announcement popup feature. The system is designed to be scalable, maintainable, and user-friendly while following best practices for performance, security, and accessibility.
