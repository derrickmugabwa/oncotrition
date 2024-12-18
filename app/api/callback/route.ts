import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const runtime = "nodejs";

async function logToFile(message: string) {
  try {
    const logDir = path.join(process.cwd(), 'logs');
    await fs.mkdir(logDir, { recursive: true });
    const logFile = path.join(logDir, 'callback.log');
    await fs.appendFile(logFile, `${new Date().toISOString()} - ${message}\n`);
  } catch {
    // Silently fail if we can't log
  }
}

export async function POST(req: NextRequest) {
  try {
    await logToFile('=== CALLBACK RECEIVED ===');
    
    // Log request details
    await logToFile(`Method: ${req.method}`);
    await logToFile(`URL: ${req.url}`);
    await logToFile(`Headers: ${JSON.stringify(Object.fromEntries(req.headers))}`);
    
    // Get and log the raw body
    const rawBody = await req.text();
    await logToFile(`Raw Body: ${rawBody}`);
    
    // Try to parse as JSON and log
    try {
      const jsonBody = JSON.parse(rawBody);
      await logToFile(`Parsed Body: ${JSON.stringify(jsonBody, null, 2)}`);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown parse error';
      await logToFile(`Failed to parse body as JSON: ${errorMessage}`);
    }
    
    await logToFile('=== CALLBACK END ===');

    // Return a success response
    return new NextResponse(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "The service request is processed successfully."
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    await logToFile(`Error: ${errorMessage}`);
    
    // Even on error, return success to the caller
    return new NextResponse(
      JSON.stringify({
        ResultCode: 0,
        ResultDesc: "The service request is processed successfully."
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
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
