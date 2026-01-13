// Admin API: Update Event Interest Areas

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();
    const { interestAreas } = body;

    if (!Array.isArray(interestAreas)) {
      return NextResponse.json(
        { error: 'Invalid interest areas data' },
        { status: 400 }
      );
    }

    // Verify event exists
    const { data: event, error: eventError } = await supabase
      .from('events')
      .select('id')
      .eq('id', eventId)
      .single();

    if (eventError || !event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Delete existing interest areas for this event
    await supabase
      .from('nutrivibe_interest_areas')
      .delete()
      .eq('event_id', eventId);

    // Insert new interest areas
    const areasData = interestAreas.map((area: any) => ({
      event_id: eventId,
      name: area.name,
      is_active: area.is_active !== undefined ? area.is_active : true,
      display_order: area.display_order || 0,
    }));

    const { error: insertError } = await supabase
      .from('nutrivibe_interest_areas')
      .insert(areasData);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save interest areas' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Interest areas API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
