import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/server';

export async function GET() {
  try {
    // Check environment variables
    const config = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    };
    console.log('Config:', config);

    // Test database connection
    const { data: tables, error: tablesError } = await supabase
      .from('mentorship_events')
      .select('id')
      .limit(1);

    if (tablesError) {
      console.error('Database error:', tablesError);
      return NextResponse.json({
        success: false,
        error: tablesError,
        config,
      }, { status: 500 });
    }

    // Test RLS policies
    const { data: insertTest, error: insertError } = await supabase
      .from('mentorship_events')
      .insert([
        {
          name: 'Test Event',
          date: new Date().toISOString().split('T')[0],
          total_slots: 1,
          available_slots: 1,
        },
      ])
      .select()
      .single();

    return NextResponse.json({
      success: true,
      config,
      tables,
      insertTest: insertTest || null,
      insertError: insertError || null,
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
