// Paystack Payment Integration

interface PaystackInitializeData {
  email: string;
  amount: number; // In kobo (multiply by 100)
  reference: string;
  metadata?: any;
  callback_url: string;
  channels?: string[];
  subaccount?: string; // Paystack subaccount code
  transaction_charge?: number; // Amount to charge the subaccount (in kobo)
  bearer?: 'account' | 'subaccount'; // Who bears Paystack charges
}

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    id: number;
    domain: string;
    status: string;
    reference: string;
    amount: number;
    message: string | null;
    gateway_response: string;
    paid_at: string;
    created_at: string;
    channel: string;
    currency: string;
    ip_address: string;
    metadata: any;
    customer: {
      id: number;
      email: string;
      customer_code: string;
    };
    authorization: {
      authorization_code: string;
      bin: string;
      last4: string;
      exp_month: string;
      exp_year: string;
      channel: string;
      card_type: string;
      bank: string;
      country_code: string;
      brand: string;
    };
  };
}

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';
const PAYSTACK_SUBACCOUNT_CODE = process.env.PAYSTACK_SUBACCOUNT_CODE;

if (!PAYSTACK_SECRET_KEY) {
  console.warn('PAYSTACK_SECRET_KEY is not set in environment variables');
}

if (!PAYSTACK_SUBACCOUNT_CODE) {
  console.warn('PAYSTACK_SUBACCOUNT_CODE is not set - payments will go to main account');
}

/**
 * Initialize a Paystack payment transaction
 * Automatically includes subaccount if configured in environment
 */
export async function initializePayment(
  data: PaystackInitializeData
): Promise<PaystackInitializeResponse> {
  try {
    // Add subaccount if configured and not already provided
    const paymentData = {
      ...data,
      ...(PAYSTACK_SUBACCOUNT_CODE && !data.subaccount && {
        subaccount: PAYSTACK_SUBACCOUNT_CODE,
        bearer: data.bearer || 'subaccount', // Subaccount bears Paystack charges by default
      }),
    };

    const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to initialize payment');
    }

    const result: PaystackInitializeResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw error;
  }
}

/**
 * Verify a Paystack payment transaction
 */
export async function verifyPayment(
  reference: string
): Promise<PaystackVerifyResponse> {
  try {
    const response = await fetch(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to verify payment');
    }

    const result: PaystackVerifyResponse = await response.json();
    return result;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw error;
  }
}

/**
 * Generate a unique payment reference
 */
export function generatePaymentReference(prefix: string = 'NV'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000000);
  return `${prefix}-${timestamp}-${random}`;
}

/**
 * Convert amount to kobo (Paystack uses kobo for NGN)
 * For KES, Paystack uses pesewas (1 KES = 100 pesewas)
 */
export function convertToKobo(amount: number): number {
  return Math.round(amount * 100);
}

/**
 * Convert kobo back to main currency
 */
export function convertFromKobo(kobo: number): number {
  return kobo / 100;
}

/**
 * Get the configured Paystack subaccount code
 */
export function getSubaccountCode(): string | undefined {
  return PAYSTACK_SUBACCOUNT_CODE;
}
