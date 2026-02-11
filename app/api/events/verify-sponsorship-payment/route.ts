// Sponsorship Payment Verification API
// Verifies Paystack payment for sponsorship registrations

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyPayment } from '@/lib/paystack';
import { sendSponsorshipConfirmationEmail } from '@/lib/resend-sponsorship';

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

    console.log('Verifying sponsorship payment:', reference);

    // Find the registration by payment reference
    const { data: registration, error: regError } = await supabase
      .from('event_sponsorship_registrations')
      .select('*')
      .eq('payment_reference', reference)
      .single();

    if (regError || !registration) {
      console.error('Registration not found:', regError);
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check if already verified
    if (registration.payment_status === 'completed') {
      console.log('Payment already verified');
      
      // Fetch event and tier details
      const { data: event } = await supabase
        .from('events')
        .select('id, title, event_date, event_time, location')
        .eq('id', registration.event_id)
        .single();

      const { data: tier } = await supabase
        .from('event_sponsorship_tiers')
        .select('tier_name')
        .eq('id', registration.tier_id)
        .single();

      return NextResponse.json({
        success: true,
        registration: {
          ...registration,
          tier_name: tier?.tier_name,
        },
        event,
      });
    }

    // Verify payment with Paystack
    const paymentVerification = await verifyPayment(reference);

    if (!paymentVerification.status || paymentVerification.data.status !== 'success') {
      // Update registration as failed
      await supabase
        .from('event_sponsorship_registrations')
        .update({
          payment_status: 'failed',
        })
        .eq('id', registration.id);

      return NextResponse.json(
        { error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    // Payment successful - update registration
    const { data: updatedRegistration, error: updateError } = await supabase
      .from('event_sponsorship_registrations')
      .update({
        payment_status: 'completed',
        payment_date: new Date().toISOString(),
        paystack_reference: paymentVerification.data.reference,
      })
      .eq('id', registration.id)
      .select()
      .single();

    if (updateError) {
      console.error('Failed to update registration:', updateError);
      return NextResponse.json(
        { error: 'Failed to update registration status' },
        { status: 500 }
      );
    }

    // Fetch event details
    const { data: event } = await supabase
      .from('events')
      .select('id, title, event_date, event_time, location')
      .eq('id', registration.event_id)
      .single();

    // Fetch tier details
    const { data: tier } = await supabase
      .from('event_sponsorship_tiers')
      .select('tier_name')
      .eq('id', registration.tier_id)
      .single();

    // Send confirmation email
    try {
      await sendSponsorshipConfirmationEmail({
        to: registration.email,
        companyName: registration.company_name,
        contactPerson: registration.contact_person,
        tierName: tier?.tier_name || 'Sponsorship',
        amount: registration.price_amount,
        eventTitle: event?.title || 'Event',
        eventDate: event?.event_date || '',
        eventTime: event?.event_time || '',
        location: event?.location || '',
        registrationId: registration.id,
      });

      // Mark email as sent
      await supabase
        .from('event_sponsorship_registrations')
        .update({
          email_sent: true,
          email_sent_at: new Date().toISOString(),
        })
        .eq('id', registration.id);

      console.log('Sponsorship confirmation email sent successfully to:', registration.email);
    } catch (emailError) {
      console.error('Failed to send sponsorship confirmation email:', emailError);
      // Don't fail the entire request if email fails
      // The payment was successful, email can be resent later
    }

    return NextResponse.json({
      success: true,
      registration: {
        ...updatedRegistration,
        tier_name: tier?.tier_name,
      },
      event,
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
