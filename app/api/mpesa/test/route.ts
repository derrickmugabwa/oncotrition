import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  console.log('=== M-PESA TEST ENDPOINT HIT ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers));

  return NextResponse.json({
    success: true,
    message: 'M-Pesa test endpoint is working',
    timestamp: new Date().toISOString()
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function POST(req: Request) {
  console.log('=== M-PESA TEST ENDPOINT HIT (POST) ===');
  console.log('Time:', new Date().toISOString());
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', Object.fromEntries(req.headers));

  const body = await req.text();
  console.log('Request body:', body);

  return NextResponse.json({
    success: true,
    message: 'M-Pesa test endpoint is working (POST)',
    timestamp: new Date().toISOString(),
    receivedBody: body
  }, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}

export async function OPTIONS(req: Request) {
  return NextResponse.json({}, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
