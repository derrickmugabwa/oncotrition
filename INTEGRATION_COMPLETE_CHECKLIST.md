# Events Registration Integration - Complete Checklist

## ✅ COMPLETED - All Code Changes Done!

### 1. Database Migration ✅
- [x] Created `supabase/migrations/20260111_integrate_events_registration.sql`
- [x] Extends events table with registration fields
- [x] Adds event_id to nutrivibe tables
- [x] Creates NutriVibe event record
- [x] Links existing data to event
- [x] Adds helper functions and triggers

### 2. TypeScript Types ✅
- [x] Updated `types/events.ts` with registration fields
- [x] Updated `types/nutrivibe.ts` with event_id fields

### 3. Registration Pages ✅
- [x] Created `/events/[id]/register/page.tsx`
- [x] Created `/events/payment/verify/page.tsx`

### 4. API Routes ✅
- [x] Created `/api/events/[id]/register/route.ts`
- [x] Created `/api/events/verify-payment/route.ts`

### 5. Components ✅
- [x] Updated `RegistrationForm.tsx` to use event prop
- [x] Updated `PaymentSummary.tsx` to use event prop
- [x] Updated `EventCard.tsx` with "Register Now" button
- [x] Updated `EventDetail.tsx` with registration section

---

## 🔄 NEXT STEPS - What You Need To Do

### Step 1: Run Database Migration ⚠️ REQUIRED

1. **Open Supabase Dashboard**
   - Go to your project at supabase.com
   - Navigate to SQL Editor (left sidebar)

2. **Run the Migration**
   - Open file: `supabase/migrations/20260111_integrate_events_registration.sql`
   - Copy ALL contents (entire file)
   - Paste into Supabase SQL Editor
   - Click "Run" or press Ctrl+Enter

3. **Verify Success**
   You should see output messages like:
   ```
   NOTICE: Updated 5 pricing records
   NOTICE: Updated 4 interest area records
   NOTICE: Updated 1 settings records
   NOTICE: Successfully linked all NutriVibe data to event ID: [uuid]
   NOTICE: ✓ Migration completed successfully!
   ```

4. **Check the Data**
   Run these queries to verify:
   ```sql
   -- Check NutriVibe event was created
   SELECT * FROM events WHERE title = 'The NutriVibe Session';
   
   -- Check pricing is linked
   SELECT * FROM nutrivibe_pricing WHERE event_id IS NOT NULL;
   
   -- Check interest areas are linked
   SELECT * FROM nutrivibe_interest_areas WHERE event_id IS NOT NULL;
   ```

---

### Step 2: Test the System 🧪

#### A. View Events Page
1. Start dev server: `npm run dev`
2. Go to: `http://localhost:3000/events`
3. **Expected:** NutriVibe event shows "Register Now" button (teal color)

#### B. Test Registration Flow
1. Click "Register Now" on NutriVibe event
2. **Expected:** Redirected to `/events/[event-id]/register`
3. **Expected:** See event details header with date, time, location
4. **Expected:** See "Step 1 of 5" progress bar

#### C. Complete Registration Form
1. **Step 1:** Fill personal details (name, email, phone)
2. **Step 2:** Select participation type (see pricing: KES 2,500 or KES 6,000)
3. **Step 3:** Select interest areas (checkboxes)
4. **Step 4:** Select networking purpose (optional)
5. **Step 5:** Review and click "Proceed to Payment"

#### D. Test Payment (Use Paystack Test Cards)
1. **Expected:** Redirected to Paystack checkout
2. Use test card: `4084084084084081`
3. CVV: `408`, Expiry: Any future date
4. PIN: `0000`, OTP: `123456`
5. Complete payment

#### E. Verify Success
1. **Expected:** Redirected to `/events/payment/verify`
2. **Expected:** See "Registration Successful! 🎉"
3. **Expected:** See QR code displayed
4. **Expected:** See "Confirmation email sent!" message
5. **Expected:** Receive email with QR code

---

### Step 3: Verify Database Records 📊

After completing a test registration, check:

```sql
-- Check registration was created
SELECT * FROM nutrivibe_registrations 
WHERE event_id = (SELECT id FROM events WHERE title = 'The NutriVibe Session')
ORDER BY created_at DESC LIMIT 1;

-- Check payment status is 'completed'
-- Check qr_code_url is not null
-- Check email_sent is true

-- Check event attendee count was updated
SELECT current_attendees FROM events WHERE title = 'The NutriVibe Session';
-- Should be 1 after first registration
```

---

## 🎯 Testing Checklist

### Database ✓
- [ ] Migration ran without errors
- [ ] NutriVibe event exists in events table
- [ ] Event has `has_internal_registration = true`
- [ ] Event has `registration_type = 'internal'`
- [ ] Pricing records have event_id
- [ ] Interest area records have event_id
- [ ] Settings record has event_id

### Frontend ✓
- [ ] Events page loads without errors
- [ ] NutriVibe event shows "Register Now" button
- [ ] Registration page loads at `/events/[id]/register`
- [ ] Event details display correctly
- [ ] Form steps work (1-5)
- [ ] Progress bar updates
- [ ] Pricing displays correctly
- [ ] Interest areas display correctly
- [ ] Payment summary shows correct amount

### Backend ✓
- [ ] Registration API creates record with event_id
- [ ] Duplicate email check works
- [ ] Payment initialization works
- [ ] Paystack redirect works
- [ ] Payment verification works
- [ ] QR code generation works
- [ ] QR code upload to Supabase works
- [ ] Email sending works

### Integration ✓
- [ ] Complete end-to-end registration
- [ ] Payment flow works
- [ ] QR code received in email
- [ ] QR code displayed on success page
- [ ] Registration record in database
- [ ] Event attendee count updated

---

## 🚨 Troubleshooting

### Issue: Migration Fails
**Solution:** 
- Check if you already ran it (look for NutriVibe event in events table)
- If exists, the migration has `ON CONFLICT DO NOTHING` so it's safe to re-run
- Check error message for specific issues

### Issue: "Event not found" on registration page
**Solution:**
- Verify migration ran successfully
- Check event exists: `SELECT * FROM events WHERE title = 'The NutriVibe Session'`
- Check event has `has_internal_registration = true`

### Issue: No pricing options showing
**Solution:**
- Check pricing is linked: `SELECT * FROM nutrivibe_pricing WHERE event_id IS NOT NULL`
- If not linked, run the migration again

### Issue: Payment fails
**Solution:**
- Check Paystack keys in `.env.local`
- Use test card: `4084084084084081`
- Check console for errors

### Issue: Email not received
**Solution:**
- Check Resend API key in `.env.local`
- Check spam folder
- Check email_sent field in database
- Check server logs for email errors

---

## 📋 Environment Variables Checklist

Make sure these are set in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# Paystack
PAYSTACK_SECRET_KEY=sk_test_xxx  # or sk_live_xxx for production
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_xxx  # or pk_live_xxx

# Resend
RESEND_API_KEY=re_xxx

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Change for production
```

---

## 🎉 Success Criteria

You'll know it's working when:

1. ✅ NutriVibe event shows "Register Now" button on events page
2. ✅ Registration form loads and displays event details
3. ✅ All 5 form steps work correctly
4. ✅ Payment redirects to Paystack
5. ✅ Payment verification succeeds
6. ✅ QR code is generated and displayed
7. ✅ Email is sent with QR code
8. ✅ Registration appears in database with event_id
9. ✅ Event attendee count increments

---

## 🔮 Future: Adding More Events with Registration

Once this is working, adding registration to any event is easy:

### Option 1: Via SQL
```sql
-- Create new event with registration
INSERT INTO events (
  title,
  description,
  event_date,
  event_time,
  location,
  status,
  has_internal_registration,
  registration_type,
  requires_payment,
  is_featured
) VALUES (
  'My New Event',
  'Event description...',
  '2026-12-01',
  '10:00:00',
  'Event Location',
  'upcoming',
  true,  -- Enable internal registration
  'internal',  -- Use our system
  true,  -- Requires payment
  true
) RETURNING id;

-- Add pricing for this event
INSERT INTO nutrivibe_pricing (event_id, participation_type, price, description, display_order)
VALUES 
  ('[event-id]', 'general', 5000.00, 'General Admission', 1),
  ('[event-id]', 'vip', 10000.00, 'VIP Access', 2);

-- Add interest areas (optional)
INSERT INTO nutrivibe_interest_areas (event_id, name, display_order)
VALUES
  ('[event-id]', 'Topic 1', 1),
  ('[event-id]', 'Topic 2', 2);
```

### Option 2: Via Admin Dashboard (Future)
- Create event in admin
- Toggle "Enable Internal Registration"
- Add pricing tiers
- Add interest areas
- Publish event
- Users can now register!

---

## 📞 Support

If you encounter issues:

1. Check `INTEGRATION_IMPLEMENTATION_SUMMARY.md` for detailed info
2. Check `EVENTS_REGISTRATION_INTEGRATION_PLAN.md` for architecture
3. Review error messages in browser console
4. Check server logs for API errors
5. Verify all environment variables are set

---

## ✨ What's Next?

After testing works:

1. **Admin Dashboard** - Build UI to manage events, pricing, and registrations
2. **QR Scanner** - Build check-in system for event day
3. **Analytics** - Build dashboard for registration analytics
4. **Email Templates** - Customize email design per event
5. **Production Deploy** - Switch to live Paystack keys and deploy

---

**Current Status:** All code complete! Ready for database migration and testing. 🚀
