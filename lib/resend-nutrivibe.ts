// Resend Email Service for NutriVibe

import { Resend } from 'resend';
import { NutrivibeRegistrationEmail } from '@/emails/NutrivibeRegistration';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendRegistrationEmailData {
  to: string;
  fullName: string;
  registrationId: string;
  qrCodeUrl: string;
  eventDetails: {
    event_date: string;
    event_time: string;
    location: string;
    venue_details: string | null;
  };
  participationType: string;
  amount: number;
}

/**
 * Send registration confirmation email with QR code
 */
export async function sendRegistrationEmail(data: SendRegistrationEmailData) {
  try {
    const { error } = await resend.emails.send({
      from: 'NutriVibe <events@oncotrition.com>',
      to: data.to,
      subject: 'NutriVibe Registration Confirmation - Your QR Code Inside',
      react: NutrivibeRegistrationEmail(data),
    });

    if (error) {
      console.error('Resend email error:', error);
      throw error;
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send registration email:', error);
    throw error;
  }
}

/**
 * Resend registration confirmation email
 */
export async function resendRegistrationEmail(registrationId: string) {
  // This function can be called from admin panel to resend emails
  // Implementation would fetch registration details and call sendRegistrationEmail
  return { success: true };
}
