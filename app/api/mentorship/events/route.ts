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

    const { name, date, totalSlots } = body;
    console.log('Parsed values:', { name, date, totalSlots });

    // Validate input
    if (!name || !date || !totalSlots) {
      console.error('Missing required fields:', { name, date, totalSlots });
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

    // Validate slots
    if (totalSlots < 1) {
      console.error('Invalid total slots:', totalSlots);
      return NextResponse.json(
        { error: 'Total slots must be at least 1' },
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
        },
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

    const { id, name, date, totalSlots } = body;
    console.log('[PATCH] Parsed values:', { id, name, date, totalSlots });

    // Validate input
    if (!id || !name || !date || !totalSlots) {
      const error = 'Missing required fields';
      console.error('[PATCH] ' + error, { id, name, date, totalSlots });
      return NextResponse.json({ error }, { status: 400 });
    }

    // Validate date format
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) {
      const error = 'Invalid date format';
      console.error('[PATCH] ' + error, { date });
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
        updated_at: new Date().toISOString()
      })
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
    console.error('[PATCH] Unexpected error:', {
      error,
      message: error.message,
      stack: error.stack
    });
    return NextResponse.json(
      { error: 'Failed to update event', details: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    console.log('Starting event deletion...');
    
    const { id } = await req.json();
    console.log('Deleting event with ID:', id);

    if (!id) {
      console.error('Missing event ID');
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    console.log('Attempting to delete event from Supabase...');
    const { error } = await supabase
      .from('mentorship_events')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase delete error:', {
        error,
        code: error.code,
        message: error.message,
        details: error.details
      });
      throw error;
    }

    console.log('Successfully deleted event');
    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    console.error('Detailed error deleting event:', {
      error,
      message: error.message,
      name: error.name,
      stack: error.stack
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to delete event',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: error.code
      }, 
      { status: 500 }
    );
  }
}
