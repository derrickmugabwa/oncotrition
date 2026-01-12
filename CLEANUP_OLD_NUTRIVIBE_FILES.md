# Cleanup: Remove Old NutriVibe Files

## Files to Delete

These files are now obsolete since we've integrated NutriVibe into the events system.

### Old Frontend Pages (Delete Entire Directories)

```
app/(site)/nutrivibe/
├── register/
│   └── page.tsx                    ❌ DELETE (replaced by /events/[id]/register)
└── payment/
    └── verify/
        └── page.tsx                ❌ DELETE (replaced by /events/payment/verify)
```

**Delete command:**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force "app\(site)\nutrivibe"
```

### Old API Routes (Delete Entire Directory)

```
app/api/nutrivibe/
├── pricing/
│   └── route.ts                    ❌ DELETE (not needed anymore)
├── register/
│   └── route.ts                    ❌ DELETE (replaced by /api/events/[id]/register)
└── verify-payment/
    └── route.ts                    ❌ DELETE (replaced by /api/events/verify-payment)
```

**Delete command:**
```bash
# Windows PowerShell
Remove-Item -Recurse -Force "app\api\nutrivibe"
```

---

## What Replaces Them

### Old → New Mapping

| Old Path | New Path | Purpose |
|----------|----------|---------|
| `/nutrivibe/register` | `/events/[event-id]/register` | Registration page (event-specific) |
| `/nutrivibe/payment/verify` | `/events/payment/verify` | Payment verification (all events) |
| `POST /api/nutrivibe/register` | `POST /api/events/[id]/register` | Registration API (event-specific) |
| `POST /api/nutrivibe/verify-payment` | `POST /api/events/verify-payment` | Payment verification API (all events) |
| `GET /api/nutrivibe/pricing` | N/A | Not needed (fetched in page component) |

---

## Redirects (Optional)

If you want to maintain backward compatibility for any existing links, add these redirects to `next.config.js`:

```javascript
async redirects() {
  return [
    {
      source: '/nutrivibe/register',
      destination: '/events', // Or specific event ID if known
      permanent: true,
    },
    {
      source: '/nutrivibe/payment/verify',
      destination: '/events/payment/verify',
      permanent: true,
    },
  ];
},
```

---

## Files to Keep

These files are still used by the new system:

✅ **Keep All:**
- `components/nutrivibe/*` - All form components (reused for all events)
- `lib/paystack.ts` - Payment utilities
- `lib/qrcode.ts` - QR code utilities
- `lib/resend-nutrivibe.ts` - Email utilities
- `emails/NutrivibeRegistration.tsx` - Email template
- `types/nutrivibe.ts` - Type definitions
- `supabase/migrations/20260111_create_nutrivibe_tables.sql` - Original migration
- `supabase/migrations/20260111_integrate_events_registration.sql` - Integration migration

---

## Step-by-Step Cleanup

### Option 1: Manual Deletion (Recommended)

1. **Delete old frontend pages:**
   - Right-click `app\(site)\nutrivibe` folder
   - Select "Delete"

2. **Delete old API routes:**
   - Right-click `app\api\nutrivibe` folder
   - Select "Delete"

3. **Verify deletion:**
   - Check that folders are gone
   - Run `npm run dev` to ensure no errors

### Option 2: PowerShell Script

Create a file `cleanup.ps1`:

```powershell
# Navigate to project root
cd "c:\Users\Derrick Mugabwa\Desktop\dev center\oncotrition"

# Delete old frontend pages
if (Test-Path "app\(site)\nutrivibe") {
    Remove-Item -Recurse -Force "app\(site)\nutrivibe"
    Write-Host "✓ Deleted app\(site)\nutrivibe" -ForegroundColor Green
}

# Delete old API routes
if (Test-Path "app\api\nutrivibe") {
    Remove-Item -Recurse -Force "app\api\nutrivibe"
    Write-Host "✓ Deleted app\api\nutrivibe" -ForegroundColor Green
}

Write-Host "`n✓ Cleanup complete!" -ForegroundColor Green
Write-Host "Old NutriVibe files have been removed." -ForegroundColor Cyan
```

Run it:
```bash
.\cleanup.ps1
```

---

## After Cleanup

### Test Everything Still Works

1. **Start dev server:**
   ```bash
   npm run dev
   ```

2. **Visit events page:**
   ```
   http://localhost:3000/events
   ```

3. **Click on NutriVibe event:**
   - Should go to event details page
   - Should see "Register for This Event" button

4. **Click register button:**
   - Should go to `/events/[event-id]/register`
   - Form should work correctly

5. **Complete registration:**
   - Should redirect to Paystack
   - After payment, should redirect to `/events/payment/verify`
   - Should see success page

---

## Rollback (If Needed)

If something breaks, you can restore from git:

```bash
git checkout app/(site)/nutrivibe
git checkout app/api/nutrivibe
```

---

## Summary

**What we're removing:**
- ❌ Old standalone NutriVibe pages
- ❌ Old NutriVibe-specific API routes

**What we're keeping:**
- ✅ All form components (reusable)
- ✅ All utilities (payment, QR, email)
- ✅ All types
- ✅ Database migrations

**What we're using now:**
- ✅ Generic event registration system
- ✅ Event-specific routes
- ✅ Integrated with events table

---

**Ready to delete?** Just remove the two folders:
1. `app\(site)\nutrivibe`
2. `app\api\nutrivibe`

Then test that everything still works! 🚀
