import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';
import { Room } from '@prisma/client';

export const dynamic = 'force-dynamic';

// Define a type that matches the selected fields
type SelectedRoomFields = {
  name: string;
  type: string;
  beds: number;
  pricePerNight: number;
  maxOccupancy: number;
  status: string;
  [key: string]: string | number | boolean | Date | null | undefined; // Add index signature
};

export async function GET(request: NextRequest, context: any) {
  const propertyId = context.params.id;

  try {
    const rooms: SelectedRoomFields[] = await prisma.room.findMany({
      where: { propertyId },
      select: {
        name: true,
        type: true,
        beds: true,
        pricePerNight: true,
        maxOccupancy: true,
        status: true,
      },
    });

    const headers = ['name', 'type', 'beds', 'pricePerNight', 'maxOccupancy', 'status'];
    const csvRows = [
      headers.join(','),
      ...rooms.map((room: SelectedRoomFields) =>
        headers.map(field => {
          if (field === 'pricePerNight') {
            return JSON.stringify((room[field] / 100).toFixed(2)); // Convert cents to readable format
          }
          return JSON.stringify(room[field] || '');
        }).join(',')
      ),
    ];

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rooms-${propertyId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Rooms API Error:', error);
    return new NextResponse('Failed to export rooms.', { status: 500 });
  }
}
