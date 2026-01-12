# NutriVibe Event Registration System - Implementation Plan

## Overview
Automated event registration system for NutriVibe sessions with dynamic pricing, payment processing via Paystack, QR code generation, and email notifications via Resend.

---

## System Architecture

### 1. User Flow
```
Event Details Page → Register Button → NutriVibe Registration Page → 
Form Submission → Paystack Payment → Payment Success → 
Email with QR Code + Event Details → Registration Complete
```

---

## Database Schema

### Table: `nutrivibe_registrations`
```sql
CREATE TABLE nutrivibe_registrations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID REFERENCES events(id) ON DELETE CASCADE,
  
  -- Personal Details
  full_name VARCHAR(255) NOT NULL,
  organization VARCHAR(255),
  designation VARCHAR(255),
  email VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  
  -- Participation Type (Radio Selection)
  participation_type VARCHAR(50) NOT NULL, -- 'nutrition_student', 'professional', 'healthcare_professional', 'institutional_representative', 'online_attendee'
  participation_type_other TEXT, -- If "Other" is selected
  
  -- Interest Areas (Checkboxes - stored as JSON array)
  interest_areas JSONB DEFAULT '[]'::jsonb, -- Array of selected interests
  interest_areas_other TEXT, -- If "Other" is selected
  
  -- Networking Purpose (Radio Selection)
  networking_purpose VARCHAR(100), -- 'innovator_product', 'panel_discussion', 'future_programs', 'additional_engagement'
  
  -- Payment Details
  price_amount DECIMAL(10, 2) NOT NULL,
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'completed', 'failed'
  payment_reference VARCHAR(255) UNIQUE,
  paystack_reference VARCHAR(255),
  
  -- QR Code
  qr_code_url TEXT,
  qr_code_data TEXT, -- Encrypted registration data
  
  -- Metadata
  registration_date TIMESTAMP DEFAULT NOW(),
  payment_date TIMESTAMP,
  email_sent BOOLEAN DEFAULT FALSE,
  email_sent_at TIMESTAMP,
  checked_in BOOLEAN DEFAULT FALSE,
  checked_in_at TIMESTAMP,
  checked_in_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_nutrivibe_event_id ON nutrivibe_registrations(event_id);
CREATE INDEX idx_nutrivibe_email ON nutrivibe_registrations(email);
CREATE INDEX idx_nutrivibe_payment_status ON nutrivibe_registrations(payment_status);
CREATE INDEX idx_nutrivibe_payment_reference ON nutrivibe_registrations(payment_reference);
```

### Table: `nutrivibe_pricing`
```sql
CREATE TABLE nutrivibe_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participation_type VARCHAR(50) UNIQUE NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Default pricing data
INSERT INTO nutrivibe_pricing (participation_type, price, description, display_order) VALUES
('nutrition_student', 2500.00, 'Nutrition students', 1),
('professional', 6000.00, 'Nutrition/Dietician/Nutritionist', 2),
('healthcare_professional', 6000.00, 'Healthcare Professional/Allied guest', 3),
('institutional_representative', 6000.00, 'Institutional Representative/Partner/Sponsor', 4),
('online_attendee', 6000.00, 'Online attendee', 5);
```

### Table: `nutrivibe_settings`
```sql
CREATE TABLE nutrivibe_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_date DATE NOT NULL,
  event_time TIME NOT NULL,
  location TEXT NOT NULL,
  venue_details TEXT,
  max_capacity INTEGER,
  registration_deadline TIMESTAMP,
  early_bird_deadline TIMESTAMP,
  early_bird_discount DECIMAL(5, 2) DEFAULT 0, -- Percentage discount
  terms_and_conditions TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Table: `nutrivibe_interest_areas`
```sql
CREATE TABLE nutrivibe_interest_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Default interest areas
INSERT INTO nutrivibe_interest_areas (name, display_order) VALUES
('Food Innovation & Product Development', 1),
('Health & Wellness Entrepreneurship', 2),
('Investment & Partnerships', 3),
('Additional Engagement Options', 4);
```

---

## Frontend Components

### 1. NutriVibe Registration Page (`/nutrivibe/register`)
**Location:** `/app/(site)/nutrivibe/register/page.tsx`

**Features:**
- Multi-step form with validation
- Dynamic pricing based on participation type
- Real-time price calculation
- Form sections:
  - Personal Details
  - Participation Type (with dynamic pricing display)
  - Interest Areas (checkboxes)
  - Networking Purpose
  - Payment Summary

**Component Structure:**
```
/components/nutrivibe/
  ├── RegistrationForm.tsx (Main form container)
  ├── PersonalDetailsStep.tsx
  ├── ParticipationTypeStep.tsx
  ├── InterestAreasStep.tsx
  ├── NetworkingPurposeStep.tsx
  ├── PaymentSummary.tsx
  └── RegistrationSuccess.tsx
```

### 2. Admin Management Pages

#### A. Pricing Management (`/admin/pages/nutrivibe/pricing`)
**Features:**
- View all pricing tiers
- Edit prices for each participation type
- Enable/disable pricing options
- Set early bird discounts

**Component:** `/components/admin/nutrivibe/PricingManagement.tsx`

#### B. Settings Management (`/admin/pages/nutrivibe/settings`)
**Features:**
- Event date, time, location
- Venue details
- Max capacity
- Registration deadline
- Terms and conditions

**Component:** `/components/admin/nutrivibe/SettingsManagement.tsx`

#### C. Registrations Tracking (`/admin/pages/nutrivibe/registrations`)
**Features:**
- List all registrations with filters:
  - Payment status
  - Participation type
  - Registration date range
  - Check-in status
- Export to CSV/Excel
- Search by name, email, phone
- View registration details
- Manual check-in (scan QR code)
- Resend confirmation email
- Payment status management
- Analytics dashboard:
  - Total registrations
  - Revenue by participation type
  - Payment status breakdown
  - Check-in rate

**Component:** `/components/admin/nutrivibe/RegistrationsTracking.tsx`

#### D. Interest Areas Management (`/admin/pages/nutrivibe/interest-areas`)
**Features:**
- Add/edit/delete interest areas
- Reorder display
- Enable/disable options

**Component:** `/components/admin/nutrivibe/InterestAreasManagement.tsx`

---

## API Routes

### 1. Registration Endpoints

#### `POST /api/nutrivibe/register`
**Purpose:** Create new registration and initiate payment
**Request Body:**
```typescript
{
  eventId: string;
  fullName: string;
  organization?: string;
  designation?: string;
  email: string;
  phoneNumber: string;
  participationType: string;
  participationTypeOther?: string;
  interestAreas: string[];
  interestAreasOther?: string;
  networkingPurpose?: string;
}
```
**Response:**
```typescript
{
  registrationId: string;
  paymentUrl: string; // Paystack payment URL
  amount: number;
  reference: string;
}
```

#### `POST /api/nutrivibe/verify-payment`
**Purpose:** Verify Paystack payment and update registration
**Request Body:**
```typescript
{
  reference: string;
}
```
**Response:**
```typescript
{
  success: boolean;
  registration: Registration;
  qrCodeUrl: string;
}
```

#### `GET /api/nutrivibe/pricing`
**Purpose:** Get all active pricing tiers
**Response:**
```typescript
{
  pricing: PricingTier[];
}
```

### 2. Admin Endpoints

#### `GET /api/admin/nutrivibe/registrations`
**Query Params:** `?status=completed&participationType=student&page=1&limit=50`

#### `PATCH /api/admin/nutrivibe/registrations/:id`
**Purpose:** Update registration (check-in, resend email, etc.)

#### `GET /api/admin/nutrivibe/analytics`
**Purpose:** Get registration analytics

#### `PUT /api/admin/nutrivibe/pricing/:id`
**Purpose:** Update pricing

#### `PUT /api/admin/nutrivibe/settings`
**Purpose:** Update event settings

---

## Payment Integration (Paystack)

### Setup
```typescript
// lib/paystack.ts
import axios from 'axios';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;

export async function initializePayment(data: {
  email: string;
  amount: number; // In kobo (multiply by 100)
  reference: string;
  metadata: any;
  callback_url: string;
}) {
  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    data,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function verifyPayment(reference: string) {
  const response = await axios.get(
    `https://api.paystack.co/transaction/verify/${reference}`,
    {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
      },
    }
  );
  return response.data;
}
```

### Payment Flow
1. User submits registration form
2. Backend creates registration with `payment_status: 'pending'`
3. Initialize Paystack payment with unique reference
4. Redirect user to Paystack payment page
5. User completes payment
6. Paystack redirects to callback URL: `/nutrivibe/payment/verify?reference=xxx`
7. Backend verifies payment with Paystack API
8. Update registration status to `completed`
9. Generate QR code
10. Send confirmation email
11. Show success page

---

## Email System (Resend)

### Setup
```typescript
// lib/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendRegistrationEmail(data: {
  to: string;
  fullName: string;
  eventDetails: EventDetails;
  qrCodeUrl: string;
  registrationId: string;
}) {
  await resend.emails.send({
    from: 'NutriVibe <events@oncotrition.com>',
    to: data.to,
    subject: 'NutriVibe Registration Confirmation',
    react: RegistrationConfirmationEmail(data),
  });
}
```

### Email Template Component
**Location:** `/emails/RegistrationConfirmation.tsx`

**Content:**
- Event logo
- Personalized greeting
- Event details (date, time, location)
- QR code (embedded image)
- Registration details
- Important instructions
- Contact information
- Calendar invite attachment

---

## QR Code Generation

### Setup
```typescript
// lib/qrcode.ts
import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

export async function generateQRCode(registrationId: string, data: any) {
  // Encrypt sensitive data
  const qrData = JSON.stringify({
    id: registrationId,
    name: data.fullName,
    email: data.email,
    type: data.participationType,
    timestamp: Date.now(),
  });

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
    width: 400,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
  });

  // Upload to Supabase Storage
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const fileName = `qr-codes/${registrationId}.png`;
  const buffer = Buffer.from(qrCodeDataUrl.split(',')[1], 'base64');

  const { data: uploadData, error } = await supabase.storage
    .from('nutrivibe')
    .upload(fileName, buffer, {
      contentType: 'image/png',
      upsert: true,
    });

  if (error) throw error;

  const { data: publicUrl } = supabase.storage
    .from('nutrivibe')
    .getPublicUrl(fileName);

  return {
    qrCodeUrl: publicUrl.publicUrl,
    qrCodeData: qrData,
  };
}
```

### QR Code Scanner (Admin)
**Component:** `/components/admin/nutrivibe/QRScanner.tsx`

**Features:**
- Camera-based QR code scanning
- Manual entry option
- Real-time validation
- Check-in confirmation
- Duplicate check-in prevention

---

## Security Considerations

### 1. Payment Security
- Never store card details
- Use Paystack's secure payment page
- Verify all payments server-side
- Implement webhook for payment notifications
- Use HTTPS only

### 2. Data Protection
- Encrypt sensitive data in QR codes
- Implement rate limiting on registration endpoint
- Validate all inputs server-side
- Use RLS (Row Level Security) in Supabase
- Sanitize user inputs

### 3. Email Security
- Use verified domain for sending emails
- Implement SPF, DKIM, DMARC records
- Rate limit email sending
- Validate email addresses

---

## Implementation Phases

### Phase 1: Database & Backend (Week 1)
- [ ] Create database tables and migrations
- [ ] Set up Supabase storage bucket for QR codes
- [ ] Implement API routes for registration
- [ ] Integrate Paystack payment
- [ ] Set up Resend email service
- [ ] Implement QR code generation

### Phase 2: Frontend Registration (Week 2)
- [ ] Create NutriVibe registration page
- [ ] Build multi-step form components
- [ ] Implement form validation
- [ ] Add dynamic pricing display
- [ ] Create payment verification page
- [ ] Build success page with QR code display

### Phase 3: Admin Dashboard (Week 3)
- [ ] Pricing management interface
- [ ] Settings management interface
- [ ] Registrations tracking dashboard
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] QR code scanner for check-in

### Phase 4: Email Templates & Testing (Week 4)
- [ ] Design email templates
- [ ] Implement email sending logic
- [ ] Test payment flow end-to-end
- [ ] Test email delivery
- [ ] QR code scanning tests
- [ ] Load testing

### Phase 5: Polish & Launch (Week 5)
- [ ] UI/UX refinements
- [ ] Mobile responsiveness
- [ ] Error handling improvements
- [ ] Documentation
- [ ] Deployment
- [ ] Monitoring setup

---

## Environment Variables

```env
# Paystack
PAYSTACK_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_xxx

# Resend
RESEND_API_KEY=re_xxx

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://oncotrition.com
```

---

## Testing Checklist

### Registration Flow
- [ ] Form validation works correctly
- [ ] Pricing calculates accurately
- [ ] Payment initialization succeeds
- [ ] Payment verification works
- [ ] QR code generates correctly
- [ ] Email sends successfully
- [ ] Success page displays properly

### Admin Features
- [ ] Can view all registrations
- [ ] Filters work correctly
- [ ] Export functionality works
- [ ] Can update pricing
- [ ] Can update settings
- [ ] QR scanner works
- [ ] Analytics display correctly

### Edge Cases
- [ ] Duplicate email handling
- [ ] Payment failure handling
- [ ] Email delivery failure
- [ ] Network interruption during payment
- [ ] Invalid QR codes
- [ ] Concurrent registrations

---

## Success Metrics

1. **Registration Conversion Rate:** >80% of started registrations complete payment
2. **Email Delivery Rate:** >95% of confirmation emails delivered
3. **Check-in Speed:** <5 seconds per attendee using QR code
4. **Payment Success Rate:** >98% of payment attempts succeed
5. **User Satisfaction:** Positive feedback on registration experience

---

## Future Enhancements

1. **Waitlist Management:** Auto-notify when spots open up
2. **Group Registrations:** Discounts for multiple attendees
3. **Referral System:** Discount codes for referrals
4. **Mobile App:** Native app for check-in
5. **SMS Notifications:** Send reminders via SMS
6. **Certificate Generation:** Auto-generate attendance certificates
7. **Feedback Collection:** Post-event survey integration
8. **Social Sharing:** Share registration on social media

---

## Support & Maintenance

### Monitoring
- Set up error tracking (Sentry)
- Monitor payment success rates
- Track email delivery rates
- Monitor API response times

### Backup
- Daily database backups
- QR code storage redundancy
- Email template versioning

### Documentation
- API documentation
- Admin user guide
- Troubleshooting guide
- FAQs for attendees
