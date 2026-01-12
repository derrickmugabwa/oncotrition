# NutriVibe Quick Start - UI Testing

## Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy the contents of `supabase/migrations/20260111_create_nutrivibe_tables.sql`
4. Paste and run the SQL

This will create:
- `nutrivibe_pricing` table with default pricing
- `nutrivibe_interest_areas` table with default options
- `nutrivibe_settings` table with event details
- `nutrivibe_registrations` table for storing registrations

## Step 2: Verify Tables Created

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name LIKE 'nutrivibe%';

-- View pricing data
SELECT * FROM nutrivibe_pricing;

-- View interest areas
SELECT * FROM nutrivibe_interest_areas;

-- View settings
SELECT * FROM nutrivibe_settings;
```

## Step 3: Start Development Server

```bash
npm run dev
```

## Step 4: Access the Registration Form

Open your browser and navigate to:

```
http://localhost:3000/nutrivibe/register
```

## Expected UI

You should see:

1. **Header Section:**
   - "The NutriVibe Session" title
   - Event date, time, and location
   - Teal color scheme

2. **Progress Bar:**
   - Shows "Step 1 of 5"
   - Progress percentage
   - Teal gradient bar

3. **Personal Details Form:**
   - Full Name (required)
   - Organization (optional)
   - Designation (optional)
   - Email (required)
   - Phone Number (required)
   - "Continue" button in teal

## Form Steps Preview

### Step 1: Personal Details
- Clean input fields with labels
- Validation on required fields
- Teal "Continue" button

### Step 2: Participation Type
- Card-based selection
- Pricing displayed for each option:
  - Nutrition Student: KES 2,500
  - Others: KES 6,000
- Visual selection indicator (checkmark)
- Selected card has teal border

### Step 3: Interest Areas
- Checkbox list with options:
  - Food Innovation & Product Development
  - Health & Wellness Entrepreneurship
  - Investment & Partnerships
  - Additional Engagement Options
- Optional "Other" text field

### Step 4: Networking Purpose
- Radio selection cards:
  - Showcase a product or innovation
  - Be considered for a panel discussion
  - Receive updates on future programs
  - Additional Engagement Options
- "Skip this step" option

### Step 5: Payment Summary
- Review all entered information
- Payment breakdown
- Total amount in teal
- "Proceed to Payment" button

## Troubleshooting

### Issue: Page shows error or blank

**Solution:** Make sure database migration is complete

```sql
-- Check if tables exist
SELECT COUNT(*) FROM nutrivibe_pricing;
```

Should return 5 rows.

### Issue: No pricing options showing

**Solution:** Check if data was inserted

```sql
-- Re-insert pricing data if needed
INSERT INTO nutrivibe_pricing (participation_type, price, description, display_order) VALUES
('nutrition_student', 2500.00, 'Nutrition students', 1),
('professional', 6000.00, 'Nutrition/Dietician/Nutritionist', 2),
('healthcare_professional', 6000.00, 'Healthcare Professional/Allied guest', 3),
('institutional_representative', 6000.00, 'Institutional Representative/Partner/Sponsor', 4),
('online_attendee', 6000.00, 'Online attendee', 5)
ON CONFLICT (participation_type) DO NOTHING;
```

### Issue: Styling looks off

**Solution:** Make sure Outfit font is loaded in root layout (already configured)

## UI Testing Checklist

- [ ] Page loads without errors
- [ ] Outfit font is applied
- [ ] Teal color scheme (#009688) is visible
- [ ] Progress bar shows correctly
- [ ] Form inputs are styled with shadcn UI
- [ ] Buttons are visible and styled
- [ ] Cards have proper borders and hover effects
- [ ] Responsive design works on mobile
- [ ] Dark mode works (toggle in browser)
- [ ] All 5 steps are accessible
- [ ] Navigation (Back/Continue) works
- [ ] Form validation shows errors

## Next: Full Testing

After UI looks good, we'll add:
1. Environment variables for Paystack
2. Environment variables for Resend
3. Test actual registration flow
4. Test payment integration
5. Test email delivery

For now, you can navigate through all form steps to check the UI!
