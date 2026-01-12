// Event Registration API Route
// Generic registration endpoint for any event with internal registration

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializePayment } from '@/lib/paystack';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    // Validate required fields
    const {
      fullName,
      email,
      phoneNumber,
      participationType,
      interestAreas,
      organization,
      designation,
      participationTypeOther,
      interestAreasOther,
      networkingPurpose,
    } = body;

    if (!fullName || !email || !phoneNumber || !participationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify event exists and has internal registration enabled
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    if (!event.has_internal_registration || event.registration_type !== 'internal') {
      return NextResponse.json(
        { error: 'This event does not support internal registration' },
        { status: 400 }
      );
    }

    // Check if event is still accepting registrations
    if (event.status !== 'upcoming') {
      return NextResponse.json(
        { error: 'Registration is closed for this event' },
        { status: 400 }
      );
    }

    // Check registration deadline
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline);
      const now = new Date();
      if (now > deadline) {
        return NextResponse.json(
          { error: 'Registration deadline has passed' },
          { status: 400 }
        );
      }
    }

    // Get pricing for the selected participation type
    const { data: pricing, error: pricingError } = await supabase
      .from('nutrivibe_pricing')
      .select('*')
      .eq('event_id', eventId)
      .eq('participation_type', participationType)
      .eq('is_active', true)
      .single();

    if (pricingError || !pricing) {
      return NextResponse.json(
        { error: 'Invalid participation type' },
        { status: 400 }
      );
    }

    // Check for duplicate registration (same email, same event, completed payment)
    const { data: existingRegistration } = await supabase
      .from('nutrivibe_registrations')
      .select('id, payment_status')
      .eq('event_id', eventId)
      .eq('email', email)
      .eq('payment_status', 'completed')
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'You have already registered for this event with this email address' },
        { status: 400 }
      );
    }

    // Generate unique payment reference
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const paymentReference = `EVT-${timestamp}-${random}`;

    // Create registration record
    const { data: registration, error: registrationError } = await supabase
      .from('nutrivibe_registrations')
      .insert({
        event_id: eventId,
        full_name: fullName,
        organization: organization || null,
        designation: designation || null,
        email: email,
        phone_number: phoneNumber,
        participation_type: participationType,
        participation_type_other: participationTypeOther || null,
        interest_areas: interestAreas || [],
        interest_areas_other: interestAreasOther || null,
        networking_purpose: networkingPurpose || null,
        price_amount: pricing.price,
        payment_status: 'pending',
        payment_reference: paymentReference,
        registration_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (registrationError || !registration) {
      console.error('Registration creation error:', registrationError);
      return NextResponse.json(
        { error: 'Failed to create registration' },
        { status: 500 }
      );
    }

    // Initialize Paystack payment
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/payment/verify?reference=${paymentReference}`;
    
    const paymentResult = await initializePayment({
      email: email,
      amount: pricing.price,
      reference: paymentReference,
      callback_url: callbackUrl,
      metadata: {
        registration_id: registration.id,
        event_id: eventId,
        event_title: event.title,
        full_name: fullName,
        participation_type: participationType,
      },
    });

    if (!paymentResult.success || !paymentResult.data) {
      // Delete the registration if payment initialization fails
      await supabase
        .from('nutrivibe_registrations')
        .delete()
        .eq('id', registration.id);

      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // Update registration with Paystack reference
    await supabase
      .from('nutrivibe_registrations')
      .update({
        paystack_reference: paymentResult.data.reference,
      })
      .eq('id', registration.id);

    // Return payment URL
    return NextResponse.json({
      registrationId: registration.id,
      paymentUrl: paymentResult.data.authorization_url,
      amount: pricing.price,
      reference: paymentReference,
    });
  } catch (error) {
    console.error('Registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
