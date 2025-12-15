'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

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
