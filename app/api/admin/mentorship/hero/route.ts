import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering for this API route
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createClient();
    
    const { data: heroContent, error } = await supabase
      .from('mentorship_hero')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json(heroContent);
  } catch (error) {
    console.error('[MENTORSHIP_HERO_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
) {
  try {
    const supabase = await createClient();
    
    // Check authentication
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { title, subtitle, tagline, background_image } = body;

    if (!title) {
      return new NextResponse("Title is required", { status: 400 });
    }

    if (!subtitle) {
      return new NextResponse("Subtitle is required", { status: 400 });
    }

    if (!tagline) {
      return new NextResponse("Tagline is required", { status: 400 });
    }

    if (!background_image) {
      return new NextResponse("Background image is required", { status: 400 });
    }

    // Check if a record already exists
    const { data: existingHero } = await supabase
      .from('mentorship_hero')
      .select('id')
      .single();

    if (existingHero) {
      // Update existing record
      const { data: updatedHero, error: updateError } = await supabase
        .from('mentorship_hero')
        .update({
          title,
          subtitle,
          tagline,
          background_image,
        })
        .eq('id', existingHero.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return NextResponse.json(updatedHero);
    }

    // Create new record
    const { data: newHero, error: insertError } = await supabase
      .from('mentorship_hero')
      .insert([{
        title,
        subtitle,
        tagline,
        background_image,
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    return NextResponse.json(newHero);
  } catch (error) {
    console.error('[MENTORSHIP_HERO_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
