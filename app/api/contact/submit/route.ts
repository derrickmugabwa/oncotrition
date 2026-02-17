import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { Resend } from 'resend';
import { ContactFormNotification } from '@/emails/ContactFormNotification';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Save to database
    const supabase = await createClient();
    const { error: dbError } = await supabase
      .from('form_submissions')
      .insert([{ name, email, subject, message }]);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to save submission' },
        { status: 500 }
      );
    }

    // Send email notification to info@oncotritionhc.com
    try {
      const submittedAt = new Date().toISOString();
      
      const { data: emailData, error: emailError } = await resend.emails.send({
        from: 'Oncotrition Contact Form <noreply@oncotritionhc.com>',
        to: ['info@oncotritionhc.com'],
        replyTo: email, // Allow direct reply to the sender
        subject: `New Contact Form: ${subject}`,
        react: ContactFormNotification({
          name,
          email,
          subject,
          message,
          submittedAt,
        }),
      });

      if (emailError) {
        console.error('Email error:', emailError);
        // Don't fail the request if email fails - submission is already saved
        return NextResponse.json({
          success: true,
          message: 'Form submitted successfully, but email notification failed',
          emailSent: false,
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully',
        emailSent: true,
        emailId: emailData?.id,
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      // Submission saved, but email failed
      return NextResponse.json({
        success: true,
        message: 'Form submitted successfully, but email notification failed',
        emailSent: false,
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
