import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';
import { publicSupabase } from '@/lib/supabase/public';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('event_bookings')
      .select(`
        *,
        mentorship_events (
          name,
          date,
          total_slots,
          available_slots
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Received booking request:', body);
    const { eventId, name, email, phone, amount, payment_status } = body;

    // Validate required fields
    if (!eventId || !name || !email || !phone || amount === undefined) {
      const missingFields = [];
      if (!eventId) missingFields.push('eventId');
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!phone) missingFields.push('phone');
      if (amount === undefined) missingFields.push('amount');

      console.error('Missing required fields:', missingFields);
      return NextResponse.json(
        { 
          error: 'Missing required fields',
          details: `Missing fields: ${missingFields.join(', ')}`
        },
        { status: 400 }
      );
    }

    console.log('Checking event availability:', { eventId });
    // Check if there are available slots
    const { data: event, error: eventError } = await publicSupabase
      .from('mentorship_events')
      .select('available_slots, name')
      .eq('id', eventId)
      .single();

    if (eventError) {
      console.error('Error fetching event:', {
        error: eventError,
        code: eventError.code,
        message: eventError.message,
        details: eventError.details
      });
      return NextResponse.json(
        { 
          error: 'Failed to fetch event details',
          details: eventError.message,
          code: eventError.code
        },
        { status: 500 }
      );
    }

    if (!event) {
      console.error('Event not found:', { eventId });
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    console.log('Event data:', event);

    if (event.available_slots <= 0) {
      console.error('No available slots:', { 
        eventId, 
        eventName: event.name,
        availableSlots: event.available_slots 
      });
      return NextResponse.json(
        { error: 'No available slots for this event' },
        { status: 400 }
      );
    }

    console.log('Creating booking record:', {
      eventId,
      name,
      email,
      phone,
      amount,
      payment_status
    });

    // Create booking using public client
    const { data: booking, error: bookingError } = await publicSupabase
      .from('event_bookings')
      .insert([
        {
          event_id: eventId,
          name,
          email,
          phone,
          amount,
          payment_status: payment_status || 'pending',
          booking_status: 'pending',
          payment_phone: phone
        }
      ])
      .select()
      .single();

    if (bookingError) {
      console.error('Error creating booking:', {
        error: bookingError,
        code: bookingError.code,
        message: bookingError.message,
        details: bookingError.details,
        hint: bookingError.hint
      });
      
      // Check for specific error types
      if (bookingError.code === '23503') {
        return NextResponse.json(
          { 
            error: 'Invalid event reference',
            details: 'The specified event does not exist'
          },
          { status: 400 }
        );
      }
      
      if (bookingError.code === '42501') {
        return NextResponse.json(
          { 
            error: 'Permission denied',
            details: 'You do not have permission to create bookings'
          },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to create booking',
          details: bookingError.message,
          code: bookingError.code,
          hint: bookingError.hint
        },
        { status: 500 }
      );
    }

    console.log('Booking created successfully:', booking);
    return NextResponse.json(booking);
  } catch (error: any) {
    console.error('Detailed error creating booking:', {
      error,
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint
    });
    return NextResponse.json(
      { 
        error: 'Failed to create booking',
        details: error.message || 'Unknown error',
        code: error.code,
        hint: error.hint
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { bookingId, status } = body;

    console.log('[PATCH] Request:', { bookingId, status });

    if (!bookingId || !status) {
      console.error('[PATCH] Missing required fields:', { bookingId, status });
      return NextResponse.json(
        { error: 'Booking ID and status are required' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      console.error('[PATCH] Invalid status:', status);
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: booking, error: fetchError } = await supabase
      .from('event_bookings')
      .select(`
        *,
        mentorship_events!inner (
          id,
          name,
          date,
          total_slots,
          available_slots
        )
      `)
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      console.error('[PATCH] Error fetching booking:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch booking details' },
        { status: 500 }
      );
    }

    // Check if we need to update slots
    if (status === 'approved' && (booking as any).booking_status !== 'approved') {
      // Check if slots are available
      if ((booking as any).mentorship_events.available_slots <= 0) {
        console.error('[PATCH] No available slots');
        return NextResponse.json(
          { error: 'No available slots for this event' },
          { status: 400 }
        );
      }

      // Update event slots
      const { error: slotError } = await supabase
        .from('mentorship_events')
        .update({ 
          available_slots: (booking as any).mentorship_events.available_slots - 1,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', (booking as any).mentorship_events.id);

      if (slotError) {
        console.error('[PATCH] Error updating slots:', slotError);
        return NextResponse.json(
          { error: 'Failed to update event slots' },
          { status: 500 }
        );
      }
    } else if (status === 'rejected' && (booking as any).booking_status === 'approved') {
      // If rejecting a previously approved booking, increment the slots
      const { error: slotError } = await supabase
        .from('mentorship_events')
        .update({ 
          available_slots: (booking as any).mentorship_events.available_slots + 1,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', (booking as any).mentorship_events.id);

      if (slotError) {
        console.error('[PATCH] Error updating slots:', slotError);
        return NextResponse.json(
          { error: 'Failed to update event slots' },
          { status: 500 }
        );
      }
    }

    // Update booking status
    const { data: updatedBooking, error: updateError } = await supabase
      .from('event_bookings')
      .update({ booking_status: status } as any)
      .eq('id', bookingId)
      .select(`
        *,
        mentorship_events!inner (
          id,
          name,
          date,
          total_slots,
          available_slots
        )
      `)
      .single();

    if (updateError) {
      console.error('[PATCH] Update error:', updateError);
      return NextResponse.json(
        { error: `Failed to update booking: ${updateError.message}` },
        { status: 500 }
      );
    }

    if (!updatedBooking) {
      console.error('[PATCH] Booking not found after update');
      return NextResponse.json(
        { error: 'Booking not found after update' },
        { status: 404 }
      );
    }

    console.log('[PATCH] Update successful:', {
      id: (updatedBooking as any).id,
      newStatus: (updatedBooking as any).booking_status,
      eventId: (updatedBooking as any).mentorship_events.id,
      availableSlots: (updatedBooking as any).mentorship_events.available_slots,
      success: (updatedBooking as any).booking_status === status
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${status} successfully`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('[PATCH] Unexpected error:', error);
    const message = error instanceof Error ? error.message : 'Failed to update booking';
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
