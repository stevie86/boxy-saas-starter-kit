"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createBookingSchema, updateBookingSchema } from '@/lib/validation/booking';
import { getSession } from "@/lib/session";

export async function createBookingAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  const teamId = session.team.id;
  
  try {
    const guestId = formData.get("guestId") as string;
    const checkIn = formData.get("checkIn") as string;
    const checkOut = formData.get("checkOut") as string;
    const totalAmount = parseFloat(formData.get("totalAmount") as string);
    const channel = formData.get("channel") as string || undefined;
    const notes = formData.get("notes") as string || undefined;
    const roomIdsArray = formData.getAll("roomIds");
    const roomIds = Array.isArray(roomIdsArray) ? roomIdsArray.map(id => id.toString()) : [];
    
    const validatedData = createBookingSchema.parse({
      teamId,
      guestId,
      checkIn,
      checkOut,
      totalAmount,
      channel,
      notes,
      roomIds,
    });

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
        status: {
          notIn: ["cancelled", "no_show", "checked_out"],
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
        success: false,
        error: "Booking overlaps with existing booking",
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
        status: "pending",
        paymentStatus: "pending",
        rooms: {
          connect: roomIds.map((roomId: string) => ({ id: roomId })),
        },
      },
    });

    revalidatePath(`/teams/${session.team.slug}/bookings`);
    return { success: true };
  } catch (error) {
    console.error("Error creating booking:", error);
    return { success: false, error: "Failed to create booking" };
  }
}

export async function cancelBookingAction(id: string) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the booking belongs to the team
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingBooking) {
      return { success: false, error: "Booking not found" };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status: 'cancelled',
      },
    });

    revalidatePath(`/teams/${session.team.slug}/bookings`);
    revalidatePath(`/teams/${session.team.slug}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling booking:", error);
    return { success: false, error: "Failed to cancel booking" };
  }
}

export async function checkInAction(id: string) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the booking belongs to the team
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingBooking) {
      return { success: false, error: "Booking not found" };
    }

    if (existingBooking.status !== "pending" && existingBooking.status !== "confirmed") {
      return { success: false, error: "Booking cannot be checked in" };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked_in',
        actualCheckIn: new Date(),
      },
    });

    revalidatePath(`/teams/${session.team.slug}/bookings`);
    revalidatePath(`/teams/${session.team.slug}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Error checking in booking:", error);
    return { success: false, error: "Failed to check in booking" };
  }
}

export async function checkOutAction(id: string) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the booking belongs to the team
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingBooking) {
      return { success: false, error: "Booking not found" };
    }

    if (existingBooking.status !== "checked_in") {
      return { success: false, error: "Booking cannot be checked out" };
    }

    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked_out',
        actualCheckOut: new Date(),
      },
    });

    revalidatePath(`/teams/${session.team.slug}/bookings`);
    revalidatePath(`/teams/${session.team.slug}/dashboard`);
    return { success: true };
  } catch (error) {
    console.error("Error checking out booking:", error);
    return { success: false, error: "Failed to check out booking" };
  }
}

export async function updateBookingAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    const id = formData.get("id") as string;
    const status = formData.get("status") as string;
    const paymentStatus = formData.get("paymentStatus") as string;
    
    // Verify the booking belongs to the team
    const existingBooking = await prisma.booking.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingBooking) {
      return { success: false, error: "Booking not found" };
    }

    const validatedData = updateBookingSchema.parse({
      id,
      status,
      paymentStatus,
    });

    await prisma.booking.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath(`/teams/${session.team.slug}/bookings`);
    return { success: true };
  } catch (error) {
    console.error("Error updating booking:", error);
    return { success: false, error: "Failed to update booking" };
  }
}
