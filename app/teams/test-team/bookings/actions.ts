'use server';

import { revalidatePath } from 'next/cache';
import { CreateBookingInput, UpdateBookingInput, createBookingSchema, updateBookingSchema } from '@/lib/validation/booking';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createBookingAction(data: CreateBookingInput, teamId: string) {
  const validatedFields = createBookingSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.booking.create({
      data: {
        ...validatedFields.data,
        property: {
          connect: {
            teamId: teamId,
          },
        },
      },
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to create booking.',
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
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to cancel booking.',
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}

export async function checkInAction(id: string, teamId: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked-in',
      },
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to check in booking.',
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}

export async function checkOutAction(id: string, teamId: string) {
  try {
    await prisma.booking.update({
      where: { id },
      data: {
        status: 'checked-out',
      },
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to check out booking.',
    };
  }

  revalidatePath(`/teams/${teamId}/bookings`);
}
