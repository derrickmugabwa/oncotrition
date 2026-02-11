// Admin API: Sponsorship Tiers CRUD
// Manage sponsorship tiers for events

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all tiers for an event
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;

    const { data: tiers, error } = await supabase
      .from('event_sponsorship_tiers')
      .select(`
        *,
        benefits:event_sponsorship_benefits(*)
      `)
      .eq('event_id', eventId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ tiers: tiers || [] });
  } catch (error) {
    console.error('Error fetching tiers:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sponsorship tiers' },
      { status: 500 }
    );
  }
}

// POST - Create a new tier
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    const { tier_name, price, description, display_order, is_active } = body;

    if (!tier_name || price === undefined) {
      return NextResponse.json(
        { error: 'Tier name and price are required' },
        { status: 400 }
      );
    }

    const { data: tier, error } = await supabase
      .from('event_sponsorship_tiers')
      .insert({
        event_id: eventId,
        tier_name,
        price,
        description: description || null,
        display_order: display_order || 0,
        is_active: is_active !== undefined ? is_active : true,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ tier });
  } catch (error: any) {
    console.error('Error creating tier:', error);
    
    // Handle unique constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A tier with this name already exists for this event' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create sponsorship tier' },
      { status: 500 }
    );
  }
}

// PUT - Update a tier
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const body = await request.json();

    const { tier_id, tier_name, price, description, display_order, is_active } = body;

    if (!tier_id) {
      return NextResponse.json(
        { error: 'Tier ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (tier_name !== undefined) updateData.tier_name = tier_name;
    if (price !== undefined) updateData.price = price;
    if (description !== undefined) updateData.description = description;
    if (display_order !== undefined) updateData.display_order = display_order;
    if (is_active !== undefined) updateData.is_active = is_active;

    const { data: tier, error } = await supabase
      .from('event_sponsorship_tiers')
      .update(updateData)
      .eq('id', tier_id)
      .eq('event_id', eventId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ tier });
  } catch (error: any) {
    console.error('Error updating tier:', error);

    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'A tier with this name already exists for this event' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update sponsorship tier' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a tier
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: eventId } = await params;
    const { searchParams } = new URL(request.url);
    const tierId = searchParams.get('tier_id');

    if (!tierId) {
      return NextResponse.json(
        { error: 'Tier ID is required' },
        { status: 400 }
      );
    }

    // Check if tier has registrations
    const { count } = await supabase
      .from('event_sponsorship_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('tier_id', tierId)
      .eq('payment_status', 'completed');

    if (count && count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete tier with completed registrations. Deactivate it instead.' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('event_sponsorship_tiers')
      .delete()
      .eq('id', tierId)
      .eq('event_id', eventId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tier:', error);
    return NextResponse.json(
      { error: 'Failed to delete sponsorship tier' },
      { status: 500 }
    );
  }
}
