// Admin API: Sponsorship Benefits CRUD
// Manage benefits for sponsorship tiers

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch all benefits for a tier
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  try {
    const { tierId } = await params;

    const { data: benefits, error } = await supabase
      .from('event_sponsorship_benefits')
      .select('*')
      .eq('tier_id', tierId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ benefits: benefits || [] });
  } catch (error) {
    console.error('Error fetching benefits:', error);
    return NextResponse.json(
      { error: 'Failed to fetch benefits' },
      { status: 500 }
    );
  }
}

// POST - Create a new benefit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  try {
    const { tierId } = await params;
    const body = await request.json();

    const { benefit_text, display_order } = body;

    if (!benefit_text) {
      return NextResponse.json(
        { error: 'Benefit text is required' },
        { status: 400 }
      );
    }

    const { data: benefit, error } = await supabase
      .from('event_sponsorship_benefits')
      .insert({
        tier_id: tierId,
        benefit_text,
        display_order: display_order || 0,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ benefit });
  } catch (error) {
    console.error('Error creating benefit:', error);
    return NextResponse.json(
      { error: 'Failed to create benefit' },
      { status: 500 }
    );
  }
}

// PUT - Update a benefit
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  try {
    const { tierId } = await params;
    const body = await request.json();

    const { benefit_id, benefit_text, display_order } = body;

    if (!benefit_id) {
      return NextResponse.json(
        { error: 'Benefit ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (benefit_text !== undefined) updateData.benefit_text = benefit_text;
    if (display_order !== undefined) updateData.display_order = display_order;

    const { data: benefit, error } = await supabase
      .from('event_sponsorship_benefits')
      .update(updateData)
      .eq('id', benefit_id)
      .eq('tier_id', tierId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ benefit });
  } catch (error) {
    console.error('Error updating benefit:', error);
    return NextResponse.json(
      { error: 'Failed to update benefit' },
      { status: 500 }
    );
  }
}

// DELETE - Delete a benefit
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; tierId: string }> }
) {
  try {
    const { tierId } = await params;
    const { searchParams } = new URL(request.url);
    const benefitId = searchParams.get('benefit_id');

    if (!benefitId) {
      return NextResponse.json(
        { error: 'Benefit ID is required' },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from('event_sponsorship_benefits')
      .delete()
      .eq('id', benefitId)
      .eq('tier_id', tierId);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting benefit:', error);
    return NextResponse.json(
      { error: 'Failed to delete benefit' },
      { status: 500 }
    );
  }
}
