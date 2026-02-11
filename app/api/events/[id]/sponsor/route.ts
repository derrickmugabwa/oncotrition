// Event Sponsorship Registration API Route
// Handles sponsorship/partnership registrations for events

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { initializePayment, convertToKobo } from '@/lib/paystack';

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

    console.log('Sponsorship registration request for event:', eventId);
    console.log('Request body:', body);

    // Validate required fields
    const {
      companyName,
      contactPerson,
      email,
      phoneNumber,
      companyWebsite,
      industry,
      sponsorshipGoals,
      specialRequests,
      tierId,
    } = body;

    if (!companyName || !contactPerson || !email || !phoneNumber || !tierId) {
      console.error('Missing required fields:', {
        companyName: !!companyName,
        contactPerson: !!contactPerson,
        email: !!email,
        phoneNumber: !!phoneNumber,
        tierId: !!tierId,
      });
      return NextResponse.json(
        {
          error: 'Missing required fields: ' + [
            !companyName && 'companyName',
            !contactPerson && 'contactPerson',
            !email && 'email',
            !phoneNumber && 'phoneNumber',
            !tierId && 'tierId',
          ].filter(Boolean).join(', ')
        },
        { status: 400 }
      );
    }

    // Verify event exists and accepts sponsorships
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('*')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      console.error('Event not found:', eventError);
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.log('Event found:', {
      id: event.id,
      title: event.title,
      accepts_sponsorships: event.accepts_sponsorships,
      status: event.status,
    });

    if (!event.accepts_sponsorships) {
      console.error('Event does not accept sponsorships');
      return NextResponse.json(
        { error: 'This event does not accept sponsorships' },
        { status: 400 }
      );
    }

    // Check if event is still accepting sponsorships
    if (event.status !== 'upcoming') {
      console.error('Event is not accepting sponsorships:', { status: event.status });
      return NextResponse.json(
        { error: 'Sponsorship registration is closed for this event' },
        { status: 400 }
      );
    }

    // Check sponsorship deadline
    if (event.sponsorship_deadline) {
      const deadline = new Date(event.sponsorship_deadline);
      const now = new Date();
      if (now > deadline) {
        return NextResponse.json(
          { error: 'Sponsorship registration deadline has passed' },
          { status: 400 }
        );
      }
    }

    // Get tier details
    console.log('Looking up tier:', { tier_id: tierId, event_id: eventId });
    const { data: tier, error: tierError } = await supabase
      .from('event_sponsorship_tiers')
      .select('*')
      .eq('id', tierId)
      .eq('event_id', eventId)
      .eq('is_active', true)
      .single();

    if (tierError || !tier) {
      console.error('Tier not found:', tierError);
      return NextResponse.json(
        { error: 'Invalid sponsorship tier selected' },
        { status: 400 }
      );
    }

    console.log('Tier found:', tier);

    // Generate unique payment reference
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000000);
    const paymentReference = `SPONSOR-${timestamp}-${random}`;

    // Create sponsorship registration record
    const { data: registration, error: registrationError } = await supabase
      .from('event_sponsorship_registrations')
      .insert({
        event_id: eventId,
        tier_id: tierId,
        company_name: companyName,
        contact_person: contactPerson,
        email: email,
        phone_number: phoneNumber,
        company_website: companyWebsite || null,
        industry: industry || null,
        sponsorship_goals: sponsorshipGoals || null,
        special_requests: specialRequests || null,
        price_amount: tier.price,
        payment_status: 'pending',
        payment_reference: paymentReference,
      })
      .select()
      .single();

    if (registrationError || !registration) {
      console.error('Registration creation error:', registrationError);
      return NextResponse.json(
        { error: 'Failed to create sponsorship registration' },
        { status: 500 }
      );
    }

    // Initialize Paystack payment
    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/sponsorship/payment/verify?reference=${paymentReference}`;

    const paymentResult = await initializePayment({
      email: email,
      amount: convertToKobo(tier.price),
      reference: paymentReference,
      callback_url: callbackUrl,
      metadata: {
        registration_id: registration.id,
        event_id: eventId,
        event_title: event.title,
        company_name: companyName,
        tier_name: tier.tier_name,
        type: 'sponsorship',
      },
    });

    if (!paymentResult.status || !paymentResult.data) {
      // Delete the registration if payment initialization fails
      await supabase
        .from('event_sponsorship_registrations')
        .delete()
        .eq('id', registration.id);

      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    // Update registration with Paystack reference
    await supabase
      .from('event_sponsorship_registrations')
      .update({
        paystack_reference: paymentResult.data.reference,
      })
      .eq('id', registration.id);

    // Return payment URL
    return NextResponse.json({
      registrationId: registration.id,
      paymentUrl: paymentResult.data.authorization_url,
      amount: tier.price,
      reference: paymentReference,
    });
  } catch (error) {
    console.error('Sponsorship registration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
