"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createBookingSchema, updateBookingSchema } from '@/lib/validation/booking';
import { safeParse } from "valibot";
import { toast } from 'react-toastify';

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
    toast.error("Failed to create booking");
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
      toast.error("Booking overlaps with existing booking");
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

    toast.success("Booking created successfully");
  } catch (error: any) {
    toast.error("Failed to create booking");
    console.error(error);
    return {
      message: "Failed to create booking",
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
  redirect(`/teams/${teamId}/bookings`);
}

export async function cancelBookingAction(id: string, teamId: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });
    toast.success("Booking cancelled successfully");
  } catch (error: any) {
    toast.error("Failed to cancel booking");
    console.error(error);
    return {
      message: "Failed to cancel booking",
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}

export async function checkInAction(id: string, teamId: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked_in',
      },
    });
    toast.success("Booking checked in successfully");
  } catch (error: any) {
    toast.error("Failed to check in booking");
    console.error(error);
    return {
      message: "Failed to check in booking",
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}

export async function checkOutAction(id: string, teamId: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked_out',
      },
    });
    toast.success("Booking checked out successfully");
  } catch (error: any) {
    toast.error("Failed to check out booking");
    console.error(error);
    return {
      message: "Failed to check out booking",
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}
