// NutriVibe Registration API

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializePayment, generatePaymentReference, convertToKobo } from '@/lib/paystack';
import { RegistrationFormData } from '@/types/nutrivibe';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body: RegistrationFormData = await request.json();

    // Validate required fields
    if (!body.fullName || !body.email || !body.phoneNumber || !body.participationType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get pricing for the selected participation type
    const { data: pricing, error: pricingError } = await supabase
      .from('nutrivibe_pricing')
      .select('*')
      .eq('participation_type', body.participationType)
      .eq('is_active', true)
      .single();

    if (pricingError || !pricing) {
      return NextResponse.json(
        { error: 'Invalid participation type or pricing not found' },
        { status: 400 }
      );
    }

    // Check if email already registered
    const { data: existingRegistration } = await supabase
      .from('nutrivibe_registrations')
      .select('id, payment_status')
      .eq('email', body.email)
      .eq('payment_status', 'completed')
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'This email is already registered for the event' },
        { status: 409 }
      );
    }

    // Generate payment reference
    const paymentReference = generatePaymentReference('NV');

    // Create registration record
    const { data: registration, error: registrationError } = await supabase
      .from('nutrivibe_registrations')
      .insert({
        full_name: body.fullName,
        organization: body.organization || null,
        designation: body.designation || null,
        email: body.email,
        phone_number: body.phoneNumber,
        participation_type: body.participationType,
        participation_type_other: body.participationTypeOther || null,
        interest_areas: body.interestAreas || [],
        interest_areas_other: body.interestAreasOther || null,
        networking_purpose: body.networkingPurpose || null,
        price_amount: pricing.price,
        payment_status: 'pending',
        payment_reference: paymentReference,
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
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/nutrivibe/payment/verify?reference=${paymentReference}`;

    const paymentData = await initializePayment({
      email: body.email,
      amount: convertToKobo(pricing.price),
      reference: paymentReference,
      callback_url: callbackUrl,
      metadata: {
        registration_id: registration.id,
        full_name: body.fullName,
        participation_type: body.participationType,
      },
      channels: ['card', 'mobile_money'], // Enable card and mobile money payments
    });

    if (!paymentData.status) {
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
      .update({ paystack_reference: paymentData.data.reference })
      .eq('id', registration.id);

    return NextResponse.json({
      registrationId: registration.id,
      paymentUrl: paymentData.data.authorization_url,
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
