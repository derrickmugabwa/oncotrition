# Events Registration Integration - Implementation Summary

## ✅ Completed Steps

### 1. Database Migration ✓
**File:** `supabase/migrations/20260111_integrate_events_registration.sql`

**What it does:**
- Extends `events` table with registration fields
- Adds `event_id` column to all nutrivibe tables
- Creates NutriVibe event record in events table
- Links existing nutrivibe data to the event
- Adds helper functions and triggers
- Updates RLS policies

**To run:** Copy the SQL file contents and run in Supabase SQL Editor

---

### 2. TypeScript Types Updated ✓

**File:** `types/events.ts`
- Added registration fields to `Event` interface:
  - `has_internal_registration`
  - `registration_type`
  - `registration_deadline`
  - `early_bird_deadline`
  - `early_bird_discount`
  - `terms_and_conditions`
  - `requires_payment`
  - `venue_details`

**File:** `types/nutrivibe.ts`
- Added `event_id` to `NutrivibePricing`
- Added `event_id` to `NutrivibeInterestArea`
- Added `event_id` to `NutrivibeSettings`

---

### 3. Dynamic Event Registration Page ✓
**File:** `app/(site)/events/[id]/register/page.tsx`

**Features:**
- Fetches event by ID
- Validates event has internal registration
- Checks registration deadline
- Fetches pricing and interest areas for specific event
- Shows event details header
- Renders registration form

**URL:** `/events/[event-id]/register`

---

### 4. Event Registration API ✓
**File:** `app/api/events/[id]/register/route.ts`

**Features:**
- Validates event exists and has internal registration
- Checks registration deadline
- Gets pricing for selected participation type
- Prevents duplicate registrations
- Creates registration record with `event_id`
- Initializes Paystack payment
- Returns payment URL

**Endpoint:** `POST /api/events/[event-id]/register`

---

### 5. Payment Verification Page ✓
**File:** `app/(site)/events/payment/verify/page.tsx`

**Features:**
- Verifies payment with backend
- Displays QR code
- Shows event and registration details
- Success/failure handling
- Email confirmation notice

**URL:** `/events/payment/verify?reference=[payment-ref]`

---

### 6. Payment Verification API ✓
**File:** `app/api/events/verify-payment/route.ts`

**Features:**
- Verifies payment with Paystack
- Generates QR code
- Uploads QR to Supabase storage
- Updates registration status
- Sends confirmation email
- Returns event and registration data

**Endpoint:** `POST /api/events/verify-payment`

---

### 7. Updated Registration Form ✓
**File:** `components/nutrivibe/RegistrationForm.tsx`

**Changes:**
- Now accepts `event` prop instead of `settings`
- Uses event-specific API endpoint: `/api/events/[event-id]/register`
- Passes event to PaymentSummary component

---

### 8. Updated Payment Summary ✓
**File:** `components/nutrivibe/PaymentSummary.tsx`

**Changes:**
- Now accepts `event` prop instead of `settings`
- Uses `event.terms_and_conditions` instead of `settings.terms_and_conditions`

---

## 🔄 Next Steps (Not Yet Done)

### 1. Update EventCard Component
**File:** `components/events/EventCard.tsx`

**Need to add:**
```typescript
const showRegisterButton = 
  event.has_internal_registration && 
  event.registration_type === 'internal' &&
  event.status === 'upcoming';

// Replace "View Details" button with conditional logic
{showRegisterButton ? (
  <Link href={`/events/${event.id}/register`}>
    Register Now
  </Link>
) : (
  <Link href={`/events/${event.id}`}>
    View Details
  </Link>
)}
```

---

### 2. Update EventDetail Component
**File:** `components/events/EventDetail.tsx`

**Need to add:**
- Registration button section for events with internal registration
- Display registration deadline
- Show available spots (max_attendees - current_attendees)

---

### 3. Run Database Migration
**Action Required:**
1. Open Supabase Dashboard
2. Go to SQL Editor
3. Copy contents of `supabase/migrations/20260111_integrate_events_registration.sql`
4. Run the migration
5. Verify NutriVibe event was created
6. Verify existing data was linked

---

### 4. Test Registration Flow
**Test Steps:**
1. Visit `/events` page
2. Find NutriVibe event (should show "Register Now" button after EventCard update)
3. Click "Register Now"
4. Complete registration form
5. Proceed to payment
6. Complete payment (use Paystack test card)
7. Verify redirect to success page
8. Check QR code is displayed
9. Check email was received

---

### 5. Update Admin Dashboard
**Files to create/update:**
- `app/admin/pages/events/[id]/pricing/page.tsx` - Manage pricing per event
- `app/admin/pages/events/[id]/interest-areas/page.tsx` - Manage interest areas
- `app/admin/pages/events/[id]/registrations/page.tsx` - View registrations
- `components/admin/events/EventEditor.tsx` - Add registration fields

---

## 📊 System Architecture

### Data Flow
```
User visits /events
  ↓
Clicks "Register Now" on event with internal registration
  ↓
Redirected to /events/[event-id]/register
  ↓
Page fetches:
  - Event details (from events table)
  - Pricing options (from nutrivibe_pricing WHERE event_id = [id])
  - Interest areas (from nutrivibe_interest_areas WHERE event_id = [id])
  ↓
User completes form
  ↓
POST /api/events/[event-id]/register
  ↓
Creates registration with event_id
  ↓
Initializes Paystack payment
  ↓
User completes payment
  ↓
Redirected to /events/payment/verify
  ↓
POST /api/events/verify-payment
  ↓
Verifies payment, generates QR, sends email
  ↓
Success page with QR code
```

---

## 🔑 Key Benefits

### 1. Reusability
- Any event can now have internal registration
- Just set `has_internal_registration = true` and `registration_type = 'internal'`
- Configure pricing and interest areas per event

### 2. Flexibility
- Events can have different pricing structures
- Events can have different interest areas
- Events can have different registration deadlines

### 3. Scalability
- Easy to add more events with registration
- No code changes needed for new events
- Just database configuration

### 4. Maintainability
- Single codebase for all event registrations
- Consistent user experience
- Easier to fix bugs and add features

---

## 🧪 Testing Checklist

### Database
- [ ] Run migration successfully
- [ ] Verify NutriVibe event exists in events table
- [ ] Verify nutrivibe_pricing has event_id
- [ ] Verify nutrivibe_interest_areas has event_id
- [ ] Verify existing data is linked to event

### Frontend
- [ ] Registration page loads at `/events/[id]/register`
- [ ] Event details display correctly
- [ ] Form steps work correctly
- [ ] Pricing displays correctly
- [ ] Interest areas display correctly

### Backend
- [ ] Registration API creates record with event_id
- [ ] Payment initialization works
- [ ] Payment verification works
- [ ] QR code generation works
- [ ] Email sending works

### Integration
- [ ] Complete end-to-end registration
- [ ] Payment flow works
- [ ] QR code received
- [ ] Email received
- [ ] Registration shows in database

---

## 🚀 Deployment Steps

1. **Run Database Migration**
   ```sql
   -- Run in Supabase SQL Editor
   -- File: supabase/migrations/20260111_integrate_events_registration.sql
   ```

2. **Update EventCard Component**
   - Add registration button logic

3. **Update EventDetail Component**
   - Add registration section

4. **Test Locally**
   - Complete a test registration
   - Verify all steps work

5. **Deploy to Production**
   - Push code changes
   - Verify migration ran successfully
   - Test production registration

---

## 📝 Environment Variables

Make sure these are set:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx

# Resend
RESEND_API_KEY=re_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 🎯 Current Status

### Completed ✅
- Database migration created
- TypeScript types updated
- Dynamic registration page created
- Event registration API created
- Payment verification page created
- Payment verification API created
- Registration form updated
- Payment summary updated

### Remaining 🔄
- Update EventCard component
- Update EventDetail component
- Run database migration
- Test registration flow
- Update admin dashboard

---

## 🔗 File Reference

### New Files Created
```
supabase/migrations/
  └── 20260111_integrate_events_registration.sql

app/(site)/events/
  └── [id]/
      └── register/
          └── page.tsx
  └── payment/
      └── verify/
          └── page.tsx

app/api/events/
  └── [id]/
      └── register/
          └── route.ts
  └── verify-payment/
      └── route.ts
```

### Modified Files
```
types/
  ├── events.ts (added registration fields)
  └── nutrivibe.ts (added event_id fields)

components/nutrivibe/
  ├── RegistrationForm.tsx (uses event prop)
  └── PaymentSummary.tsx (uses event prop)
```

### Files to Modify Next
```
components/events/
  ├── EventCard.tsx (add registration button)
  └── EventDetail.tsx (add registration section)
```

---

## 💡 Usage Example

### For NutriVibe Event
```
URL: /events/[nutrivibe-event-id]/register
- Uses same form components
- Same payment flow
- Same QR code generation
- Same email confirmation
```

### For Future Events
```
1. Create event in events table
2. Set has_internal_registration = true
3. Set registration_type = 'internal'
4. Add pricing options for this event
5. Add interest areas for this event (optional)
6. Users can now register at /events/[event-id]/register
```

---

## 🎉 Success Criteria

- [x] Database schema extended
- [x] Types updated
- [x] Registration page created
- [x] API routes created
- [x] Form components updated
- [ ] EventCard shows "Register Now" button
- [ ] EventDetail shows registration section
- [ ] Database migration run successfully
- [ ] End-to-end registration tested
- [ ] NutriVibe registration works
- [ ] System ready for new events

---

**Next Action:** Update EventCard and EventDetail components, then run the database migration!
