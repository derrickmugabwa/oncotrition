# 🚀 How to Run the Sponsorship Migration

## The Problem
The "Exhibit or Partner With Us" button is not showing because the database migration hasn't been applied yet. The migration adds the necessary fields to the events table.

## Solution: Run the Migration

### Option 1: Supabase Dashboard (Recommended)

1. **Open Supabase Dashboard**
   - Go to https://supabase.com/dashboard
   - Select your project

2. **Navigate to SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and Paste Migration**
   - Open the file: `supabase/migrations/20260204_create_sponsorship_system.sql`
   - Copy ALL the contents
   - Paste into the SQL Editor

4. **Run the Migration**
   - Click "Run" or press Ctrl+Enter
   - Wait for completion (should take 2-5 seconds)
   - Check for success messages in the output

5. **Verify**
   - You should see messages like:
     ```
     ✓ Successfully created sponsorship tiers for NutriVibe event
     ✓ Created 4 sponsorship tiers
     ✓ Created 14 sponsorship benefits
     ✓ Sponsorship system migration completed successfully!
     ```

### Option 2: Supabase CLI

If you have Supabase CLI installed:

```bash
# Make sure you're in the project directory
cd "c:\Users\Derrick Mugabwa\Desktop\dev center\oncotrition"

# Link to your project (if not already linked)
supabase link --project-ref YOUR_PROJECT_REF

# Apply the migration
supabase db push
```

### Option 3: Manual SQL Execution

1. Open your Supabase project
2. Go to Database → SQL Editor
3. Run the migration file content

---

## After Running the Migration

### 1. Verify the Migration Worked

Run this query in Supabase SQL Editor:

```sql
-- Check if new tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE '%sponsorship%';

-- Should return:
-- event_sponsorship_tiers
-- event_sponsorship_benefits
-- event_sponsorship_registrations
```

### 2. Check Event Fields

```sql
-- Check if sponsorship fields were added to events table
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'events' 
AND column_name LIKE '%sponsorship%';

-- Should return:
-- accepts_sponsorships | boolean
-- sponsorship_deadline | timestamp
-- sponsorship_terms    | text
```

### 3. View Sample Data

```sql
-- Check if sample tiers were created for NutriVibe event
SELECT 
  e.title as event_title,
  t.tier_name,
  t.price,
  t.is_active,
  COUNT(b.id) as benefits_count
FROM events e
JOIN event_sponsorship_tiers t ON t.event_id = e.id
LEFT JOIN event_sponsorship_benefits b ON b.tier_id = t.id
WHERE e.title = 'The NutriVibe Session'
GROUP BY e.title, t.tier_name, t.price, t.is_active, t.display_order
ORDER BY t.display_order;

-- Should return 4 tiers:
-- Bronze   - 20000  - 3 benefits
-- Silver   - 50000  - 4 benefits
-- Gold     - 100000 - 4 benefits
-- Platinum - 200000 - 5 benefits
```

---

## Enable Sponsorships for Your Event

After migration, you need to enable sponsorships for specific events:

### Method 1: SQL (Quick)

```sql
-- Enable sponsorships for NutriVibe event
UPDATE events 
SET 
  accepts_sponsorships = TRUE,
  sponsorship_deadline = '2026-11-01 23:59:59',
  sponsorship_terms = 'By registering as a sponsor, you agree to our sponsorship terms and conditions.'
WHERE title = 'The NutriVibe Session';
```

### Method 2: Admin Dashboard ✅

You can now manage sponsorships through the admin interface:
1. Go to Admin → Events
2. Click Edit on any event
3. Scroll to "Sponsorship Configuration" section
4. Check "Accept Sponsorships"
5. Set sponsorship deadline (optional)
6. Add terms and conditions (optional)
7. Save the event
8. Click the DollarSign icon to manage tiers and view registrations

---

## Testing the Button

After running the migration and enabling sponsorships:

1. **Refresh your browser** (hard refresh: Ctrl+Shift+R)
2. **Visit the event page**: `/events/[event-id]`
3. **You should now see:**
   - The "Register for This Event" button (if registration is enabled)
   - The "Exhibit or Partner With Us" button (NEW!)

---

## Troubleshooting

### Button Still Not Showing?

**Check 1: Event has sponsorships enabled**
```sql
SELECT id, title, accepts_sponsorships 
FROM events 
WHERE id = 'YOUR_EVENT_ID';
```

**Check 2: Event status is 'upcoming'**
```sql
SELECT id, title, status, accepts_sponsorships 
FROM events 
WHERE id = 'YOUR_EVENT_ID';
```
The button only shows for events with:
- `status = 'upcoming'`
- `accepts_sponsorships = true`

**Check 3: Clear browser cache**
- Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
- Or open in incognito/private mode

**Check 4: Check browser console**
- Press F12 to open DevTools
- Look for any JavaScript errors
- Check Network tab for failed API calls

---

## Next Steps After Migration

1. ✅ Run migration
2. ✅ Verify tables created
3. ✅ Enable sponsorships for test event
4. ✅ Test the button appears
5. ✅ Test the full registration flow
6. ✅ Test admin management pages

---

## Quick Test Checklist

- [ ] Migration ran successfully
- [ ] New tables exist in database
- [ ] Sample data created for NutriVibe
- [ ] Event has `accepts_sponsorships = true`
- [ ] Button appears on event page
- [ ] Clicking button goes to `/events/[id]/sponsor`
- [ ] Sponsorship tiers display correctly
- [ ] Can complete registration form
- [ ] Payment redirects to Paystack
- [ ] Admin can view sponsorships
- [ ] Admin can manage tiers

---

## Need Help?

If you encounter any issues:

1. Check the Supabase logs for error messages
2. Verify your database permissions
3. Ensure you're using the correct project
4. Check that all environment variables are set

**Common Issues:**
- **Permission denied**: Make sure you're using the service role key
- **Table already exists**: Migration was already run (check if fields exist)
- **Foreign key constraint**: Ensure events table exists first
