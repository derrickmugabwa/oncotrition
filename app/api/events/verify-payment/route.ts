// Event Payment Verification API Route
// Generic payment verification for any event registration

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/paystack';
import { generateQRCode, uploadQRCodeToSupabase } from '@/lib/qrcode';
import { sendRegistrationEmail } from '@/lib/resend-nutrivibe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { reference } = body;

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
      // Get event details
      const { data: event } = await supabase
        .from('events')
        .select('*')
        .eq('id', registration.event_id)
        .single();

      return NextResponse.json({
        success: true,
        registration,
        event,
        qrCodeUrl: registration.qr_code_url,
        message: 'Payment already verified',
      });
    }

    // Verify payment with Paystack
    const paymentVerification = await verifyPayment(reference);

    if (!paymentVerification.success || paymentVerification.data?.status !== 'success') {
      // Update registration status to failed
      await supabase
        .from('nutrivibe_registrations')
        .update({
          payment_status: 'failed',
          updated_at: new Date().toISOString(),
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

    // Generate QR Code
    const qrData = {
      id: registration.id,
      name: registration.full_name,
      email: registration.email,
      type: registration.participation_type,
      event_id: registration.event_id,
      event_title: event.title,
      timestamp: Date.now(),
    };

    const qrCodeBuffer = await generateQRCode(JSON.stringify(qrData));
    const qrCodeUrl = await uploadQRCodeToSupabase(
      qrCodeBuffer,
      `${registration.id}.png`,
      'nutrivibe/qr-codes'
    );

    // Update registration with payment confirmation and QR code
    const { error: updateError } = await supabase
      .from('nutrivibe_registrations')
      .update({
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        qr_code_url: qrCodeUrl,
        qr_code_data: JSON.stringify(qrData),
        updated_at: new Date().toISOString(),
      })
      .eq('id', registration.id);

    if (updateError) {
      console.error('Failed to update registration:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration' },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      await sendRegistrationEmail({
        to: registration.email,
        registrationId: registration.id,
        fullName: registration.full_name,
        eventTitle: event.title,
        eventDate: event.event_date,
        eventTime: event.event_time,
        eventLocation: event.location,
        venueDetails: event.venue_details || '',
        participationType: registration.participation_type,
        amount: registration.price_amount,
        qrCodeUrl: qrCodeUrl,
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

    // Get updated registration
    const { data: updatedRegistration } = await supabase
      .from('nutrivibe_registrations')
      .select('*')
      .eq('id', registration.id)
      .single();

    return NextResponse.json({
      success: true,
      registration: updatedRegistration,
      event,
      qrCodeUrl,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
