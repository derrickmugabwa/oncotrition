// Event Sponsorship System Types

export interface SponsorshipTier {
  id: string;
  event_id: string;
  tier_name: string;
  price: number;
  description: string | null;
  display_order: number | null;
  is_active: boolean | null;
  is_recommended: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  benefits?: SponsorshipBenefit[];
}

export interface SponsorshipBenefit {
  id: string;
  tier_id: string;
  benefit_text: string;
  display_order: number | null;
  created_at: string | null;
}

export interface SponsorshipRegistration {
  id: string;
  event_id: string;
  tier_id: string | null;
  company_name: string;
  contact_person: string;
  email: string;
  phone_number: string;
  company_website: string | null;
  industry: string | null;
  sponsorship_goals: string | null;
  special_requests: string | null;
  price_amount: number;
  payment_status: 'pending' | 'completed' | 'failed';
  payment_reference: string;
  paystack_reference: string | null;
  payment_date: string | null;
  contract_signed: boolean | null;
  contract_signed_at: string | null;
  email_sent: boolean | null;
  email_sent_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  // Joined data
  tier?: SponsorshipTier;
}

export interface SponsorshipFormData {
  companyName: string;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  companyWebsite?: string;
  industry?: string;
  sponsorshipGoals?: string;
  specialRequests?: string;
  tierId: string;
}

export interface SponsorshipPaymentInitResponse {
  registrationId: string;
  paymentUrl: string;
  amount: number;
  reference: string;
}

export interface SponsorshipPaymentVerifyResponse {
  success: boolean;
  registration: SponsorshipRegistration;
  event: {
    id: string;
    title: string;
    event_date: string;
    event_time: string;
    location: string;
  };
}

export interface SponsorshipAnalytics {
  totalSponsorships: number;
  completedSponsorships: number;
  pendingSponsorships: number;
  totalRevenue: number;
  revenueByTier: {
    [tierName: string]: number;
  };
  contractSignedCount: number;
}

// Admin form types
export interface SponsorshipTierFormData {
  tier_name: string;
  price: number;
  description?: string;
  display_order: number;
  is_active: boolean;
}

export interface SponsorshipBenefitFormData {
  benefit_text: string;
  display_order: number;
}
