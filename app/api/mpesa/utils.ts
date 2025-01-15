import { setTimeout } from 'timers';

async function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getAccessToken(retries = 3): Promise<string> {
  const consumerKey = process.env.MPESA_CONSUMER_KEY;
  const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
  const baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

  if (!consumerKey || !consumerSecret) {
    throw new Error('Missing M-Pesa credentials. Please check MPESA_CONSUMER_KEY and MPESA_CONSUMER_SECRET in environment variables.');
  }

  console.log('Debug: Using credentials:', {
    baseUrl,
    consumerKeyLength: consumerKey.length,
    consumerSecretLength: consumerSecret.length,
    consumerKeyStart: consumerKey.substring(0, 4) + '...',
    consumerSecretStart: consumerSecret.substring(0, 4) + '...'
  });

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  console.log('Debug: Basic auth token:', auth);
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to get access token (attempt ${attempt}/${retries})...`);
      
      const url = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
      console.log('Debug: Making request to:', url);
      
      const requestHeaders = {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      };
      console.log('Debug: Request headers:', {
        ...requestHeaders,
        'Authorization': 'Basic [REDACTED]'
      });

      const response = await fetch(url, {
        method: 'GET',
        headers: requestHeaders,
        cache: 'no-store'
      });

      console.log('Debug: Response status:', response.status);
      console.log('Debug: Response status text:', response.statusText);
      
      const responseHeaders = Object.fromEntries(response.headers.entries());
      console.log('Debug: Response headers:', responseHeaders);

      const contentType = response.headers.get('content-type');
      console.log('Debug: Content-Type:', contentType);

      const responseText = await response.text();
      console.log('Debug: Raw response text:', responseText);
      console.log('Debug: Response text length:', responseText.length);

      if (!responseText) {
        throw new Error('Empty response from M-Pesa API');
      }

      let data;
      try {
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error(`Invalid JSON response: ${responseText}`);
      }

      console.log('Debug: Parsed response:', data);

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${JSON.stringify(data)}`);
      }

      if (!data?.access_token) {
        throw new Error(`No access token in response: ${JSON.stringify(data)}`);
      }
      
      console.log('Successfully obtained access token');
      return data.access_token;
    } catch (error) {
      lastError = error as Error;
      console.error('Debug: Access token error:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        name: error instanceof Error ? error.name : 'Unknown'
      });

      if (attempt < retries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
        console.log(`Retrying in ${backoffMs}ms...`);
        await delay(backoffMs);
      }
    }
  }

  throw new Error(`Failed to get access token after ${retries} attempts. Last error: ${lastError?.message}`);
}

export function generateTimestamp() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  const second = String(date.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

export function generatePassword(timestamp: string) {
  const shortcode = process.env.MPESA_BUSINESS_SHORT_CODE;
  const passkey = process.env.MPESA_PASSKEY;

  if (!shortcode || !passkey) {
    throw new Error('Missing required environment variables for password generation: MPESA_BUSINESS_SHORT_CODE, MPESA_PASSKEY');
  }

  console.log('Generating password with:', {
    shortcode,
    passkey,
    timestamp
  });

  const str = shortcode + passkey + timestamp;
  const password = Buffer.from(str).toString('base64');

  console.log('Generated password:', {
    input: str,
    output: password
  });

  return password;
}

export function formatPhoneNumber(phone: string): string {
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // If the number starts with '0', replace it with '254'
  if (cleaned.startsWith('0')) {
    return '254' + cleaned.slice(1);
  }
  
  // If the number starts with '+254', remove the '+'
  if (cleaned.startsWith('254')) {
    return cleaned;
  }
  
  // Otherwise, assume it's a complete number
  return cleaned;
}

export function validatePhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return /^(?:254|\+254|0)?([17]\d{8})$/.test(cleaned);
}
