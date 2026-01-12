# Events Registration System Integration Plan

## Overview
Integrate the NutriVibe registration system into the existing events system to create a unified, reusable event registration platform.

---

## Current State Analysis

### What We Have Built (NutriVibe)
✅ **Database Tables:**
- `nutrivibe_pricing` - Pricing tiers
- `nutrivibe_interest_areas` - Interest options
- `nutrivibe_settings` - Event configuration
- `nutrivibe_registrations` - Registration records

✅ **Frontend Components:**
- Multi-step registration form (5 steps)
- Payment integration (Paystack)
- QR code generation
- Email confirmation system
- Beautiful shadcn UI with Outfit font

✅ **Backend:**
- Registration API (`/api/nutrivibe/register`)
- Payment verification API (`/api/nutrivibe/verify-payment`)
- Email service (Resend)
- QR code utilities

### What Already Exists (Events System)
✅ **Database:**
- `events` table with basic event info
- Fields: title, description, date, time, location, status, max_attendees, registration_link

✅ **Frontend:**
- Events listing page (`/events`)
- Event detail page (`/events/[id]`)
- EventCard, EventsList, EventFilters components
- Admin event management

---

## Integration Strategy

### Goal
Transform NutriVibe-specific system into a **generic event registration system** that can be used for any event, including NutriVibe and future events.

### Key Changes
1. **Extend** existing `events` table with registration capabilities
2. **Rename** NutriVibe tables to be event-agnostic
3. **Link** registration system to events via foreign keys
4. **Update** UI to show registration options on event cards
5. **Maintain** all built functionality (payment, QR codes, emails)

---

## Database Migration Plan

### Step 1: Extend Events Table

**File:** `supabase/migrations/20260111_extend_events_for_registration.sql`

```sql
-- Add registration capabilities to events table
ALTER TABLE events ADD COLUMN IF NOT EXISTS has_internal_registration BOOLEAN DEFAULT false;
ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_type VARCHAR(50) DEFAULT 'external';
-- Options: 'external' (link), 'internal' (our system), 'none' (no registration)

ALTER TABLE events ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_deadline TIMESTAMP;
ALTER TABLE events ADD COLUMN IF NOT EXISTS early_bird_discount DECIMAL(5, 2) DEFAULT 0;
ALTER TABLE events ADD COLUMN IF NOT EXISTS terms_and_conditions TEXT;
ALTER TABLE events ADD COLUMN IF NOT EXISTS requires_payment BOOLEAN DEFAULT false;

-- Add index for registration queries
CREATE INDEX IF NOT EXISTS idx_events_registration_type ON events(registration_type);
CREATE INDEX IF NOT EXISTS idx_events_has_registration ON events(has_internal_registration);
```

### Step 2: Rename and Extend Registration Tables

**Option A: Keep Existing Tables, Add Event ID** (RECOMMENDED - Less Disruptive)

```sql
-- Add event_id to existing nutrivibe tables
ALTER TABLE nutrivibe_registrations ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE nutrivibe_pricing ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE nutrivibe_interest_areas ADD COLUMN IF NOT EXISTS event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Make event_id required for new records (but allow NULL for existing)
-- We'll update existing records to point to a NutriVibe event

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_nutrivibe_registrations_event_id ON nutrivibe_registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_pricing_event_id ON nutrivibe_pricing(event_id);
CREATE INDEX IF NOT EXISTS idx_nutrivibe_interest_areas_event_id ON nutrivibe_interest_areas(event_id);

-- Update unique constraint on pricing to include event_id
ALTER TABLE nutrivibe_pricing DROP CONSTRAINT IF EXISTS nutrivibe_pricing_participation_type_key;
ALTER TABLE nutrivibe_pricing ADD CONSTRAINT nutrivibe_pricing_event_participation_unique 
  UNIQUE (event_id, participation_type);
```

**Option B: Rename Tables** (More Work, Cleaner Long-term)

```sql
-- Rename tables to be event-agnostic
ALTER TABLE nutrivibe_registrations RENAME TO event_registrations;
ALTER TABLE nutrivibe_pricing RENAME TO event_pricing_options;
ALTER TABLE nutrivibe_interest_areas RENAME TO event_interest_areas;
ALTER TABLE nutrivibe_settings RENAME TO event_registration_settings;

-- Add event_id to all tables
ALTER TABLE event_registrations ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE event_pricing_options ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE event_interest_areas ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;
ALTER TABLE event_registration_settings ADD COLUMN event_id UUID REFERENCES events(id) ON DELETE CASCADE;

-- Update constraints and indexes
-- (similar to Option A)
```

**RECOMMENDATION: Use Option A** - Less disruptive since you already ran the first migration.

### Step 3: Create NutriVibe Event Record

```sql
-- Insert NutriVibe as an event in the events table
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location,
  additional_info,
  status,
  max_attendees,
  has_internal_registration,
  registration_type,
  requires_payment,
  is_featured,
  organizer_name,
  organizer_contact
) VALUES (
  'The NutriVibe Session',
  'Networking, Professional Development, and Innovation in Nutrition. Connect with industry leaders, healthcare professionals, and nutrition students in this premier networking event.',
  '2026-11-08',
  '09:00:00',
  'Radisson Blu Hotel Nairobi',
  'Upper Hill, Nairobi, Kenya. Registration includes access to all sessions, networking lunch, and event materials.',
  'upcoming',
  200,
  true,
  'internal',
  true,
  true,
  'Oncotrition Events Team',
  'events@oncotrition.com'
) RETURNING id;

-- Save this ID - we'll need it to link existing data
```

### Step 4: Link Existing NutriVibe Data to Event

```sql
-- Get the NutriVibe event ID (replace with actual ID from previous step)
DO $$
DECLARE
  nutrivibe_event_id UUID;
BEGIN
  -- Get the NutriVibe event ID
  SELECT id INTO nutrivibe_event_id FROM events WHERE title = 'The NutriVibe Session' LIMIT 1;
  
  -- Update existing pricing to link to NutriVibe event
  UPDATE nutrivibe_pricing SET event_id = nutrivibe_event_id WHERE event_id IS NULL;
  
  -- Update existing interest areas to link to NutriVibe event
  UPDATE nutrivibe_interest_areas SET event_id = nutrivibe_event_id WHERE event_id IS NULL;
  
  -- Update existing settings to link to NutriVibe event (if we keep settings table)
  -- UPDATE nutrivibe_settings SET event_id = nutrivibe_event_id WHERE event_id IS NULL;
END $$;
```

### Step 5: Update RLS Policies

```sql
-- Update RLS policies to work with event_id

-- Drop old policies
DROP POLICY IF EXISTS "Public can view active pricing" ON nutrivibe_pricing;
DROP POLICY IF EXISTS "Public can view active interest areas" ON nutrivibe_interest_areas;

-- Create new policies
CREATE POLICY "Public can view active event pricing"
  ON nutrivibe_pricing FOR SELECT
  USING (is_active = true);

CREATE POLICY "Public can view active event interest areas"
  ON nutrivibe_interest_areas FOR SELECT
  USING (is_active = true);

-- Registrations remain the same (already have good policies)
```

---

## Code Changes Required

### 1. TypeScript Types Updates

**File:** `types/events.ts`

```typescript
// Extend existing Event interface
export interface Event {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time: string;
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
  
  // NEW FIELDS
  has_internal_registration: boolean;
  registration_type: 'external' | 'internal' | 'none';
  registration_deadline: string | null;
  early_bird_deadline: string | null;
  early_bird_discount: number;
  terms_and_conditions: string | null;
  requires_payment: boolean;
}

// Add event_id to registration types
export interface EventRegistration {
  // ... existing fields from NutrivibeRegistration
  event_id: string; // NEW
}

export interface EventPricingOption {
  // ... existing fields from NutrivibePricing
  event_id: string; // NEW
}

export interface EventInterestArea {
  // ... existing fields from NutrivibeInterestArea
  event_id: string; // NEW
}
```

### 2. Update EventCard Component

**File:** `components/events/EventCard.tsx`

Add registration button logic:

```typescript
// Inside EventCard component
const showRegisterButton = 
  event.has_internal_registration && 
  event.registration_type === 'internal' &&
  event.status === 'upcoming';

// In the JSX, replace "View Details" with conditional button
{showRegisterButton ? (
  <Link 
    href={`/events/${event.id}/register`}
    className="block w-full text-center bg-[#009688] hover:bg-[#00796b] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
  >
    <span className="text-white">Register Now</span>
  </Link>
) : (
  <Link 
    href={`/events/${event.id}`}
    className="block w-full text-center bg-[#009688] hover:bg-[#00796b] text-white py-3 px-4 rounded-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
  >
    <span className="text-white">View Details</span>
  </Link>
)}
```

### 3. Update EventDetail Component

**File:** `components/events/EventDetail.tsx`

Add registration button:

```typescript
// Add registration button if event has internal registration
{event.has_internal_registration && event.registration_type === 'internal' && event.status === 'upcoming' && (
  <Card className="mb-8">
    <CardContent className="p-8 text-center">
      <h3 className="text-2xl font-bold mb-4">Ready to Join?</h3>
      <p className="text-muted-foreground mb-6">
        Register now to secure your spot at this event.
      </p>
      <Link href={`/events/${event.id}/register`}>
        <Button className="w-full md:w-auto bg-[#009688] hover:bg-[#00796b] text-white" size="lg">
          Register for This Event
        </Button>
      </Link>
    </CardContent>
  </Card>
)}
```

### 4. Create Generic Registration Page

**File:** `app/(site)/events/[id]/register/page.tsx`

Replace `/nutrivibe/register` with dynamic event registration:

```typescript
export default async function EventRegisterPage({ params }: { params: { id: string } }) {
  const { id } = await params;
  const supabase = publicSupabase;

  // Fetch event details
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single();

  if (!event || !event.has_internal_registration) {
    notFound();
  }

  // Fetch pricing for this event
  const { data: pricingData } = await supabase
    .from('nutrivibe_pricing')
    .select('*')
    .eq('event_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // Fetch interest areas for this event
  const { data: interestAreasData } = await supabase
    .from('nutrivibe_interest_areas')
    .select('*')
    .eq('event_id', id)
    .eq('is_active', true)
    .order('display_order', { ascending: true });

  // ... rest of the component
}
```

### 5. Update API Routes

**File:** `app/api/events/[id]/register/route.ts`

Create new API route that accepts event_id:

```typescript
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const eventId = params.id;
  const body = await request.json();

  // Verify event exists and has internal registration
  const { data: event } = await supabase
    .from('events')
    .select('*')
    .eq('id', eventId)
    .single();

  if (!event || !event.has_internal_registration) {
    return NextResponse.json({ error: 'Event not found or registration not available' }, { status: 404 });
  }

  // Get pricing for this event
  const { data: pricing } = await supabase
    .from('nutrivibe_pricing')
    .select('*')
    .eq('event_id', eventId)
    .eq('participation_type', body.participationType)
    .single();

  // Create registration with event_id
  const { data: registration } = await supabase
    .from('nutrivibe_registrations')
    .insert({
      event_id: eventId, // NEW
      // ... rest of fields
    })
    .select()
    .single();

  // ... rest of payment logic
}
```

### 6. Update Registration Form Component

**File:** `components/events/RegistrationForm.tsx`

Add event prop:

```typescript
interface RegistrationFormProps {
  event: Event; // NEW - pass full event object
  pricing: EventPricingOption[];
  interestAreas: EventInterestArea[];
}

export function RegistrationForm({ event, pricing, interestAreas }: RegistrationFormProps) {
  // Update API call to use event-specific endpoint
  const response = await fetch(`/api/events/${event.id}/register`, {
    method: 'POST',
    body: JSON.stringify(formData),
  });
  
  // ... rest remains the same
}
```

### 7. Update Email Template

**File:** `emails/EventRegistration.tsx`

Rename from `NutrivibeRegistration.tsx` and make generic:

```typescript
interface EventRegistrationEmailProps {
  eventTitle: string; // NEW - dynamic event title
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  // ... rest of props
}

export function EventRegistrationEmail({ eventTitle, ...props }: EventRegistrationEmailProps) {
  return (
    <Html>
      {/* Update title to use dynamic event name */}
      <Heading>Welcome to {eventTitle}! 🎉</Heading>
      {/* ... rest of template */}
    </Html>
  );
}
```

---

## Admin Dashboard Updates

### 1. Event Management

**File:** `components/admin/events/EventEditor.tsx`

Add registration fields to event editor:

```typescript
// Add new fields to event form
<div className="space-y-4">
  <Label>Registration Type</Label>
  <Select value={event.registration_type} onChange={...}>
    <option value="none">No Registration</option>
    <option value="external">External Link</option>
    <option value="internal">Internal Registration System</option>
  </Select>

  {event.registration_type === 'internal' && (
    <>
      <Checkbox
        checked={event.requires_payment}
        label="Requires Payment"
      />
      <Input
        label="Registration Deadline"
        type="datetime-local"
        value={event.registration_deadline}
      />
      {/* ... more fields */}
    </>
  )}
</div>
```

### 2. Event Pricing Management

**File:** `components/admin/events/EventPricingManager.tsx`

New component to manage pricing per event:

```typescript
export function EventPricingManager({ eventId }: { eventId: string }) {
  // Fetch pricing for this specific event
  // Allow adding/editing/deleting pricing tiers
  // Similar to NutriVibe pricing management but event-specific
}
```

### 3. Event Registrations View

**File:** `components/admin/events/EventRegistrations.tsx`

View registrations for a specific event:

```typescript
export function EventRegistrations({ eventId }: { eventId: string }) {
  // Fetch registrations for this event
  // Show list with filters
  // Export functionality
  // Check-in functionality
}
```

---

## File Structure Changes

### New Files to Create
```
app/
├── (site)/
│   └── events/
│       └── [id]/
│           └── register/
│               └── page.tsx (NEW - replaces /nutrivibe/register)
├── api/
│   └── events/
│       └── [id]/
│           ├── register/
│           │   └── route.ts (NEW)
│           └── verify-payment/
│               └── route.ts (NEW)

components/
├── events/
│   └── RegistrationForm.tsx (UPDATE - make event-agnostic)
└── admin/
    └── events/
        ├── EventPricingManager.tsx (NEW)
        ├── EventInterestAreasManager.tsx (NEW)
        └── EventRegistrations.tsx (NEW)

emails/
└── EventRegistration.tsx (RENAME from NutrivibeRegistration.tsx)
```

### Files to Update
```
✏️ types/events.ts - Add new Event fields
✏️ components/events/EventCard.tsx - Add registration button logic
✏️ components/events/EventDetail.tsx - Add registration section
✏️ components/events/RegistrationForm.tsx - Make event-agnostic
✏️ lib/resend-nutrivibe.ts - Rename to resend-events.ts
✏️ All API routes - Update to use event_id
```

### Files to Keep (No Changes)
```
✅ lib/paystack.ts
✅ lib/qrcode.ts
✅ All form step components (PersonalDetailsStep, etc.)
✅ components/ui/* (all shadcn components)
```

---

## Migration Execution Plan

### Phase 1: Database (Do This First)
1. ✅ **Already Done:** Created nutrivibe tables
2. 🔄 **Next:** Run new migration to extend events table
3. 🔄 **Next:** Add event_id columns to nutrivibe tables
4. 🔄 **Next:** Create NutriVibe event record
5. 🔄 **Next:** Link existing nutrivibe data to event

### Phase 2: Backend Updates
1. Update TypeScript types
2. Create new API routes for events/[id]/register
3. Update existing API routes to use event_id
4. Rename email template

### Phase 3: Frontend Updates
1. Update EventCard component
2. Update EventDetail component
3. Create new registration page at /events/[id]/register
4. Update RegistrationForm to be event-agnostic
5. Test registration flow

### Phase 4: Admin Dashboard
1. Add registration fields to event editor
2. Create event pricing manager
3. Create event interest areas manager
4. Create event registrations viewer

### Phase 5: Testing
1. Test NutriVibe registration (should still work)
2. Create a test event with registration
3. Test registration flow for new event
4. Test payment integration
5. Test email delivery
6. Test QR code generation

### Phase 6: Cleanup (Optional)
1. Remove /nutrivibe/register page (redirect to /events/[id]/register)
2. Update documentation
3. Remove unused code

---

## Backward Compatibility

### Ensure NutriVibe Still Works
- Keep all existing nutrivibe tables (just add event_id)
- Keep all existing API routes initially
- Add redirects from old URLs to new ones
- Existing registrations remain valid

### Migration Script for Old URLs
```typescript
// middleware.ts or next.config.js
// Redirect /nutrivibe/register to /events/[nutrivibe-event-id]/register
```

---

## Benefits After Integration

### For Users
- ✅ All events in one place
- ✅ Consistent registration experience
- ✅ Can register for any event with internal registration

### For Admins
- ✅ Manage all event registrations in one dashboard
- ✅ Reuse pricing/interest areas for multiple events
- ✅ Easy to enable registration for new events

### For Developers
- ✅ Single codebase for all event registrations
- ✅ Reusable components
- ✅ Easier to maintain and extend
- ✅ Better code organization

---

## Rollback Plan

If something goes wrong:

1. **Database:** Keep old tables, don't drop anything
2. **Code:** Use feature flags to toggle between old/new system
3. **URLs:** Keep old URLs working with redirects
4. **Data:** All existing registrations remain intact

---

## Timeline Estimate

- **Phase 1 (Database):** 1-2 hours
- **Phase 2 (Backend):** 3-4 hours
- **Phase 3 (Frontend):** 4-5 hours
- **Phase 4 (Admin):** 3-4 hours
- **Phase 5 (Testing):** 2-3 hours
- **Total:** ~15-20 hours of development

---

## Next Steps

1. **Review this plan** - Confirm approach
2. **Create new migration file** - Extend events table
3. **Run migration** - Update database
4. **Update types** - Add new fields
5. **Start with backend** - Update API routes
6. **Then frontend** - Update components
7. **Test thoroughly** - Ensure everything works
8. **Deploy** - Ship to production

---

## Questions to Answer

1. ✅ Keep nutrivibe table names or rename to event_*?
   - **Recommendation:** Keep names, add event_id (less disruptive)

2. ✅ Support multiple events with registration simultaneously?
   - **Yes** - That's the whole point of integration

3. ✅ Different pricing structures per event?
   - **Yes** - Each event can have its own pricing tiers

4. ✅ Shared or separate interest areas per event?
   - **Separate** - Each event can have custom interest areas

5. ✅ Keep /nutrivibe/register URL or redirect?
   - **Redirect** - Use /events/[id]/register for consistency
