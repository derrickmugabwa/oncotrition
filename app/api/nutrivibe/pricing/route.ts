// Get NutriVibe Pricing API

import { NextResponse } from 'next/server';
import { publicSupabase } from '@/lib/supabase/public';

const supabase = publicSupabase;

export async function GET() {
  try {
    const { data: pricing, error } = await supabase
      .from('nutrivibe_pricing')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Pricing fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pricing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ pricing: pricing || [] });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
