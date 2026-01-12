// QR Code Generation for NutriVibe Registrations

import QRCode from 'qrcode';
import { createClient } from '@supabase/supabase-js';

interface QRCodeData {
  id: string;
  name: string;
  email: string;
  type: string;
  timestamp: number;
}

interface GenerateQRCodeResult {
  qrCodeUrl: string;
  qrCodeData: string;
}

/**
 * Generate QR code for a registration and upload to Supabase storage
 */
export async function generateQRCode(
  registrationId: string,
  data: {
    fullName: string;
    email: string;
    participationType: string;
  }
): Promise<GenerateQRCodeResult> {
  try {
    // Create QR code data object
    const qrData: QRCodeData = {
      id: registrationId,
      name: data.fullName,
      email: data.email,
      type: data.participationType,
      timestamp: Date.now(),
    };

    const qrDataString = JSON.stringify(qrData);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, {
      width: 500,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      errorCorrectionLevel: 'H', // High error correction
    });

    // Initialize Supabase client with service role key for storage access
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Convert data URL to buffer
    const base64Data = qrCodeDataUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Upload to Supabase Storage
    const fileName = `nutrivibe/qr-codes/${registrationId}.png`;

    const { error: uploadError } = await supabase.storage
      .from('images')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true,
      });

    if (uploadError) {
      console.error('QR code upload error:', uploadError);
      throw new Error(`Failed to upload QR code: ${uploadError.message}`);
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('images')
      .getPublicUrl(fileName);

    return {
      qrCodeUrl: publicUrlData.publicUrl,
      qrCodeData: qrDataString,
    };
  } catch (error) {
    console.error('QR code generation error:', error);
    throw error;
  }
}

/**
 * Verify QR code data
 */
export function verifyQRCode(qrCodeData: string): QRCodeData | null {
  try {
    const data: QRCodeData = JSON.parse(qrCodeData);
    
    // Validate required fields
    if (!data.id || !data.name || !data.email || !data.type || !data.timestamp) {
      return null;
    }

    // Check if QR code is not too old (e.g., 1 year)
    const oneYearInMs = 365 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > oneYearInMs) {
      return null;
    }

    return data;
  } catch (error) {
    console.error('QR code verification error:', error);
    return null;
  }
}

/**
 * Generate QR code as base64 string (for email embedding)
 */
export async function generateQRCodeBase64(
  registrationId: string,
  data: {
    fullName: string;
    email: string;
    participationType: string;
  }
): Promise<string> {
  const qrData: QRCodeData = {
    id: registrationId,
    name: data.fullName,
    email: data.email,
    type: data.participationType,
    timestamp: Date.now(),
  };

  const qrDataString = JSON.stringify(qrData);

  // Generate QR code as data URL
  const qrCodeDataUrl = await QRCode.toDataURL(qrDataString, {
    width: 500,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF',
    },
    errorCorrectionLevel: 'H',
  });

  return qrCodeDataUrl;
}
