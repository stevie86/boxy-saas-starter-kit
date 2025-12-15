'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Booking, Guest, BookingBed, Room } from '@prisma/client'; // Import Prisma types
import { randomUUID } from 'node:crypto'; // Used for confirmationCode in importBookings

// Type alias for Booking with its relations for export/import functions
type BookingWithRelations = Booking & {
  guest: Guest | null;
  beds: (BookingBed & { room: Room })[];
};

const BookingSchema = z.object({
  roomId: z.string().min(1, 'Room is required'),
  guestName: z.string().min(1, 'Guest Name is required'),
  checkIn: z.coerce.date(),
  checkOut: z.coerce.date(),
});

export async function createBooking(propertyId: string, prevState: any, formData: FormData) {
  const validatedFields = BookingSchema.safeParse({
    roomId: formData.get('roomId'),
    guestName: formData.get('guestName'), // Simplified: directly taking name for now, or creating Guest?
    checkIn: formData.get('checkIn'),
    checkOut: formData.get('checkOut'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }

  const { roomId, guestName, checkIn, checkOut } = validatedFields.data;

  if (checkOut <= checkIn) {
    return {
      message: 'Check-out date must be after check-in date.',
    };
  }

  try {
    // 1. Check Availability
    // Find all bookings for this room that overlap with the requested dates.
    // Overlap: existing.start < requested.end && existing.end > requested.start
    
    // We need to query BookingBed to see how many beds in this room are taken.
    // Since BookingBed doesn't have dates, we look at the parent Booking.
    
    const overlappingBookings = await prisma.bookingBed.count({
      where: {
        roomId: roomId,
        booking: {
          status: { notIn: ['cancelled'] },
          checkIn: { lt: checkOut },
          checkOut: { gt: checkIn },
        },
      },
    });

    // Get Room Capacity
    const room = await prisma.room.findUnique({
      where: { id: roomId },
    });

    if (!room) {
      return { message: 'Room not found.' };
    }

    if (overlappingBookings >= room.beds) {
      return { message: 'Room is fully booked for these dates.' };
    }

    // 2. Create Guest (Simple inline creation for MVP)
    // In a full app, we'd search for existing guests or use a Guest ID.
    // Schema requires firstName, lastName. simpler to split name.
    const [firstName, ...lastNameParts] = guestName.split(' ');
    const lastName = lastNameParts.join(' ') || 'Guest';

    const guest = await prisma.guest.create({
      data: {
        propertyId,
        firstName,
        lastName,
      }
    });

    // 3. Create Booking
    const booking = await prisma.booking.create({
      data: {
        propertyId,
        guestId: guest.id,
        checkIn,
        checkOut,
        status: 'confirmed',
        totalAmount: room.pricePerNight, // Simple calculation: 1 night * price? 
        // Logic: Calculate nights * price.
      },
    });

    // 4. Create BookingBed (Allocate 1 bed)
    await prisma.bookingBed.create({
      data: {
        bookingId: booking.id,
        roomId: roomId,
        bedLabel: 'Auto-Assigned', // Placeholder for specific bed selection
        pricePerNight: room.pricePerNight,
      }
    });

    revalidatePath(`/properties/${propertyId}`);
    // redirect(`/properties/${propertyId}`); // stay on page or go to list?
    // Let's redirect to bookings list
  } catch (error) {
    console.error('Booking Error:', error);
    return { message: 'Database Error: Failed to create booking.' };
  }

  redirect(`/properties/${propertyId}/bookings`);
}

export async function checkInBooking(propertyId: string, bookingId: string): Promise<void> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'checked_in' },
    });
    revalidatePath(`/properties/${propertyId}/dashboard`);
    revalidatePath(`/properties/${propertyId}/bookings`);
    return; // Explicitly return void
  } catch (error) {
    console.error('Check-in Error:', error);
    throw new Error('Failed to check in booking.'); // Throw error instead of returning object
  }
}

export async function checkOutBooking(propertyId: string, bookingId: string): Promise<void> {
  try {
    await prisma.booking.update({
      where: { id: bookingId },
      data: { status: 'checked_out' },
    });
    revalidatePath(`/properties/${propertyId}/dashboard`);
    revalidatePath(`/properties/${propertyId}/bookings`);
    return; // Explicitly return void
  } catch (error) {
    console.error('Check-out Error:', error);
    throw new Error('Failed to check out booking.'); // Throw error instead of returning object
  }
}

export async function exportBookings(propertyId: string) {
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
      ...bookings.map((booking: BookingWithRelations) => {
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
    console.error('Export Bookings Error:', error);
    redirect(`/properties/${propertyId}/bookings?error=Failed to export bookings`);
  }
}

const BookingImportSchema = z.object({
  guestFirstName: z.string().min(1),
  guestLastName: z.string().min(1),
  email: z.string().email().or(z.literal('')).optional(),
  phone: z.string().optional(),
  roomName: z.string().min(1),
  checkIn: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-in date format (YYYY-MM-DD)").transform((str) => new Date(str)),
  checkOut: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid check-out date format (YYYY-MM-DD)").transform((str) => new Date(str)),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).default('confirmed'),
});

export async function importBookings(propertyId: string, prevState: any, formData: FormData) {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { message: 'No file selected.' };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter empty lines
  const headers = lines[0].split(',').map(h => h.trim());

  const requiredHeaders = ['guestFirstName', 'guestLastName', 'roomName', 'checkIn', 'checkOut'];
  if (!requiredHeaders.every(header => headers.includes(header))) {
    return { message: `Invalid CSV format. Required headers: ${requiredHeaders.join(', ')}.` };
  }

  const bookingsToProcess = [];
  let successCount = 0;
  let failCount = 0;

  // Fetch all rooms for the property once
  const roomsForProperty = await prisma.room.findMany({ where: { propertyId } });
  const roomsByName = new Map(roomsForProperty.map(room => [room.name.toLowerCase(), room]));

  // Fetch all guests for the property once (for matching)
  const guestsForProperty = await prisma.guest.findMany({ where: { propertyId } });
  const guestsByEmail = new Map(guestsForProperty.map(guest => [guest.email?.toLowerCase(), guest]));
  const guestsByName = new Map(guestsForProperty.map(guest => [`${guest.firstName?.toLowerCase()} ${guest.lastName?.toLowerCase()}`, guest]));


  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = line.split(',').map(v => v.trim());
    
    if (values.length !== headers.length) {
      failCount++;
      console.warn(`Skipping malformed row: ${line}`);
      continue;
    }

    const rowData = headers.reduce((acc: Record<string, string>, header, index) => {
      acc[header] = values[index];
      return acc;
    }, {});

    const parsedRow = BookingImportSchema.safeParse(rowData);

    if (parsedRow.success) {
      bookingsToProcess.push(parsedRow.data);
    } else {
      failCount++;
      console.warn(`Skipping invalid row: ${line}. Errors: ${JSON.stringify(parsedRow.error.flatten().fieldErrors)}`);
    }
  }

  if (bookingsToProcess.length === 0) {
    return { message: 'No valid bookings found to import.' };
  }

  for (const bookingData of bookingsToProcess) {
    try {
      // Find or create Guest
      let guest = guestsByEmail.get(bookingData.email?.toLowerCase()) || guestsByName.get(`${bookingData.guestFirstName.toLowerCase()} ${bookingData.guestLastName.toLowerCase()}`);
      
      if (!guest) {
        guest = await prisma.guest.create({
          data: {
            propertyId,
            firstName: bookingData.guestFirstName,
            lastName: bookingData.guestLastName,
            email: bookingData.email || null,
            phone: bookingData.phone || null,
          },
        });
      }

      // Find Room
      const room = roomsByName.get(bookingData.roomName.toLowerCase());
      if (!room) {
        failCount++;
        console.warn(`Skipping booking for non-existent room: ${bookingData.roomName}`);
        continue;
      }

      // Conflict Detection (Simplified from createBooking logic)
      const overlappingBookingsCount = await prisma.bookingBed.count({
        where: {
          roomId: room.id,
          booking: {
            status: { notIn: ['cancelled', 'checked_out'] }, // Consider active bookings
            checkIn: { lt: bookingData.checkOut },
            checkOut: { gt: bookingData.checkIn },
          },
        },
      });

      if (overlappingBookingsCount >= room.beds) {
        failCount++;
        console.warn(`Skipping booking due to full capacity for room ${room.name} on ${bookingData.checkIn.toLocaleDateString()} - ${bookingData.checkOut.toLocaleDateString()}`);
        continue;
      }

      // Create Booking
      const newBooking = await prisma.booking.create({
        data: {
          propertyId,
          guestId: guest.id,
          checkIn: bookingData.checkIn,
          checkOut: bookingData.checkOut,
          status: bookingData.status,
          totalAmount: room.pricePerNight * Math.ceil((bookingData.checkOut.getTime() - bookingData.checkIn.getTime()) / (1000 * 60 * 60 * 24)),
          amountPaid: 0, // Default to 0 on import, can be updated later
          paymentStatus: 'pending',
          confirmationCode: randomUUID().toUpperCase().substring(0, 10),
        },
      });

      // Create BookingBed
      await prisma.bookingBed.create({
        data: {
          bookingId: newBooking.id,
          roomId: room.id,
          bedLabel: 'Auto-Assigned',
          pricePerNight: room.pricePerNight,
        },
      });
      successCount++;
    } catch (error) {
      failCount++;
      console.error('Error processing booking row:', bookingData, error);
    }
  }

  revalidatePath(`/properties/${propertyId}/bookings`);
  redirect(`/properties/${propertyId}/bookings?message=${successCount} bookings imported, ${failCount} failed.`);
}
