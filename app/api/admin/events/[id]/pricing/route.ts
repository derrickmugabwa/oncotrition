// Admin API: Update Event Pricing

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
    const { pricing } = body;

    if (!Array.isArray(pricing)) {
      return NextResponse.json(
        { error: 'Invalid pricing data' },
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

    // Delete existing pricing for this event
    await supabase
      .from('nutrivibe_pricing')
      .delete()
      .eq('event_id', eventId);

    // Insert new pricing options
    const pricingData = pricing.map((p: any) => ({
      event_id: eventId,
      participation_type: p.participation_type,
      price: p.price,
      description: p.description || null,
      is_active: p.is_active !== undefined ? p.is_active : true,
      display_order: p.display_order || 0,
    }));

    const { error: insertError } = await supabase
      .from('nutrivibe_pricing')
      .insert(pricingData);

    if (insertError) {
      console.error('Insert error:', insertError);
      return NextResponse.json(
        { error: 'Failed to save pricing options' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
