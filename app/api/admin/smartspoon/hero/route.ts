import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data = await request.json();

    // Verify admin session
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Check if a record exists
    const { data: existingContent } = await supabase
      .from('smartspoon_hero')
      .select('id')
      .single();

    let result;

    if (existingContent) {
      // Update existing record
      result = await supabase
        .from('smartspoon_hero')
        .update({
          title: data.title,
          subtitle: data.subtitle,
          tagline: data.tagline,
          background_image: data.background_image,
        })
        .eq('id', existingContent.id);
    } else {
      // Insert new record
      result = await supabase.from('smartspoon_hero').insert([
        {
          title: data.title,
          subtitle: data.subtitle,
          tagline: data.tagline,
          background_image: data.background_image,
        },
      ]);
    }

    if (result.error) {
      throw result.error;
    }

    return NextResponse.json({ message: 'Hero section updated successfully' });
  } catch (error) {
    console.error('Error updating hero section:', error);
    return new NextResponse(
      error instanceof Error ? error.message : 'Internal Server Error',
      { status: 500 }
    );
  }
}
