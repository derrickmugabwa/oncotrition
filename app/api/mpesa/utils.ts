import axios, { AxiosError } from 'axios';

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

  const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`Attempting to get access token (attempt ${attempt}/${retries})...`);
      
      const response = await axios.get(
        `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`,
        {
          headers: {
            Authorization: `Basic ${auth}`,
          },
          timeout: 10000, // 10 second timeout
        }
      );
      
      if (!response.data.access_token) {
        throw new Error('No access token in response: ' + JSON.stringify(response.data));
      }
      
      console.log('Successfully obtained access token');
      return response.data.access_token;
    } catch (error) {
      lastError = error as Error;
      const axiosError = error as AxiosError;
      
      console.error(`Failed to get access token (attempt ${attempt}/${retries}):`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        data: axiosError.response?.data,
        message: axiosError.message
      });

      if (attempt < retries) {
        const backoffMs = Math.min(1000 * Math.pow(2, attempt - 1), 5000); // Exponential backoff, max 5 seconds
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
  const shortcode = process.env.MPESA_SHORTCODE;
  const passkey = process.env.MPESA_PASSKEY;
  const str = `${shortcode}${passkey}${timestamp}`;
  return Buffer.from(str).toString('base64');
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
