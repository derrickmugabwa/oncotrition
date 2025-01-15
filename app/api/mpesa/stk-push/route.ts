import { NextRequest, NextResponse } from 'next/server';
import { getAccessToken, generateTimestamp, generatePassword, formatPhoneNumber, validatePhoneNumber } from '../utils';
import { supabase } from '@/lib/supabase/server';

export const runtime = "nodejs";

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

export async function POST(req: NextRequest) {
  try {
    console.log('\n=== STK PUSH START ===');
    const timestamp = new Date().toISOString();
    console.log('Time:', timestamp);
    await logToSupabase('=== STK PUSH START ===');
    await logToSupabase({ timestamp });

    // Get the request body
    const body = await req.json();
    console.log('Request body:', body);
    await logToSupabase({ body });

    const { phoneNumber, amount, bookingId } = body;

    // Validate phone number
    if (!validatePhoneNumber(phoneNumber)) {
      console.error('Invalid phone number:', phoneNumber);
      await logToSupabase({
        error: 'Invalid phone number',
        phoneNumber
      }, 'error');

      return NextResponse.json(
        {
          error: 'Invalid phone number',
          details: 'Phone number must be in the format 254XXXXXXXXX'
        },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone:', formattedPhone);
    await logToSupabase({ formattedPhone });

    // Get access token
    let accessToken;
    try {
      console.log('Getting access token...');
      await logToSupabase('Getting access token...');

      // Test the credentials first
      const testResponse = await fetch(`${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      });

      const testData = await testResponse.json();
      console.log('Test response:', {
        status: testResponse.status,
        data: testData
      });

      if (!testResponse.ok) {
        throw new Error(`Failed to validate credentials: ${JSON.stringify(testData)}`);
      }

      accessToken = await getAccessToken();
      console.log('Successfully got access token');
      await logToSupabase('Successfully got access token');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get access token:', {
        error,
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      });
      
      await logToSupabase({
        error: 'Failed to get access token',
        details: errorMessage,
        stack: error instanceof Error ? error.stack : undefined
      }, 'error');

      return NextResponse.json(
        {
          error: 'Failed to get access token',
          details: errorMessage
        },
        { status: 500 }
      );
    }

    // Generate timestamp and password
    const mpesaTimestamp = generateTimestamp();
    const password = generatePassword(mpesaTimestamp);
    console.log('Generated timestamp and password');
    await logToSupabase('Generated timestamp and password');

    // Prepare request to M-Pesa
    const stkPushUrl = process.env.MPESA_STK_PUSH_URL;
    const businessShortCode = process.env.MPESA_BUSINESS_SHORT_CODE;
    const passkey = process.env.MPESA_PASSKEY;
    const callbackUrl = process.env.MPESA_CALLBACK_URL;
    const transactionType = "CustomerPayBillOnline";

    // Check each required variable individually
    const missingVars = [];
    if (!stkPushUrl) missingVars.push('MPESA_STK_PUSH_URL');
    if (!businessShortCode) missingVars.push('MPESA_BUSINESS_SHORT_CODE');
    if (!passkey) missingVars.push('MPESA_PASSKEY');
    if (!callbackUrl) missingVars.push('MPESA_CALLBACK_URL');

    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}`;
      console.error(errorMessage);
      await logToSupabase({
        error: errorMessage,
        missingVariables: missingVars
      }, 'error');
      
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: errorMessage
        },
        { status: 500 }
      );
    }

    // At this point, we know stkPushUrl is defined
    const validatedStkPushUrl = stkPushUrl as string;

    // Validate STK Push URL format
    if (!validatedStkPushUrl.includes('/mpesa/stkpush/v1/processrequest')) {
      const errorMessage = 'Invalid MPESA_STK_PUSH_URL. It should end with /mpesa/stkpush/v1/processrequest';
      console.error(errorMessage);
      await logToSupabase({
        error: errorMessage,
        currentUrl: validatedStkPushUrl
      }, 'error');
      
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: errorMessage
        },
        { status: 500 }
      );
    }

    // Log the callback URL being used
    console.log('Using callback URL:', callbackUrl);
    await logToSupabase({
      message: 'STK Push configuration',
      callbackUrl,
      businessShortCode,
      phoneNumber: formattedPhone,
      amount
    });

    const stkPushRequestBody = {
      BusinessShortCode: businessShortCode,
      Password: password,
      Timestamp: mpesaTimestamp,
      TransactionType: transactionType,
      Amount: amount,
      PartyA: formattedPhone,
      PartyB: businessShortCode,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: "Oncotrition",
      TransactionDesc: "Payment for Oncotrition services"
    };

    console.log('STK push request configuration:', {
      stkPushUrl,
      businessShortCode,
      callbackUrl,
      formattedPhone,
      amount,
      mpesaTimestamp
    });

    console.log('Full STK push request body:', stkPushRequestBody);
    await logToSupabase({
      message: 'STK Push Request',
      url: stkPushUrl,
      callbackUrl,
      requestBody: stkPushRequestBody
    });

    // Make request to M-Pesa
    let response;
    try {
      console.log('Making request to M-Pesa...');
      await logToSupabase('Making request to M-Pesa...');

      // Log the full request configuration
      const requestConfig = {
        url: validatedStkPushUrl,
        headers: {
          'Authorization': 'Bearer [REDACTED]',
          'Content-Type': 'application/json',
        },
        body: {
          ...stkPushRequestBody,
          CallBackURL: callbackUrl // Explicitly log the callback URL
        }
      };
      console.log('STK Push Request Configuration:', JSON.stringify(requestConfig, null, 2));
      await logToSupabase({
        event: 'stk_push_request',
        config: requestConfig
      });

      response = await fetch(validatedStkPushUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(stkPushRequestBody)
      });

      const responseText = await response.text();
      console.log('Debug: Raw STK Push response:', responseText);
      console.log('Debug: Response status:', response.status);
      console.log('Debug: Response headers:', Object.fromEntries(response.headers.entries()));

      let responseData;
      try {
        responseData = responseText ? JSON.parse(responseText) : null;
      } catch (parseError) {
        console.error('Failed to parse STK Push response:', parseError);
        throw new Error(`Invalid response format: ${responseText}`);
      }

      // Log the full response
      const fullResponse = {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries()),
        data: responseData,
        originalRequest: {
          callbackUrl,
          businessShortCode,
          phoneNumber: formattedPhone,
          amount
        }
      };
      
      console.log('M-Pesa API Full Response:', JSON.stringify(fullResponse, null, 2));

      await logToSupabase({
        event: 'stk_push_response',
        ...fullResponse
      });

      // Check for HTTP errors first
      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}: ${responseText}`);
      }

      // Then check the M-Pesa response code
      if (responseData?.ResponseCode !== "0") {
        console.error('M-Pesa API Error Response:', responseData);
        await logToSupabase({
          error: 'M-Pesa API Error Response',
          data: responseData,
          request: requestConfig
        }, 'error');

        return NextResponse.json(
          {
            error: 'Failed to initiate payment',
            details: responseData?.ResponseDescription || responseData?.errorMessage || 'Unknown error'
          },
          { status: 400 }
        );
      }

      // Success case
      return NextResponse.json({
        success: true,
        data: responseData,
        message: 'Payment initiated successfully',
        callbackUrl // Include callback URL in response for verification
      });

    } catch (error: unknown) {
      const errorDetails = {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      };

      console.error('M-Pesa API Error:', errorDetails);
      await logToSupabase({
        error: 'M-Pesa API Error',
        details: errorDetails,
        requestConfig: {
          url: stkPushUrl,
          callbackUrl,
          businessShortCode,
          phoneNumber: formattedPhone,
          amount
        }
      }, 'error');

      return NextResponse.json(
        {
          error: 'Failed to initiate payment',
          details: errorDetails.message
        },
        { status: 500 }
      );
    }

    console.log('=== STK PUSH SUCCESS ===');
    await logToSupabase('=== STK PUSH SUCCESS ===');

    const paymentData = response.data;
    console.log('M-Pesa API Response:', paymentData);
    await logToSupabase({
      message: 'M-Pesa API Response',
      data: paymentData,
      checkoutRequestId: paymentData.CheckoutRequestID,
      bookingId: body.bookingId
    });

    // Update booking with checkout request ID
    const { error: updateError } = await supabase
      .from('event_bookings')
      .update({
        checkout_request_id: paymentData.CheckoutRequestID
      })
      .eq('id', body.bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating booking with checkout request ID:', {
        error: updateError,
        bookingId: body.bookingId,
        checkoutRequestId: paymentData.CheckoutRequestID
      });
      await logToSupabase({
        error: 'Error updating booking with checkout request ID',
        details: updateError,
        bookingId: body.bookingId,
        checkoutRequestId: paymentData.CheckoutRequestID
      }, 'error');
    } else {
      console.log('Successfully updated booking with checkout request ID:', {
        bookingId: body.bookingId,
        checkoutRequestId: paymentData.CheckoutRequestID
      });
      await logToSupabase({
        message: 'Successfully updated booking with checkout request ID',
        bookingId: body.bookingId,
        checkoutRequestId: paymentData.CheckoutRequestID
      });
    }

    return NextResponse.json({
      message: 'STK push initiated successfully',
      data: paymentData
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('=== STK PUSH ERROR ===');
    console.error('Error:', errorMessage);
    await logToSupabase('=== STK PUSH ERROR ===', 'error');
    await logToSupabase({
      error: 'STK Push Error',
      details: errorMessage
    }, 'error');

    return NextResponse.json(
      {
        error: 'Failed to initiate payment',
        details: errorMessage
      },
      { status: 500 }
    );
  } finally {
    console.log('=== STK PUSH END ===');
    await logToSupabase('=== STK PUSH END ===');
  }
}

export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
