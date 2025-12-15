// app/api/health/route.ts
import prisma from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Try to connect to the database and query a simple table
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: 'ok', message: 'Database connection successful' });
  } catch (error) {
    console.error('Database connection failed:', error instanceof Error ? error.message : String(error));
    return NextResponse.json({ status: 'error', message: 'Database connection failed' }, { status: 500 });
  }
}
