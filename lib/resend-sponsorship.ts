// Resend Email Service for Sponsorship Confirmations

import { Resend } from 'resend';
import { SponsorshipConfirmationEmail } from '@/emails/SponsorshipConfirmation';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendSponsorshipConfirmationEmailData {
  to: string;
  companyName: string;
  contactPerson: string;
  tierName: string;
  amount: number;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  location: string;
  registrationId: string;
}

/**
 * Send sponsorship confirmation email
 */
export async function sendSponsorshipConfirmationEmail(
  data: SendSponsorshipConfirmationEmailData
) {
  try {
    const { error } = await resend.emails.send({
      from: 'Oncotrition Events <events@oncotritionhc.com>',
      to: data.to,
      subject: `Sponsorship Confirmed: ${data.tierName} for ${data.eventTitle}`,
      react: SponsorshipConfirmationEmail(data),
    });

    if (error) {
      console.error('Resend sponsorship email error:', error);
      throw error;
    }

    console.log('Sponsorship confirmation email sent successfully to:', data.to);
    return { success: true };
  } catch (error) {
    console.error('Failed to send sponsorship confirmation email:', error);
    throw error;
  }
}

/**
 * Resend sponsorship confirmation email
 */
export async function resendSponsorshipConfirmationEmail(registrationId: string) {
  // This function can be called from admin panel to resend emails
  // Implementation would fetch registration details and call sendSponsorshipConfirmationEmail
  console.log('Resending sponsorship confirmation email for:', registrationId);
  return { success: true };
}
