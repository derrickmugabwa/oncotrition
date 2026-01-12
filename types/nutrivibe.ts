// NutriVibe Registration System Types

export interface NutrivibePricing {
  id: string;
  event_id: string;
  participation_type: string;
  price: number;
  description: string | null;
  is_active: boolean;
  display_order: number;
  created_at: string;
  updated_at: string;
}

export interface NutrivibeInterestArea {
  id: string;
  event_id: string; // NEW - Links to events table
  name: string;
  description: string | null;
  display_order: number;
  is_active: boolean;
  created_at: string;
}

export interface NutrivibeSettings {
  id: string;
  event_id: string; // NEW - Links to events table
  event_date: string;
  event_time: string;
  location: string;
  venue_details: string | null;
  max_capacity: number | null;
  registration_deadline: string | null;
  early_bird_deadline: string | null;
  early_bird_discount: number;
  terms_and_conditions: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface NutrivibeRegistration {
  id: string;
  event_id: string | null;
  full_name: string;
  organization: string | null;
  designation: string | null;
  email: string;
  phone_number: string;
  participation_type: string;
  participation_type_other: string | null;
  interest_areas: string[];
  interest_areas_other: string | null;
  networking_purpose: string | null;
  price_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_reference: string | null;
  paystack_reference: string | null;
  qr_code_url: string | null;
  qr_code_data: string | null;
  registration_date: string;
  payment_date: string | null;
  email_sent: boolean;
  email_sent_at: string | null;
  checked_in: boolean;
  checked_in_at: string | null;
  checked_in_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface RegistrationFormData {
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

export interface PaymentInitResponse {
  registrationId: string;
  paymentUrl: string;
  amount: number;
  reference: string;
}

export interface PaymentVerifyResponse {
  success: boolean;
  registration: NutrivibeRegistration;
  qrCodeUrl: string;
}

export interface RegistrationAnalytics {
  totalRegistrations: number;
  totalRevenue: number;
  paymentStatusBreakdown: {
    pending: number;
    completed: number;
    failed: number;
  };
  revenueByType: {
    [key: string]: number;
  };
  checkInRate: number;
  registrationsByDate: {
    date: string;
    count: number;
  }[];
}
