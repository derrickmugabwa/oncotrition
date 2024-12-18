import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
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

    const { phoneNumber, amount } = body;

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
      accessToken = await getAccessToken();
      console.log('Successfully got access token');
      await logToSupabase('Successfully got access token');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('Failed to get access token:', errorMessage);
      await logToSupabase({
        error: 'Failed to get access token',
        details: errorMessage
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
    const transactionType = "CustomerPayBillOnline";
    const callbackUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/api/mpesa/callback`;

    if (!stkPushUrl || !businessShortCode || !passkey) {
      console.error('Missing required environment variables');
      await logToSupabase('Missing required environment variables', 'error');
      return NextResponse.json(
        {
          error: 'Server configuration error',
          details: 'Missing required environment variables'
        },
        { status: 500 }
      );
    }

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

    console.log('STK push request body:', stkPushRequestBody);
    await logToSupabase({ stkPushRequestBody });

    // Make request to M-Pesa
    let response;
    try {
      console.log('Making request to M-Pesa...');
      await logToSupabase('Making request to M-Pesa...');

      response = await axios.post(stkPushUrl, stkPushRequestBody, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('M-Pesa API Response:', response.data);
      await logToSupabase({
        message: 'M-Pesa API Response',
        data: response.data
      });

      if (response.data.ResponseCode !== "0") {
        console.error('M-Pesa API Error Response:', response.data);
        await logToSupabase({
          error: 'M-Pesa API Error Response',
          data: response.data
        }, 'error');

        return NextResponse.json(
          {
            error: 'Failed to initiate payment',
            details: response.data
          },
          { status: 400 }
        );
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      console.error('M-Pesa API Error:', errorMessage);
      await logToSupabase({
        error: 'M-Pesa API Error',
        details: errorMessage
      }, 'error');

      return NextResponse.json(
        {
          error: 'Failed to initiate payment',
          details: errorMessage
        },
        { status: 500 }
      );
    }

    console.log('=== STK PUSH SUCCESS ===');
    await logToSupabase('=== STK PUSH SUCCESS ===');

    return NextResponse.json({
      message: 'STK push initiated successfully',
      data: response.data
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
