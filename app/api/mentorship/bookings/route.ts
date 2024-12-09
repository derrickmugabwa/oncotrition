import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

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
    const { eventId, name, email, phone } = await req.json();

    // Check if there are available slots
    const { data: event, error: eventError } = await supabase
      .from('mentorship_events')
      .select('available_slots')
      .eq('id', eventId)
      .single();

    if (eventError) throw eventError;

    if (!event || event.available_slots <= 0) {
      return NextResponse.json(
        { error: 'No available slots for this event' },
        { status: 400 }
      );
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabase
      .from('event_bookings')
      .insert([
        {
          event_id: eventId,
          name,
          email,
          phone,
          booking_status: 'pending'
        }
      ])
      .select()
      .single();

    if (bookingError) throw bookingError;

    return NextResponse.json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    return NextResponse.json(
      { error: 'Failed to create booking' },
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
    if (status === 'approved' && booking.booking_status !== 'approved') {
      // Check if slots are available
      if (booking.mentorship_events.available_slots <= 0) {
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
          available_slots: booking.mentorship_events.available_slots - 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.mentorship_events.id);

      if (slotError) {
        console.error('[PATCH] Error updating slots:', slotError);
        return NextResponse.json(
          { error: 'Failed to update event slots' },
          { status: 500 }
        );
      }
    } else if (status === 'rejected' && booking.booking_status === 'approved') {
      // If rejecting a previously approved booking, increment the slots
      const { error: slotError } = await supabase
        .from('mentorship_events')
        .update({ 
          available_slots: booking.mentorship_events.available_slots + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.mentorship_events.id);

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
      .update({ booking_status: status })
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
      id: updatedBooking.id,
      newStatus: updatedBooking.booking_status,
      eventId: updatedBooking.mentorship_events.id,
      availableSlots: updatedBooking.mentorship_events.available_slots,
      success: updatedBooking.booking_status === status
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
