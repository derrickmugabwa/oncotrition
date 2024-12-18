import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Simple success response that matches Safaricom's format
const successResponse = {
  Body: {
    stkCallback: {
      ResultCode: 0,
      ResultDesc: "The service request is processed successfully."
    }
  }
};

export async function POST() {
  return NextResponse.json(successResponse, {
    status: 200,
    headers: {
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}

export async function OPTIONS() {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json;charset=UTF-8'
    }
  });
}

// Handle all other methods
export async function GET() { return POST(); }
export async function PUT() { return POST(); }
export async function DELETE() { return POST(); }
export async function PATCH() { return POST(); }
