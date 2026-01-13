# Event Registration 400 Error - Debugging Guide

## Error
```
POST http://localhost:3000/api/events/5904f6bf-867e-499c-b3ff-9dbb0bb9529f/register 400 (Bad Request)
```

## Enhanced Logging Added

I've added comprehensive logging to both the frontend and backend to help identify the exact cause of the 400 error.

### Frontend Logging (RegistrationForm.tsx)
- Logs the form data being submitted
- Logs the response status and data
- Logs any errors that occur

### Backend Logging (app/api/events/[id]/register/route.ts)
- Logs the event ID and request body
- Logs missing required fields (if any)
- Logs event details (status, registration type, etc.)
- Logs pricing lookup attempts
- Shows all available pricing for the event if lookup fails

## How to Debug

1. **Open Browser Console** (F12 or Right-click → Inspect → Console)

2. **Try to register again** and watch for these logs:

### Frontend Console Logs:
```
Submitting registration: {fullName: "...", email: "...", ...}
Registration response: {status: 400, data: {...}}
Registration error: Error: ...
```

### Backend Console Logs (in your terminal where Next.js is running):
```
Registration request for event: 5904f6bf-867e-499c-b3ff-9dbb0bb9529f
Request body: {...}
Event found: {id: "...", title: "...", has_internal_registration: true, ...}
Looking up pricing: {event_id: "...", participation_type: "..."}
```

## Common Causes of 400 Error

### 1. Missing Required Fields
**Error**: `"Missing required fields: fullName, email, phoneNumber, participationType"`

**Solution**: Ensure all required fields are filled in the form.

### 2. Event Not Found
**Error**: `"Event not found"`

**Solution**: Verify the event ID exists in the database.

### 3. Internal Registration Not Enabled
**Error**: `"This event does not support internal registration"`

**Solution**: Check the event settings:
- `has_internal_registration` should be `true`
- `registration_type` should be `'internal'`

### 4. Event Status Not Accepting Registrations
**Error**: `"Registration is closed for this event"`

**Solution**: Event status must be `'upcoming'` to accept registrations.

### 5. Registration Deadline Passed
**Error**: `"Registration deadline has passed"`

**Solution**: Check if `registration_deadline` is in the future.

### 6. Pricing Not Configured (MOST LIKELY)
**Error**: `"Invalid participation type or pricing not configured for this event"`

**Solution**: This is the most common issue. The `nutrivibe_pricing` table needs entries for this event.

#### Check Pricing Configuration:
```sql
SELECT * FROM nutrivibe_pricing 
WHERE event_id = '5904f6bf-867e-499c-b3ff-9dbb0bb9529f' 
AND is_active = true;
```

#### Required Pricing Fields:
- `event_id`: Must match the event ID
- `participation_type`: Must match what user selects (e.g., 'in_person', 'virtual', 'student', etc.)
- `price`: The amount in your currency
- `is_active`: Must be `true`

### 7. Duplicate Registration
**Error**: `"You have already registered for this event with this email address"`

**Solution**: User has already completed registration with this email for this event.

## Quick Fix for Pricing Issue

If pricing is not configured, add it via admin panel or SQL:

```sql
INSERT INTO nutrivibe_pricing (
  event_id,
  participation_type,
  price,
  is_active,
  created_at,
  updated_at
) VALUES 
  ('5904f6bf-867e-499c-b3ff-9dbb0bb9529f', 'in_person', 5000, true, NOW(), NOW()),
  ('5904f6bf-867e-499c-b3ff-9dbb0bb9529f', 'virtual', 2000, true, NOW(), NOW()),
  ('5904f6bf-867e-499c-b3ff-9dbb0bb9529f', 'student', 3000, true, NOW(), NOW());
```

## Next Steps

1. **Try registration again** with browser console open
2. **Check the logs** in both browser console and terminal
3. **Look for the specific error message** in the logs
4. **Match the error** to one of the common causes above
5. **Apply the solution** for that specific error

## Most Likely Issue

Based on the error pattern, the most likely cause is **missing pricing configuration** for the event. The backend logs will show:

```
Looking up pricing: {event_id: "...", participation_type: "..."}
Pricing not found: {...}
All pricing for event: [] or null
```

If you see this, you need to configure pricing for the event in the admin panel or database.

## Admin Panel Solution

1. Go to `/admin/pages/events`
2. Find your event
3. Click "Edit" or "Manage"
4. Look for "Pricing" or "Registration Settings"
5. Add pricing for each participation type
6. Make sure `is_active` is checked
7. Save changes
8. Try registration again

## Files Modified

1. `app/api/events/[id]/register/route.ts` - Added comprehensive logging
2. `components/nutrivibe/RegistrationForm.tsx` - Added console logging

## Contact

If the issue persists after checking the logs, share:
1. The browser console logs
2. The terminal/server logs
3. The event ID
4. The participation type being selected

This will help identify the exact issue quickly.
