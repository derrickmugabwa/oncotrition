# Door Price Setup Guide

## Issue
The door price is not displaying on the event pricing banner.

## Root Causes
1. The `door_price` column may not exist in the database yet (migration not applied)
2. Existing pricing data has `event_id` as NULL (created before event_id column was added)
3. The query was only fetching pricing with matching event_id, missing global pricing

## Solutions Applied

### 1. Updated Query Logic
Changed the pricing query to fetch both event-specific AND global pricing:

```typescript
// Before (only event-specific)
.eq('event_id', id)

// After (event-specific OR global)
.or(`event_id.eq.${id},event_id.is.null`)
```

This allows the banner to show:
- Pricing specific to the event (where event_id matches)
- Global pricing options (where event_id is NULL)

### 2. Added Debug Logging
Added console.log statements to help diagnose the issue:
- Shows all pricing data received
- Shows active pricing after filtering
- Shows door_price values for each option

## Steps to Fix

### Step 1: Apply the Migration

You need to run the migration to add the `door_price` column:

**Option A: Using Supabase Dashboard**
1. Go to Supabase Dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/20260216_add_door_price_to_pricing.sql`
4. Run the query

**Option B: Using Supabase CLI**
```bash
# If you have Supabase CLI installed
supabase db push
```

**Option C: Manual SQL**
Run this SQL in your database:
```sql
ALTER TABLE nutrivibe_pricing
ADD COLUMN IF NOT EXISTS door_price DECIMAL(10, 2) NULL;

COMMENT ON COLUMN nutrivibe_pricing.door_price IS 'Last call/door price - higher price for late registrations. NULL means no door pricing available.';

CREATE INDEX IF NOT EXISTS idx_nutrivibe_pricing_door_price ON nutrivibe_pricing(door_price) WHERE door_price IS NOT NULL;
```

### Step 2: Add Door Prices to Existing Pricing

After the migration, you need to add door prices to your pricing options:

**Option A: Using Admin Interface**
1. Go to your admin panel
2. Navigate to Events → Select an Event → Manage Pricing
3. For each pricing option, add a "Last Call/Door Price"
4. Save changes

**Option B: Using SQL**
```sql
-- Example: Add door prices to existing pricing
UPDATE nutrivibe_pricing 
SET door_price = 3500.00 
WHERE participation_type = 'nutrition_student';

UPDATE nutrivibe_pricing 
SET door_price = 7500.00 
WHERE participation_type = 'professional';

-- Add more as needed...
```

### Step 3: Verify in Browser

1. Open the event details page
2. Open browser console (F12)
3. Look for the debug logs:
   ```
   EventPricingBanner - All pricing: [...]
   EventPricingBanner - Active pricing: [...]
   EventPricingBanner - Door prices: [...]
   ```
4. Check if `door_price` values are present and not null

### Step 4: Test the Display

The pricing banner should now show:
- **Early Bird Price**: The regular price
- **Last Call Price**: The door price (if set)
- **Savings Badge**: Shows how much you save with early bird pricing

## Troubleshooting

### Problem: Pricing banner doesn't appear at all
**Solution**: 
- Check if pricing data exists in the database
- Verify `is_active` is true for pricing options
- Check browser console for errors

### Problem: Door price shows as "0" or "null"
**Solution**:
- The `door_price` column exists but has no value
- Add door prices via admin interface or SQL

### Problem: No pricing data returned
**Solution**:
- Check if pricing has `event_id` set correctly
- The updated query should fetch global pricing (event_id = NULL) as well
- Verify in Supabase dashboard that pricing data exists

### Problem: Migration fails
**Solution**:
- Column might already exist - check with:
  ```sql
  SELECT column_name, data_type 
  FROM information_schema.columns 
  WHERE table_name = 'nutrivibe_pricing';
  ```
- If `door_price` already exists, skip the migration

## Verification Checklist

- [ ] Migration applied successfully
- [ ] `door_price` column exists in `nutrivibe_pricing` table
- [ ] At least one pricing option has a door_price value > 0
- [ ] Pricing data is returned in browser console logs
- [ ] Pricing banner displays on event details page
- [ ] Early bird price shows correctly
- [ ] Last call price shows correctly (when set)
- [ ] Savings badge displays (when door price exists)

## Example Data Structure

After setup, your pricing data should look like this:

```json
{
  "id": "uuid-here",
  "event_id": null,  // or specific event UUID
  "participation_type": "nutrition_student",
  "price": 2500.00,
  "door_price": 3500.00,  // NEW - This should have a value
  "description": "Nutrition students",
  "is_active": true,
  "display_order": 1
}
```

## Remove Debug Logging (Optional)

Once everything works, you can remove the console.log statements from `EventPricingBanner.tsx`:

```typescript
// Remove these lines:
console.log('EventPricingBanner - All pricing:', pricing);
console.log('EventPricingBanner - Active pricing:', activePricing);
console.log('EventPricingBanner - Door prices:', activePricing.map(p => ({ type: p.participation_type, door_price: p.door_price })));
```
