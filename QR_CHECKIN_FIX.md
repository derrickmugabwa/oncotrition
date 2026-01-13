# QR Code Check-in Scanner Fix

## Problem
The QR code scanner camera was opening but not auto-checking in attendees when scanning QR codes.

## Root Cause
The QR code data structure was missing critical fields (`event_id` and `event_title`) that the check-in scanner requires to verify and process check-ins.

### What Was Happening:
1. Camera would open successfully ✅
2. QR code would be scanned and decoded ✅
3. Check-in handler would parse the QR data ✅
4. Event verification would fail ❌ (missing `event_id` field)
5. Check-in would silently fail without error message ❌

## Solution Implemented

### 1. Updated QR Code Data Structure (`lib/qrcode.ts`)
Added `event_id` and `event_title` to the QR code data:

```typescript
interface QRCodeData {
  id: string;
  name: string;
  email: string;
  type: string;
  event_id: string;        // ✅ Added
  event_title: string;     // ✅ Added
  timestamp: number;
}
```

### 2. Updated QR Code Generation Functions
Modified both `generateQRCode()` and `generateQRCodeBase64()` to accept and include event information:

```typescript
export async function generateQRCode(
  registrationId: string,
  data: {
    fullName: string;
    email: string;
    participationType: string;
    eventId: string;        // ✅ Added
    eventTitle: string;     // ✅ Added
  }
)
```

### 3. Updated Payment Verification Routes
Both payment verification routes now pass event information to QR code generator:

**Events Route** (`app/api/events/verify-payment/route.ts`):
```typescript
const { qrCodeUrl, qrCodeData } = await generateQRCode(
  registration.id,
  {
    fullName: registration.full_name,
    email: registration.email,
    participationType: registration.participation_type,
    eventId: event.id,        // ✅ Added
    eventTitle: event.title,  // ✅ Added
  }
);
```

**NutriVibe Route** (`app/api/nutrivibe/verify-payment/route.ts`):
- Added event fetching before QR code generation
- Passes event information to QR code generator

### 4. Enhanced Debugging
Added console logging to help diagnose issues:

**QRScanner Component**:
- Logs decoded QR code data when scanned

**EventCheckInScanner Component**:
- Logs parsed QR data structure
- Logs event ID comparison for verification
- Provides detailed error messages

## Testing Instructions

### For New Registrations:
1. Complete a new event registration with payment
2. Receive QR code via email
3. Navigate to event check-in page: `/admin/pages/events/[id]/check-in`
4. Click "Start Camera Scanner"
5. Point camera at QR code
6. ✅ Should auto-check-in successfully

### For Existing Registrations:
**Important**: QR codes generated before this fix will NOT work because they're missing the `event_id` and `event_title` fields.

**Options for existing registrations**:
1. **Regenerate QR codes**: Create a migration script to regenerate QR codes for existing registrations
2. **Use manual check-in**: Use the "Manual Input" tab and search by email address
3. **Wait for new registrations**: Only new registrations will have properly formatted QR codes

## Browser Console Debugging

When scanning a QR code, you should see these console logs:

```
QR Code scanned: {"id":"...","name":"...","email":"...","type":"...","event_id":"...","event_title":"...","timestamp":...}
Parsed QR data: {id: "...", name: "...", email: "...", type: "...", event_id: "...", event_title: "...", timestamp: ...}
Checking event match: {qrEventId: "...", currentEventId: "..."}
```

If check-in fails, you'll see a detailed error message explaining why.

## Common Issues & Solutions

### Issue: "Invalid QR code format"
**Cause**: QR code doesn't contain valid JSON
**Solution**: Regenerate the QR code

### Issue: "This QR code is for [Event Name] event, not this event"
**Cause**: Scanning QR code for wrong event
**Solution**: Navigate to the correct event's check-in page

### Issue: "Registration not found"
**Cause**: Registration ID doesn't exist or payment not completed
**Solution**: Verify registration exists and payment is completed

### Issue: Old QR codes don't work
**Cause**: QR codes generated before this fix are missing required fields
**Solution**: Use manual check-in by email or regenerate QR codes

## Files Modified

1. `lib/qrcode.ts` - Updated QR code data structure and generation functions
2. `app/api/events/verify-payment/route.ts` - Pass event info to QR generator
3. `app/api/nutrivibe/verify-payment/route.ts` - Fetch and pass event info
4. `components/admin/events/QRScanner.tsx` - Added debug logging
5. `components/admin/events/EventCheckInScanner.tsx` - Enhanced error messages and logging

## Migration Script (Optional)

To regenerate QR codes for existing registrations, create and run this script:

```typescript
// scripts/regenerate-qr-codes.ts
import { createClient } from '@supabase/supabase-js';
import { generateQRCode } from '@/lib/qrcode';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function regenerateQRCodes() {
  // Get all completed registrations without proper QR codes
  const { data: registrations } = await supabase
    .from('nutrivibe_registrations')
    .select('*, events(id, title)')
    .eq('payment_status', 'completed');

  for (const reg of registrations || []) {
    try {
      const { qrCodeUrl, qrCodeData } = await generateQRCode(reg.id, {
        fullName: reg.full_name,
        email: reg.email,
        participationType: reg.participation_type,
        eventId: reg.events.id,
        eventTitle: reg.events.title,
      });

      await supabase
        .from('nutrivibe_registrations')
        .update({ qr_code_url: qrCodeUrl, qr_code_data: qrCodeData })
        .eq('id', reg.id);

      console.log(`✅ Regenerated QR for ${reg.full_name}`);
    } catch (error) {
      console.error(`❌ Failed for ${reg.full_name}:`, error);
    }
  }
}

regenerateQRCodes();
```

## Summary

The QR code check-in system now works correctly with:
- ✅ Camera opens and displays feed
- ✅ QR codes are scanned and decoded
- ✅ Event verification works properly
- ✅ Auto check-in happens immediately
- ✅ Detailed error messages for debugging
- ✅ Console logging for troubleshooting

**Note**: Only QR codes generated after this fix will work automatically. Existing QR codes need to be regenerated or use manual check-in.
