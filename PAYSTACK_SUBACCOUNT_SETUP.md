# Paystack Subaccount Integration ✅

## 🎉 Implementation Complete

Paystack subaccount support has been added to automatically route payments to your app-specific subaccount.

---

## 🎯 What's Been Added

### **1. Subaccount Support in Paystack Library** ✅
- Automatic subaccount inclusion in all payments
- Configurable via environment variable
- Optional override per transaction
- Bearer configuration (who pays Paystack fees)

### **2. Environment Variable** ✅
- `PAYSTACK_SUBACCOUNT_CODE` - Your subaccount code
- Graceful fallback if not configured
- Warning in console if missing

### **3. Smart Defaults** ✅
- Subaccount automatically included if configured
- Subaccount bears Paystack charges by default
- Can be overridden per transaction if needed

---

## 🔧 Setup Instructions

### **Step 1: Get Your Subaccount Code**

1. **Log in to Paystack Dashboard**
   - Go to https://dashboard.paystack.com

2. **Navigate to Subaccounts**
   - Settings → Subaccounts
   - Or direct link: https://dashboard.paystack.com/#/settings/subaccounts

3. **Find Your Oncotrition Subaccount**
   - Look for your app's subaccount
   - Copy the **Subaccount Code**
   - Format: `ACCT_xxxxxxxxxx`

### **Step 2: Add to Environment Variables**

Add to your `.env.local` file:

```env
# Paystack Configuration
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_SUBACCOUNT_CODE=ACCT_xxxxxxxxxx
```

**For Production (.env.production):**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_SUBACCOUNT_CODE=ACCT_xxxxxxxxxx
```

**For Testing (.env.local):**
```env
PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
PAYSTACK_SUBACCOUNT_CODE=ACCT_xxxxxxxxxx  # Test subaccount
```

### **Step 3: Restart Your Dev Server**

```bash
# Stop the server (Ctrl+C)
# Restart
npm run dev
```

---

## 🎨 How It Works

### **Automatic Subaccount Inclusion**

When you call `initializePayment()`, the subaccount is automatically added:

```typescript
// Before (your code stays the same)
const paymentResult = await initializePayment({
  email: 'user@example.com',
  amount: 250000, // KES 2,500 in kobo
  reference: 'NV-1234567890',
  callback_url: 'https://yourapp.com/verify',
});

// After (automatically enhanced)
// The library adds:
{
  email: 'user@example.com',
  amount: 250000,
  reference: 'NV-1234567890',
  callback_url: 'https://yourapp.com/verify',
  subaccount: 'ACCT_xxxxxxxxxx',  // ✅ Added automatically
  bearer: 'subaccount',            // ✅ Subaccount pays fees
}
```

### **No Code Changes Required**

All existing payment initialization calls work automatically:
- ✅ Event registrations
- ✅ NutriVibe registrations
- ✅ Any future payment flows

---

## 💰 Payment Flow

### **With Subaccount:**

```
User Pays → Paystack → Your Subaccount
                ↓
         Paystack Fees (deducted from subaccount)
                ↓
         Settlement to your bank
```

### **Fee Bearer Options:**

**Option 1: Subaccount Bears Fees (Default)**
```typescript
bearer: 'subaccount'
```
- Paystack fees deducted from subaccount
- User pays exact amount
- Subaccount receives: Amount - Fees

**Option 2: Main Account Bears Fees**
```typescript
bearer: 'account'
```
- Paystack fees deducted from main account
- User pays exact amount
- Subaccount receives: Full amount

**Example:**
```
User pays: KES 2,500
Paystack fee: KES 37.50 (1.5%)

With bearer: 'subaccount'
→ Subaccount receives: KES 2,462.50

With bearer: 'account'
→ Subaccount receives: KES 2,500
→ Main account pays: KES 37.50
```

---

## 🔧 Advanced Usage

### **Override Subaccount Per Transaction**

If you need to use a different subaccount for specific transactions:

```typescript
const paymentResult = await initializePayment({
  email: 'user@example.com',
  amount: 250000,
  reference: 'NV-1234567890',
  callback_url: 'https://yourapp.com/verify',
  subaccount: 'ACCT_different_subaccount', // Override
  bearer: 'account', // Override fee bearer
});
```

### **Split Payment**

If you want to split payment between main account and subaccount:

```typescript
const paymentResult = await initializePayment({
  email: 'user@example.com',
  amount: 250000,
  reference: 'NV-1234567890',
  callback_url: 'https://yourapp.com/verify',
  subaccount: 'ACCT_xxxxxxxxxx',
  transaction_charge: 50000, // KES 500 to subaccount (in kobo)
  bearer: 'subaccount',
});
```

**Result:**
- Total: KES 2,500
- Subaccount gets: KES 500
- Main account gets: KES 2,000

### **Get Subaccount Code Programmatically**

```typescript
import { getSubaccountCode } from '@/lib/paystack';

const subaccountCode = getSubaccountCode();
if (subaccountCode) {
  console.log('Using subaccount:', subaccountCode);
} else {
  console.log('No subaccount configured');
}
```

---

## 📋 Updated Interface

### **PaystackInitializeData**

```typescript
interface PaystackInitializeData {
  email: string;                    // Customer email
  amount: number;                   // Amount in kobo
  reference: string;                // Unique payment reference
  metadata?: any;                   // Custom metadata
  callback_url: string;             // Verification callback URL
  channels?: string[];              // Payment channels (card, bank, etc.)
  
  // NEW: Subaccount fields
  subaccount?: string;              // Subaccount code (ACCT_xxxxxxxxxx)
  transaction_charge?: number;      // Amount for subaccount (in kobo)
  bearer?: 'account' | 'subaccount'; // Who pays Paystack fees
}
```

---

## ✅ What's Automatic

### **All Payment Initializations:**

**Event Registrations:**
- `/api/events/[id]/register/route.ts`
- ✅ Subaccount automatically included

**NutriVibe Registrations:**
- `/api/nutrivibe/register/route.ts`
- ✅ Subaccount automatically included

**Future Payments:**
- Any new payment flows
- ✅ Subaccount automatically included

### **No Code Changes Needed:**

Your existing code:
```typescript
const paymentResult = await initializePayment({
  email: email,
  amount: pricing.price,
  reference: paymentReference,
  callback_url: callbackUrl,
});
```

Works automatically with subaccount! ✅

---

## 🔍 Verification

### **Check Console on Payment**

When initializing payment, you'll see:
```
✅ PAYSTACK_SUBACCOUNT_CODE configured
Payment initialized with subaccount: ACCT_xxxxxxxxxx
```

Or if not configured:
```
⚠️ PAYSTACK_SUBACCOUNT_CODE is not set - payments will go to main account
```

### **Check Paystack Dashboard**

After a test payment:
1. Go to Paystack Dashboard → Transactions
2. Click on the transaction
3. Look for "Subaccount" field
4. Should show: `ACCT_xxxxxxxxxx`

### **Check Settlement**

1. Go to Paystack Dashboard → Settlements
2. Filter by subaccount
3. Verify payments are going to correct subaccount

---

## 🧪 Testing

### **Test Mode:**

1. **Use Test Subaccount**
   ```env
   PAYSTACK_SECRET_KEY=sk_test_xxxxxxxxxxxxx
   PAYSTACK_SUBACCOUNT_CODE=ACCT_test_xxxxxxxxxx
   ```

2. **Test Payment**
   - Register for an event
   - Use test card: `4084084084084081`
   - Complete payment

3. **Verify in Dashboard**
   - Check Paystack test dashboard
   - Verify subaccount is included

### **Live Mode:**

1. **Use Live Subaccount**
   ```env
   PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
   PAYSTACK_SUBACCOUNT_CODE=ACCT_live_xxxxxxxxxx
   ```

2. **Small Test Payment**
   - Create test event with small amount
   - Complete real payment
   - Verify settlement

---

## 🚨 Important Notes

### **Subaccount Must Exist**
- Create subaccount in Paystack dashboard first
- Get the subaccount code
- Add to environment variables

### **Subaccount Must Be Active**
- Check subaccount status in dashboard
- Ensure it's not suspended or disabled

### **Settlement Configuration**
- Configure settlement schedule in Paystack
- Set up bank account for subaccount
- Verify settlement settings

### **Fee Configuration**
- Default: Subaccount bears fees
- Can be changed per transaction
- Consider in your pricing

---

## 📊 Multiple Apps Setup

If you have multiple apps with different subaccounts:

### **App 1: Oncotrition**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_SUBACCOUNT_CODE=ACCT_oncotrition_xxx
```

### **App 2: Another App**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
PAYSTACK_SUBACCOUNT_CODE=ACCT_otherapp_xxx
```

### **Shared Main Account**
- All apps use same `PAYSTACK_SECRET_KEY`
- Each app has unique `PAYSTACK_SUBACCOUNT_CODE`
- Payments automatically route to correct subaccount
- Settlements go to respective bank accounts

---

## 🎯 Benefits

### **For You:**
- ✅ Separate accounting per app
- ✅ Individual settlement schedules
- ✅ Clear revenue tracking
- ✅ Easy reconciliation
- ✅ Automatic routing

### **For Users:**
- ✅ No change in experience
- ✅ Same payment flow
- ✅ Same security
- ✅ Same confirmation

---

## 🔧 Troubleshooting

### **Payments Going to Main Account**

**Problem:** Payments not routing to subaccount

**Solutions:**
1. Check environment variable is set:
   ```bash
   echo $PAYSTACK_SUBACCOUNT_CODE
   ```
2. Restart dev server after adding variable
3. Check console for warnings
4. Verify subaccount code format: `ACCT_xxxxxxxxxx`

### **Subaccount Not Found Error**

**Problem:** Paystack returns "Subaccount not found"

**Solutions:**
1. Verify subaccount exists in dashboard
2. Check subaccount code is correct
3. Ensure subaccount is active
4. Use test subaccount in test mode

### **Settlement Not Received**

**Problem:** Payment successful but no settlement

**Solutions:**
1. Check settlement schedule in Paystack
2. Verify bank account is configured
3. Check subaccount settlement settings
4. Contact Paystack support if needed

---

## 📝 Environment Variables Summary

### **Required:**
```env
PAYSTACK_SECRET_KEY=sk_live_xxxxxxxxxxxxx
```

### **Optional (but recommended):**
```env
PAYSTACK_SUBACCOUNT_CODE=ACCT_xxxxxxxxxx
```

### **Other Existing Variables:**
```env
NEXT_PUBLIC_APP_URL=https://yourapp.com
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=xxx
RESEND_API_KEY=re_xxx
```

---

## 🎉 Summary

**What Changed:**
- ✅ Added subaccount support to Paystack library
- ✅ Automatic subaccount inclusion
- ✅ Environment variable configuration
- ✅ No code changes needed in API routes

**What You Need to Do:**
1. Get subaccount code from Paystack dashboard
2. Add `PAYSTACK_SUBACCOUNT_CODE` to `.env.local`
3. Restart dev server
4. Test a payment
5. Verify in Paystack dashboard

**Result:**
- All payments automatically route to your subaccount
- Clean separation between apps
- Easy accounting and reconciliation
- No impact on user experience

**Ready to use!** 🚀
