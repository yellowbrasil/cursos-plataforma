import { NextRequest, NextResponse } from 'next/server';

export async function GET(req) {
  return NextResponse.json({ status: 'OK', timestamp: new Date().toISOString() });
}
