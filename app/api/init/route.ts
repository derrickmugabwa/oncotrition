import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if site_settings exists
    const { data: existingSettings, error: fetchError } = await supabase
      .from('site_settings')
      .select('*')
      .single()

    if (fetchError && fetchError.code === 'PGRST116') {
      // No settings exist, create initial settings
      const { data: newSettings, error: insertError } = await supabase
        .from('site_settings')
        .insert([
          {
            logo_url: null,
            favicon_url: null,
            show_site_name: true
          }
        ])
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      return NextResponse.json({ 
        message: 'Site settings initialized', 
        data: newSettings 
      })
    }

    if (fetchError) {
      throw fetchError
    }

    return NextResponse.json({ 
      message: 'Site settings already exist', 
      data: existingSettings 
    })

  } catch (error: any) {
    console.error('Error initializing site settings:', error)
    return NextResponse.json(
      { error: 'Failed to initialize site settings' },
      { status: 500 }
    )
  }
}
