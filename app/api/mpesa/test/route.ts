import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

async function logToSupabase(message: string | object, level: 'info' | 'error' = 'info') {
  try {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message: typeof message === 'string' ? message : JSON.stringify(message, null, 2)
    };

    await supabase
      .from('mpesa_logs')
      .insert([logEntry]);
  } catch (error) {
    console.error('Failed to write log:', error);
  }
}

export async function GET(req: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log('Test endpoint accessed:', timestamp);
  
  try {
    // Test M-Pesa credentials
    const consumerKey = process.env.MPESA_CONSUMER_KEY;
    const consumerSecret = process.env.MPESA_CONSUMER_SECRET;
    const baseUrl = process.env.MPESA_BASE_URL || 'https://sandbox.safaricom.co.ke';

    if (!consumerKey || !consumerSecret) {
      throw new Error('Missing M-Pesa credentials in environment variables');
    }

    console.log('Debug: Using credentials:', {
      baseUrl,
      consumerKeyLength: consumerKey.length,
      consumerSecretLength: consumerSecret.length
    });

    const auth = Buffer.from(`${consumerKey}:${consumerSecret}`).toString('base64');
    console.log('Debug: Basic auth token:', auth);

    const url = `${baseUrl}/oauth/v1/generate?grant_type=client_credentials`;
    console.log('Debug: Making request to:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
    });

    console.log('Debug: Response status:', response.status);
    console.log('Debug: Response headers:', Object.fromEntries(response.headers.entries()));

    const responseText = await response.text();
    console.log('Debug: Raw response:', responseText);

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : null;
    } catch (parseError) {
      console.error('Failed to parse response:', parseError);
      data = null;
    }

    await logToSupabase({
      message: 'M-Pesa test response',
      timestamp,
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      rawResponse: responseText,
      parsedData: data,
      requestUrl: url,
      requestHeaders: {
        'Authorization': 'Basic [REDACTED]',
        'Content-Type': 'application/json',
      }
    });

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        error: `HTTP error ${response.status}: ${responseText}`,
        timestamp
      }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      message: 'Test endpoint is working',
      mpesa: {
        status: response.status,
        headers: Object.fromEntries(response.headers.entries()),
        data
      },
      timestamp
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    
    const errorDetails = error instanceof Error ? {
      message: error.message,
      stack: error.stack,
      name: error.name
    } : 'Unknown error';

    await logToSupabase({
      message: 'Test endpoint error',
      timestamp,
      error: errorDetails,
      headers: Object.fromEntries(req.headers.entries()),
      url: req.url
    }, 'error');

    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: errorDetails,
      timestamp
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const timestamp = new Date().toISOString();
  const body = await req.json().catch(() => ({}));
  
  console.log('Test endpoint POST received:', {
    timestamp,
    body,
    headers: Object.fromEntries(req.headers.entries())
  });

  await logToSupabase({
    message: 'Test endpoint POST received',
    timestamp,
    body,
    headers: Object.fromEntries(req.headers.entries()),
    url: req.url
  });

  return NextResponse.json({
    success: true,
    message: 'Test endpoint POST is working',
    timestamp,
    received: body
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}
