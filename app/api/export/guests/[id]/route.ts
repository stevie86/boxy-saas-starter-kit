import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Guest } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Ensure this API route is dynamic

// Define a type that matches the selected fields
type SelectedGuestFields = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  nationality: string | null;
  documentId: string | null;
  [key: string]: string | null; // Add index signature for dynamic access
};

export async function GET(request: NextRequest, context: any) {
  const propertyId = context.params.id;

  try {
    const guests: SelectedGuestFields[] = await prisma.guest.findMany({
      where: { propertyId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        nationality: true,
        documentId: true,
      },
    });

    const headers = ['firstName', 'lastName', 'email', 'phone', 'nationality', 'documentId'];
    const csvRows = [
      headers.join(','),
      ...guests.map((guest: SelectedGuestFields) =>
        headers.map(field => JSON.stringify(guest[field] || '')).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="guests-${propertyId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Guests API Error:', error);
    return new NextResponse('Failed to export guests.', { status: 500 });
  }
}
