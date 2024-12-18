import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { id, updates } = await request.json();
    console.log('Received update request:', { id, updates });

    // Validate input
    if (!id || !updates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Start a transaction
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('Authenticated user:', session.user.email);

    // Check if feature exists and get current data
    const { data: currentFeature, error: fetchError } = await supabase
      .from('mentorship_features')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching feature:', fetchError);
      return NextResponse.json(
        { error: 'Feature not found' },
        { status: 404 }
      );
    }

    console.log('Current feature data:', currentFeature);

    // Prepare update data
    const updateData = {
      title: updates.title ?? currentFeature.title,
      description: updates.description ?? currentFeature.description,
      icon_name: updates.icon_name ?? currentFeature.icon_name,
      gradient: updates.gradient ?? currentFeature.gradient,
      display_order: updates.display_order ?? currentFeature.display_order,
    };

    console.log('Preparing to update with data:', updateData);

    // Perform update with explicit return
    const { data: updatedFeature, error: updateError } = await supabase
      .from('mentorship_features')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating feature:', updateError);
      return NextResponse.json(
        { 
          error: 'Failed to update feature',
          details: updateError.message,
          hint: updateError.hint,
          code: updateError.code
        },
        { status: 500 }
      );
    }

    if (!updatedFeature) {
      console.error('No data returned after update');
      return NextResponse.json(
        { error: 'Update succeeded but no data returned' },
        { status: 500 }
      );
    }

    console.log('Successfully updated feature:', updatedFeature);

    // Verify the update
    const { data: verifyFeature, error: verifyError } = await supabase
      .from('mentorship_features')
      .select('*')
      .eq('id', id)
      .single();

    if (verifyError || !verifyFeature) {
      console.error('Error verifying update:', verifyError);
      return NextResponse.json(
        { error: 'Failed to verify update' },
        { status: 500 }
      );
    }

    console.log('Verified updated feature:', verifyFeature);

    return NextResponse.json({ 
      feature: verifyFeature,
      message: 'Feature updated successfully'
    });
  } catch (error: any) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message
      },
      { status: 500 }
    );
  }
}
