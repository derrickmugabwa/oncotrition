// Admin API: Event Check-in

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Search registration by email
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      );
    }

    // Find registration by email
    const { data: registration, error } = await supabase
      .from('nutrivibe_registrations')
      .select('*')
      .eq('event_id', eventId)
      .eq('email', email.toLowerCase())
      .eq('payment_status', 'completed')
      .single();

    if (error || !registration) {
      return NextResponse.json(
        { error: 'Registration not found or payment not completed' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      registration,
      qrCodeData: registration.qr_code_data,
    });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Check in attendee
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { registrationId } = body;

    if (!registrationId) {
      return NextResponse.json(
        { error: 'Registration ID required' },
        { status: 400 }
      );
    }

    // Fetch registration
    const { data: registration, error: fetchError } = await supabase
      .from('nutrivibe_registrations')
      .select('*')
      .eq('id', registrationId)
      .eq('event_id', eventId)
      .single();

    if (fetchError || !registration) {
      return NextResponse.json(
        { error: 'Registration not found' },
        { status: 404 }
      );
    }

    // Check payment status
    if (registration.payment_status !== 'completed') {
      return NextResponse.json(
        { error: 'Payment not completed for this registration' },
        { status: 400 }
      );
    }

    // Check if already checked in
    if (registration.checked_in) {
      return NextResponse.json({
        success: true,
        alreadyCheckedIn: true,
        registration,
        message: 'Attendee already checked in',
      });
    }

    // Update check-in status
    const { data: updated, error: updateError } = await supabase
      .from('nutrivibe_registrations')
      .update({
        checked_in: true,
        checked_in_at: new Date().toISOString(),
      })
      .eq('id', registrationId)
      .select()
      .single();

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update check-in status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      alreadyCheckedIn: false,
      registration: updated,
      message: 'Check-in successful',
    });
  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
