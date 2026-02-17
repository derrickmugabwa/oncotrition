# Event TBD (To Be Determined) Feature

## Overview

This feature allows administrators to create events without specifying exact dates or times, marking them as "To Be Determined" (TBD) instead. This is useful for events that are planned but don't have confirmed schedules yet.

## Features

### Admin Interface

When creating or editing an event in the admin panel:

1. **Date TBD Checkbox**
   - Located next to the "Event Date" field
   - When checked:
     - Date input field is disabled
     - Date is no longer required
     - Event can be saved without a specific date
     - Helper text shows: "Date will be announced later"

2. **Time TBD Checkbox**
   - Located next to the "Event Time" field
   - When checked:
     - Time input field is disabled
     - Time is no longer required
     - Event can be saved without a specific time
     - Helper text shows: "Time will be announced later"

### Public Display

Events with TBD dates/times display appropriately on the website:

#### Event Cards (Events List Page)
- Date shows: "To Be Determined" instead of formatted date
- Time shows: "To Be Determined" instead of time

#### Event Detail Page
- Date section shows: "To Be Determined"
- Time section shows: "To Be Determined"

## Database Schema

### New Fields Added to `events` Table

```sql
-- TBD flags
date_tbd BOOLEAN DEFAULT false
time_tbd BOOLEAN DEFAULT false

-- Modified fields (now nullable)
event_date DATE NULL
event_time TIME NULL
```

### Database Constraints

```sql
-- Ensure either date is provided OR date_tbd is true
CHECK (
  (event_date IS NOT NULL AND date_tbd = false) OR 
  (event_date IS NULL AND date_tbd = true)
)

-- Ensure either time is provided OR time_tbd is true
CHECK (
  (event_time IS NOT NULL AND time_tbd = false) OR 
  (event_time IS NULL AND time_tbd = true)
)
```

## TypeScript Types

### Event Interface
```typescript
export interface Event {
  // ... other fields
  event_date: string | null; // Nullable when date_tbd is true
  event_time: string | null; // Nullable when time_tbd is true
  date_tbd: boolean | null;  // TBD flag for date
  time_tbd: boolean | null;  // TBD flag for time
}
```

### EventFormData Interface
```typescript
export interface EventFormData {
  // ... other fields
  event_date: string;
  event_time: string;
  date_tbd?: boolean;
  time_tbd?: boolean;
}
```

## Implementation Details

### Files Modified

1. **Database Migration**
   - `supabase/migrations/20260215_add_tbd_fields_to_events.sql`
   - Adds TBD fields and constraints

2. **TypeScript Types**
   - `types/events.ts`
   - Updated Event and EventFormData interfaces

3. **Admin Components**
   - `components/admin/events/EventEditor.tsx`
   - Added TBD checkboxes
   - Updated validation logic
   - Modified data preparation for database

4. **Public Components**
   - `components/events/EventCard.tsx`
   - Updated date/time display logic
   
   - `components/events/EventDetail.tsx`
   - Updated date/time display logic

## Usage Guide

### Creating an Event with TBD Date/Time

1. Navigate to Admin → Events
2. Click "Create New Event"
3. Fill in required fields (Title, Description, Location)
4. For the date:
   - Check "To Be Determined" if date is not yet confirmed
   - OR select a specific date
5. For the time:
   - Check "To Be Determined" if time is not yet confirmed
   - OR select a specific time
6. Save the event

### Updating TBD Events Later

When the date/time is confirmed:

1. Edit the event
2. Uncheck the "To Be Determined" checkbox
3. Select the actual date/time
4. Save changes

The event will now display the confirmed date/time on the website.

## Validation Rules

- At least one of the following must be true:
  - Event has a specific date, OR
  - Event is marked as date TBD

- At least one of the following must be true:
  - Event has a specific time, OR
  - Event is marked as time TBD

- You cannot have both a date AND date_tbd checked
- You cannot have both a time AND time_tbd checked

## Display Examples

### Event Card
```
📅 To Be Determined
🕐 To Be Determined
📍 Oncotrition Center, Nairobi
```

### Event Detail Page
```
Event Details
─────────────
📅 Date
   To Be Determined

🕐 Time
   To Be Determined

📍 Location
   Oncotrition Center, Nairobi
```

## Benefits

1. **Flexibility**: Create events before all details are finalized
2. **Transparency**: Clearly communicate to users that details are pending
3. **User Experience**: Better than showing placeholder dates or leaving fields empty
4. **Admin Workflow**: Allows planning and promotion of events in advance

## Migration Instructions

To apply this feature to your database:

```bash
# Run the migration
psql -d your_database < supabase/migrations/20260215_add_tbd_fields_to_events.sql
```

Or if using Supabase CLI:

```bash
supabase db push
```

## Testing Checklist

- [ ] Create event with date TBD
- [ ] Create event with time TBD
- [ ] Create event with both date and time TBD
- [ ] Create event with specific date and time
- [ ] Verify TBD events display correctly on events list page
- [ ] Verify TBD events display correctly on event detail page
- [ ] Update TBD event to have specific date/time
- [ ] Verify validation prevents saving without date/time when TBD is unchecked
- [ ] Verify checkboxes disable/enable input fields correctly

## Future Enhancements

Potential improvements:
- Add notification system to alert users when TBD events get confirmed dates
- Add "Notify me when date is confirmed" feature
- Show "Date pending" badge on event cards
- Filter events by "TBD" status
