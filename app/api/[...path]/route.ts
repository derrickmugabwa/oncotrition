import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = "nodejs";

async function logToFile(message: string) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, 'api.log');
    await fs.appendFile(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch {
    // Silently fail if we can't log
  }
}

async function handleRequest(req: NextRequest) {
  try {
    // Log that we received something
    await logToFile('=== NEW REQUEST RECEIVED ===');
    
    // Get the request body as text
    const bodyText = await req.text();
    
    // Log the request details
    await logToFile(`Method: ${req.method}`);
    await logToFile(`URL: ${req.url}`);
    await logToFile(`Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
    await logToFile(`Body: ${bodyText}`);
    
    // Log that we're done processing
    await logToFile('=== REQUEST PROCESSING COMPLETE ===');

    // If this is an M-Pesa callback (check the URL), return their expected format
    if (req.url.includes('/api/callback') || req.url.includes('/api/mpesa/callback')) {
      return new NextResponse(
        JSON.stringify({
          "ResultCode": 0,
          "ResultDesc": "The service request is processed successfully."
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // For other requests, return a generic success
    return new NextResponse(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    // Log any errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await logToFile(`Error processing request: ${errorMessage}`);
    
    // If this looks like an M-Pesa callback, return their format
    if (req.url.includes('/api/callback') || req.url.includes('/api/mpesa/callback')) {
      return new NextResponse(
        JSON.stringify({
          "ResultCode": 0,
          "ResultDesc": "The service request is processed successfully."
        }),
        {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    }

    // For other requests, return a generic error
    return new NextResponse(
      JSON.stringify({ error: errorMessage }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

// Handle all HTTP methods
export async function GET(req: NextRequest) { return handleRequest(req); }
export async function POST(req: NextRequest) { return handleRequest(req); }
export async function PUT(req: NextRequest) { return handleRequest(req); }
export async function DELETE(req: NextRequest) { return handleRequest(req); }
export async function PATCH(req: NextRequest) { return handleRequest(req); }
export async function HEAD(req: NextRequest) { return handleRequest(req); }
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
