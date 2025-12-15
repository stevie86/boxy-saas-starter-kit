import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic'; // Ensure this API route is dynamic

export async function GET(request: NextRequest, context: any) {
  const propertyId = context.params.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: { propertyId },
      include: {
        guest: true,
        beds: {
          include: {
            room: true,
          },
        },
      },
      orderBy: { checkIn: 'asc' },
    });

    const headers = [
      'bookingId',
      'guestName',
      'roomName',
      'checkIn',
      'checkOut',
      'status',
      'totalAmount',
      'amountPaid',
      'paymentStatus',
      'confirmationCode',
    ];

    const csvRows = [
      headers.join(','),
      ...bookings.map((booking) => {
        const roomNames = booking.beds.map((b) => b.room.name).join(' / ');
        const guestName = `${booking.guest?.firstName || ''} ${booking.guest?.lastName || ''}`;
        return [
          JSON.stringify(booking.id),
          JSON.stringify(guestName),
          JSON.stringify(roomNames),
          JSON.stringify(booking.checkIn.toLocaleDateString('en-CA')), // YYYY-MM-DD
          JSON.stringify(booking.checkOut.toLocaleDateString('en-CA')),
          JSON.stringify(booking.status),
          JSON.stringify((booking.totalAmount / 100).toFixed(2)),
          JSON.stringify((booking.amountPaid / 100).toFixed(2)),
          JSON.stringify(booking.paymentStatus),
          JSON.stringify(booking.confirmationCode || ''),
        ].join(',');
      }),
    ];

    const csvContent = csvRows.join('\n');

    return new Response(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="bookings-${propertyId}.csv"`,
      },
    });
  } catch (error) {
    console.error('Export Bookings API Error:', error);
    return new NextResponse('Failed to export bookings.', { status: 500 });
  }
}
