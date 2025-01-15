import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with service role key for admin access
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

interface MpesaCallbackItem {
  Name: string;
  Value?: number | string;
}

interface MpesaCallback {
  Body: {
    stkCallback: {
      MerchantRequestID: string;
      CheckoutRequestID: string;
      ResultCode: number;
      ResultDesc: string;
      CallbackMetadata?: {
        Item: MpesaCallbackItem[];
      };
    };
  };
}

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

// Helper function to create consistent response format
function createResponse(data: any, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  console.log('\n=== M-PESA CALLBACK RECEIVED ===');
  const timestamp = new Date().toISOString();
  console.log('Time:', timestamp);
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  
  // Log headers
  const headers = Object.fromEntries(req.headers.entries());
  console.log('Headers:', headers);

  // Log query parameters
  const url = new URL(req.url);
  console.log('Query parameters:', Object.fromEntries(url.searchParams.entries()));

  await logToSupabase({
    event: 'callback_received',
    timestamp,
    method: req.method,
    url: req.url,
    headers,
    query: Object.fromEntries(url.searchParams.entries())
  });
  
  try {
    // Get and log the raw body
    const rawBody = await req.text();
    console.log('\nRaw body:', rawBody);
    await logToSupabase({
      event: 'callback_raw_body',
      rawBody
    });

    // Parse the JSON
    let body: any;
    try {
      body = rawBody ? JSON.parse(rawBody) : null;
      console.log('\nParsed body:', JSON.stringify(body, null, 2));
      await logToSupabase({
        event: 'callback_parsed_body',
        body
      });
    } catch (parseError) {
      console.error('\nFailed to parse JSON:', parseError);
      await logToSupabase({
        error: 'JSON parse error',
        details: parseError instanceof Error ? parseError.message : 'Unknown error',
        rawBody
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Invalid JSON payload',
        details: parseError instanceof Error ? parseError.message : 'Unknown error'
      }, 400);
    }

    // Special handling for empty body
    if (!rawBody) {
      console.log('Empty request body received');
      await logToSupabase({
        event: 'empty_callback_received',
        timestamp,
        headers
      });
      return createResponse({ 
        success: true,
        message: 'Empty request acknowledged'
      });
    }

    // Validate the payload structure step by step
    console.log('\nValidating payload structure...');
    
    if (!body) {
      console.error('Body is null or undefined');
      await logToSupabase({
        error: 'Empty payload',
        body
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Empty payload'
      }, 400);
    }

    console.log('Body keys:', Object.keys(body));
    await logToSupabase({
      event: 'callback_body_keys',
      keys: Object.keys(body)
    });
    
    if (!body.Body) {
      console.error('Missing Body property');
      await logToSupabase({
        error: 'Missing Body property',
        received: Object.keys(body)
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Missing Body property',
        received: Object.keys(body)
      }, 400);
    }

    console.log('Body.Body keys:', Object.keys(body.Body));
    await logToSupabase({
      event: 'callback_body_body_keys',
      keys: Object.keys(body.Body)
    });
    
    if (!body.Body.stkCallback) {
      console.error('Missing stkCallback property');
      await logToSupabase({
        error: 'Missing stkCallback property',
        received: Object.keys(body.Body)
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Missing stkCallback property',
        received: Object.keys(body.Body)
      }, 400);
    }

    const stkCallback = body.Body.stkCallback;
    console.log('stkCallback keys:', Object.keys(stkCallback));
    await logToSupabase({
      event: 'callback_stk_callback_keys',
      keys: Object.keys(stkCallback)
    });

    // Validate required fields
    const requiredFields = ['MerchantRequestID', 'CheckoutRequestID', 'ResultCode', 'ResultDesc'];
    const missingFields = requiredFields.filter(field => !(field in stkCallback));
    
    if (missingFields.length > 0) {
      console.error('Missing required fields:', missingFields);
      await logToSupabase({
        error: 'Missing required fields',
        missingFields,
        stkCallback
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Missing required fields',
        missingFields
      }, 400);
    }

    // Now we can safely cast to MpesaCallback type
    const validatedBody = body as MpesaCallback;
    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = validatedBody.Body.stkCallback;
    
    console.log('\nProcessing validated callback:', {
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    });
    await logToSupabase({
      event: 'callback_processing',
      MerchantRequestID,
      CheckoutRequestID,
      ResultCode,
      ResultDesc
    });

    // Find the booking
    console.log('\nLooking for booking with CheckoutRequestID:', CheckoutRequestID);
    const { data: booking, error: findError } = await supabase
      .from('event_bookings')
      .select('*')
      .eq('checkout_request_id', CheckoutRequestID)
      .single();

    if (findError || !booking) {
      console.error('\nBooking not found:', {
        CheckoutRequestID,
        error: findError
      });
      await logToSupabase({
        error: 'Booking not found',
        checkoutRequestId: CheckoutRequestID,
        findError
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Booking not found',
        checkoutRequestId: CheckoutRequestID
      }, 404);
    }

    console.log('\nFound booking:', booking);
    await logToSupabase({
      event: 'booking_found',
      booking
    });

    // Handle failed payment
    if (ResultCode !== 0) {
      console.log('\nPayment failed:', ResultDesc);
      await logToSupabase({
        event: 'payment_failed',
        ResultDesc,
        booking
      });
      
      const { error: updateError } = await supabase
        .from('event_bookings')
        .update({
          payment_status: 'failed',
          booking_status: 'cancelled'
        })
        .eq('id', booking.id);

      if (updateError) {
        console.error('\nError updating failed payment status:', updateError);
        await logToSupabase({
          error: 'Failed to update payment status',
          updateError
        }, 'error');
      }

      return createResponse({
        success: false,
        error: ResultDesc
      });
    }

    // Extract payment details
    if (!CallbackMetadata?.Item) {
      console.error('\nMissing callback metadata');
      await logToSupabase({
        error: 'Missing callback metadata',
        stkCallback: validatedBody.Body.stkCallback
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Missing callback metadata' 
      }, 400);
    }

    const getMetadataValue = (name: string) => {
      const item = CallbackMetadata.Item.find(item => item.Name === name);
      return item?.Value;
    };

    const amount = getMetadataValue('Amount');
    const mpesaReceiptNumber = getMetadataValue('MpesaReceiptNumber');
    const transactionDate = getMetadataValue('TransactionDate');
    const phoneNumber = getMetadataValue('PhoneNumber');

    console.log('\nPayment details:', {
      amount,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber
    });
    await logToSupabase({
      event: 'payment_details',
      amount,
      mpesaReceiptNumber,
      transactionDate,
      phoneNumber
    });

    // Format the transaction date (from YYYYMMDDHHMMSS to ISO string)
    const formattedDate = transactionDate
      ? `${String(transactionDate).slice(0, 4)}-${String(transactionDate).slice(4, 6)}-${String(transactionDate).slice(6, 8)}T${String(transactionDate).slice(8, 10)}:${String(transactionDate).slice(10, 12)}:${String(transactionDate).slice(12, 14)}+03:00`
      : new Date().toISOString();

    // Update the booking
    console.log('\nUpdating booking with payment details...');
    const { error: updateError } = await supabase
      .from('event_bookings')
      .update({
        payment_status: 'completed',
        booking_status: 'confirmed',
        payment_reference: mpesaReceiptNumber?.toString(),
        payment_date: formattedDate,
        payment_amount: amount,
        payment_phone: phoneNumber?.toString()
      })
      .eq('id', booking.id);

    if (updateError) {
      console.error('\nError updating booking:', updateError);
      await logToSupabase({
        error: 'Update error',
        details: updateError.message,
        bookingId: booking.id
      }, 'error');
      return createResponse({ 
        success: false, 
        error: 'Failed to update booking',
        details: updateError.message
      }, 500);
    }

    console.log('\nSuccessfully updated booking');
    await logToSupabase({
      event: 'payment_processed',
      bookingId: booking.id,
      paymentReference: mpesaReceiptNumber,
      amount,
      phone: phoneNumber
    });

    return createResponse({
      success: true,
      message: 'Payment processed successfully'
    });

  } catch (error) {
    console.error('\nCallback processing error:', error);
    await logToSupabase({
      error: 'Processing error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 'error');
    return createResponse({ 
      success: false, 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
}

export async function OPTIONS(req: NextRequest) {
  return createResponse(null, 200);
}

// Handle all other methods
export async function GET(req: NextRequest) { return POST(req); }
export async function PUT(req: NextRequest) { return POST(req); }
export async function DELETE(req: NextRequest) { return POST(req); }
export async function PATCH(req: NextRequest) { return POST(req); }
