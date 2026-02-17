# Event Pricing - Last Call/Door Price Feature

## Overview

This feature allows event organizers to set different pricing tiers for event registrations, including:
- **Early Bird Price**: Regular/discounted price for early registrations
- **Last Call/Door Price**: Higher price for late or on-site registrations

The system displays pricing options in an attractive banner on event detail pages, encouraging early registration by showing potential savings.

## Features

### Admin Interface

#### Event Pricing Manager

Located at: `/admin/pages/events/[eventId]/pricing`

**Fields for Each Pricing Option:**
1. **Participation Type** (Required)
   - Snake_case identifier (e.g., `nutrition_student`, `professional`)
   - Used to categorize different attendee types

2. **Early Bird Price** (Required)
   - Regular/discounted price for early registrations
   - Displayed prominently to encourage early sign-ups

3. **Last Call/Door Price** (Optional)
   - Higher price for late registrations
   - When set, shows savings amount to incentivize early registration
   - Can be left empty if no door pricing is needed

4. **Description** (Optional)
   - Brief description of the pricing tier
   - Displayed on the pricing banner

5. **Display Order**
   - Controls the order in which pricing options appear

6. **Active Status**
   - Toggle to show/hide pricing options

### Public Display

#### Event Pricing Banner

Displayed on event detail pages (`/events/[id]`) when pricing options are available.

**Banner Features:**
- **Responsive Grid Layout**: 1-3 columns depending on screen size
- **Pricing Cards**: Each participation type gets its own card
- **Price Display**:
  - Shows early bird price prominently
  - If door price exists, displays both prices
  - Shows savings amount when door price is set
- **Visual Indicators**:
  - Green badge showing savings amount
  - Orange highlighting for door prices
  - Animated card entrance
- **Door Price Mode**: Can toggle to show door prices as active (via `showDoorPrices` prop)

## Database Schema

### Migration: `20260216_add_door_price_to_pricing.sql`

```sql
ALTER TABLE nutrivibe_pricing
ADD COLUMN IF NOT EXISTS door_price DECIMAL(10, 2) NULL;
```

### Updated `nutrivibe_pricing` Table

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_id | UUID | Links to events table |
| participation_type | VARCHAR(50) | Type identifier (snake_case) |
| price | DECIMAL(10,2) | Early bird/regular price |
| **door_price** | **DECIMAL(10,2)** | **Last call/door price (optional)** |
| description | TEXT | Description of pricing tier |
| is_active | BOOLEAN | Visibility toggle |
| display_order | INTEGER | Display order |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

## TypeScript Types

### Updated `NutrivibePricing` Interface

```typescript
export interface NutrivibePricing {
  id: string;
  event_id: string | null;
  participation_type: string;
  price: number;
  door_price: number | null; // NEW - Last call/door price
  description: string | null;
  is_active: boolean | null;
  display_order: number | null;
  created_at: string | null;
  updated_at: string | null;
}
```

## Components

### 1. EventPricingManager (Admin)
**Location**: `components/admin/events/EventPricingManager.tsx`

**Updates:**
- Added `door_price` field to pricing form
- Updated form layout to accommodate both price fields
- Enhanced preview to show both prices
- Validation ensures prices are positive numbers

### 2. EventPricingBanner (Public)
**Location**: `components/events/EventPricingBanner.tsx`

**Props:**
```typescript
interface EventPricingBannerProps {
  pricing: NutrivibePricing[];
  showDoorPrices?: boolean; // Toggle door price display mode
}
```

**Features:**
- Responsive grid layout (1-3 columns)
- Animated card entrance with framer-motion
- Conditional rendering based on door price availability
- Savings calculation and display
- Alert banner when door prices are active
- Professional styling with Tailwind CSS

### 3. EventDetail (Updated)
**Location**: `components/events/EventDetail.tsx`

**Updates:**
- Added `pricing` prop to accept pricing data
- Integrated `EventPricingBanner` component
- Positioned banner after event description

### 4. Event Page (Updated)
**Location**: `app/(site)/events/[id]/page.tsx`

**Updates:**
- Fetches pricing data from database
- Passes pricing to EventDetail component
- Server-side rendering for SEO benefits

## Usage Guide

### Setting Up Event Pricing

1. **Navigate to Event Pricing Manager**
   - Go to Admin → Events
   - Select an event
   - Click "Manage Pricing"

2. **Add Pricing Options**
   - Click "Add Pricing Option"
   - Fill in participation type (e.g., `nutrition_student`)
   - Set early bird price (e.g., 2500 KES)
   - Optionally set door price (e.g., 3500 KES)
   - Add description
   - Set display order
   - Toggle active status

3. **Save Changes**
   - Click "Save Pricing Options"
   - Changes appear immediately on event detail page

### Pricing Strategies

#### Strategy 1: Early Bird Discount
```
Early Bird: 2500 KES
Door Price: 3500 KES
Savings: 1000 KES (28% off)
```
Encourages early registration with clear savings.

#### Strategy 2: Flat Pricing
```
Early Bird: 3000 KES
Door Price: (not set)
```
Single price point, no urgency created.

#### Strategy 3: Tiered Pricing
```
Students:
  Early Bird: 2000 KES
  Door Price: 2500 KES

Professionals:
  Early Bird: 5000 KES
  Door Price: 6500 KES
```
Different pricing for different attendee types.

## Display Modes

### Normal Mode (`showDoorPrices={false}`)
- Shows early bird price prominently
- Door price shown as secondary information
- Displays savings amount
- Encourages early registration

### Door Price Mode (`showDoorPrices={true}`)
- Highlights door prices as current price
- Shows early bird price as crossed out
- Alert banner indicates door pricing is active
- Creates urgency for remaining registrations

## Styling

### Color Scheme
- **Primary (Early Bird)**: `#009688` (Teal)
- **Door Price**: `#EA580C` (Orange)
- **Savings**: `#16A34A` (Green)
- **Borders**: Gray with hover effect to primary

### Responsive Breakpoints
- **Mobile**: 1 column
- **Tablet (sm)**: 2 columns
- **Desktop (lg)**: 3 columns

## API Integration

### Fetching Pricing Data

```typescript
const { data: pricing } = await supabase
  .from('nutrivibe_pricing')
  .select('*')
  .eq('event_id', eventId)
  .eq('is_active', true)
  .order('display_order', { ascending: true });
```

### Saving Pricing Data

```typescript
const response = await fetch(`/api/admin/events/${eventId}/pricing`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ pricing: pricingOptions }),
});
```

## Benefits

### For Event Organizers
1. **Flexible Pricing**: Set different prices for different attendee types
2. **Revenue Optimization**: Encourage early registration with discounts
3. **Easy Management**: Simple admin interface
4. **Real-time Updates**: Changes reflect immediately

### For Attendees
1. **Clear Pricing**: See all pricing options at a glance
2. **Savings Visibility**: Know exactly how much they save
3. **Urgency**: Door pricing creates incentive to register early
4. **Transparency**: All costs displayed upfront

### For Platform
1. **Increased Conversions**: Clear pricing reduces friction
2. **Early Registration**: Door pricing encourages early sign-ups
3. **Professional Appearance**: Modern, attractive pricing display
4. **SEO Benefits**: Server-rendered pricing content

## Testing Checklist

- [ ] Create pricing option with only early bird price
- [ ] Create pricing option with both early bird and door price
- [ ] Verify pricing displays correctly on event detail page
- [ ] Test responsive layout on mobile, tablet, desktop
- [ ] Verify savings calculation is accurate
- [ ] Test door price mode toggle
- [ ] Verify inactive pricing options don't display
- [ ] Test display order sorting
- [ ] Verify admin preview matches public display
- [ ] Test with multiple pricing options (3+)

## Future Enhancements

Potential improvements:
- **Time-based Pricing**: Automatically switch to door pricing after deadline
- **Dynamic Pricing**: Adjust prices based on remaining capacity
- **Promo Codes**: Apply discount codes to pricing
- **Currency Support**: Multi-currency pricing
- **Group Discounts**: Special pricing for group registrations
- **Payment Plans**: Installment payment options

## Migration Instructions

To apply this feature to your database:

```bash
# Run the migration
psql -d your_database < supabase/migrations/20260216_add_door_price_to_pricing.sql
```

Or using Supabase CLI:

```bash
supabase db push
```

## Support

For issues or questions:
- Check the admin pricing manager for validation errors
- Verify pricing data in Supabase dashboard
- Ensure event has active pricing options
- Check browser console for any errors
