import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    console.log('Fetching events from Supabase...');
    const { data, error } = await supabase
      .from('mentorship_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log('Successfully fetched events:', data);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    console.log('Starting event creation...');
    
    const body = await req.json();
    console.log('Received request body:', body);

    const { name, date, totalSlots, price } = body;
    console.log('Parsed values:', { name, date, totalSlots, price });

    // Validate input
    if (!name || !date || !totalSlots || price === undefined) {
      console.error('Missing required fields:', { name, date, totalSlots, price });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      console.error('Invalid date format:', date);
      return NextResponse.json(
        { error: 'Invalid date format' },
        { status: 400 }
      );
    }

    // Validate slots and price
    if (totalSlots < 1) {
      console.error('Invalid total slots:', totalSlots);
      return NextResponse.json(
        { error: 'Total slots must be at least 1' },
        { status: 400 }
      );
    }

    if (price < 0) {
      console.error('Invalid price:', price);
      return NextResponse.json(
        { error: 'Price cannot be negative' },
        { status: 400 }
      );
    }

    console.log('Attempting to insert event into Supabase...');
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
    
    const { data, error } = await supabase
      .from('mentorship_events')
      .insert([
        {
          name,
          date,
          total_slots: totalSlots,
          available_slots: totalSlots,
          price,
        } as any,
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    console.log('Successfully created event:', data);
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Detailed error creating event:', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack,
      cause: error.cause
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to create event', 
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
    console.log('[PATCH] Starting event update...');
    
    const body = await req.json();
    console.log('[PATCH] Received request body:', body);

    const { id, name, date, totalSlots, price } = body;
    console.log('[PATCH] Parsed values:', { id, name, date, totalSlots, price });

    // Validate input
    if (!id || !name || !date || !totalSlots || price === undefined) {
      const error = 'Missing required fields';
      console.error('[PATCH] ' + error, { id, name, date, totalSlots, price });
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      const error = 'Invalid date format';
      console.error('[PATCH] ' + error, { date });
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate price
    if (price < 0) {
      const error = 'Price cannot be negative';
      console.error('[PATCH] ' + error, { price });
      return NextResponse.json({ error }, { status: 400 });
    }

    // Get current event to check available slots
    const { data: currentEvent, error: fetchError } = await supabase
      .from('mentorship_events')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('[PATCH] Error fetching current event:', {
        error: fetchError,
        code: fetchError.code,
        message: fetchError.message,
        details: fetchError.details
      });
      return NextResponse.json(
        { error: 'Failed to fetch current event', details: fetchError.message },
        { status: 500 }
      );
    }

    if (!currentEvent) {
      const error = 'Event not found';
      console.error('[PATCH] ' + error, { id });
      return NextResponse.json({ error }, { status: 404 });
    }

    // Calculate new available slots
    const bookedSlots = currentEvent.total_slots - currentEvent.available_slots;
    const newAvailableSlots = Math.max(0, totalSlots - bookedSlots);

    // Ensure we're not reducing total slots below booked slots
    if (totalSlots < bookedSlots) {
      const error = `Cannot reduce total slots below ${bookedSlots} (number of existing bookings)`;
      console.error('[PATCH] ' + error, { totalSlots, bookedSlots });
      return NextResponse.json({ error }, { status: 400 });
    }

    // Update the event
    const { data: updatedEvent, error: updateError } = await supabase
      .from('mentorship_events')
      .update({
        name,
        date,
        total_slots: totalSlots,
        available_slots: newAvailableSlots,
        price,
        updated_at: new Date().toISOString()
      } as any)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[PATCH] Error updating event:', {
        error: updateError,
        code: updateError.code,
        message: updateError.message,
        details: updateError.details
      });
      return NextResponse.json(
        { error: 'Failed to update event', details: updateError.message },
        { status: 500 }
      );
    }

    console.log('[PATCH] Successfully updated event:', updatedEvent);
    return NextResponse.json(updatedEvent);
  } catch (error: any) {
    console.error('[PATCH] Error updating event:', error);
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('mentorship_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting event:', error);
      throw error;
    }

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error) {
    console.error('Error in DELETE:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
