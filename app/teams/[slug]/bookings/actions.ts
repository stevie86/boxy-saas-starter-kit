"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createBookingSchema } from '@/lib/validation/booking';
import { safeParse } from "valibot";

export async function createBookingAction(
  teamId: string,
  input: FormData
) {
  const validatedFields = createBookingSchema.safeParse({
    guestId: input.get("guestId"),
    checkIn: input.get("checkIn"),
    checkOut:  input.get("checkOut"),
    totalAmount: Number(input.get("totalAmount")),
    channel: input.get("channel"),
    notes: input.get("notes"),
    roomIds: input.getAll("roomIds"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { guestId, checkIn, checkOut, totalAmount, channel, notes, roomIds } = validatedFields.data;

  try {
    // Check for overlapping bookings
    const overlappingBookings = await prisma.booking.findMany({
      where: {
        teamId: teamId,
        rooms: {
          some: {
            id: {
              in: roomIds,
            },
          },
        },
        checkIn: {
          lt: new Date(checkOut),
        },
        checkOut: {
          gt: new Date(checkIn),
        },
      },
    });

    if (overlappingBookings.length > 0) {
      return {
        message: "Booking overlaps with existing booking",
      };
    }

    // Create booking
    await prisma.booking.create({
      data: {
        guestId: guestId,
        checkIn: new Date(checkIn),
        checkOut: new Date(checkOut),
        totalAmount: totalAmount,
        channel: channel,
        notes: notes,
        teamId: teamId,
        rooms: {
          connect: roomIds.map((roomId: string) => ({ id: roomId })),
        },
      },
    });
  } catch (error: any) {
    console.error(error);
    return {
      message: "Failed to create booking",
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
  redirect(`/teams/${teamId}/bookings`);
}
