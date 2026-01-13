// NutriVibe Payment Verification API

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/paystack';
import { generateQRCode } from '@/lib/qrcode';
import { sendRegistrationEmail } from '@/lib/resend-nutrivibe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const { reference } = await request.json();

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Get registration by payment reference
    const { data: registration, error: registrationError } = await supabase
      .from('nutrivibe_registrations')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (registrationError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (registration.payment_status === 'completed') {
      return NextResponse.json({
        success: true,
        registration,
        qrCodeUrl: registration.qr_code_url,
        message: 'Payment already verified',
      });
    }

    // Verify payment with Paystack
    const paymentVerification = await verifyPayment(reference);

    if (!paymentVerification.status || paymentVerification.data.status !== 'success') {
      // Update registration as failed
      await supabase
        .from('nutrivibe_registrations')
        .update({
          payment_status: 'failed',
        })
        .eq('id', registration.id);

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Get event details
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', registration.event_id)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Generate QR code
    const { qrCodeUrl, qrCodeData } = await generateQRCode(registration.id, {
      fullName: registration.full_name,
      email: registration.email,
      participationType: registration.participation_type,
      eventId: event.id,
      eventTitle: event.title,
    });

    // Update registration with payment success and QR code
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('nutrivibe_registrations')
      .update({
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        qr_code_url: qrCodeUrl,
        qr_code_data: qrCodeData,
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update registration:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      );
    }

    // Get event settings for email (fallback to nutrivibe_settings if needed)
    const { data: settings } = await supabase
      .from('nutrivibe_settings')
      .select('*')
      .eq('is_active', true)
      .single();

    // Send confirmation email
    try {
      await sendRegistrationEmail({
        to: registration.email,
        fullName: registration.full_name,
        registrationId: registration.id,
        qrCodeUrl: qrCodeUrl,
        eventDetails: settings || {
          event_date: '2026-11-08',
          event_time: '09:00:00',
          location: 'Radisson Blu Hotel Nairobi',
          venue_details: 'Upper Hill, Nairobi, Kenya',
        },
        participationType: registration.participation_type,
        amount: registration.price_amount,
      });

      // Mark email as sent
      await supabase
        .from('nutrivibe_registrations')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', registration.id);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      qrCodeUrl: qrCodeUrl,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
