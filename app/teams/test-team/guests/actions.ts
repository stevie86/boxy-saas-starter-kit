'use server';

import { revalidatePath } from 'next/cache';
import { CreateGuestInput, UpdateGuestInput, createGuestSchema, updateGuestSchema } from '@/lib/validation/guest';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createGuestAction(data: CreateGuestInput, teamId: string) {
  const validatedFields = createGuestSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.guest.create({
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
      message: 'Failed to create guest.',
    };
  }

  revalidatePath(`/teams/${teamId}/guests`);
  redirect(`/teams/${teamId}/guests`);
}

export async function updateGuestAction(id: string, data: UpdateGuestInput, teamId: string) {
  const validatedFields = updateGuestSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.guest.update({
      where: { id },
      data: validatedFields.data,
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to update guest.',
    };
  }

  revalidatePath(`/teams/${teamId}/guests`);
  redirect(`/teams/${teamId}/guests`);
}

export async function toggleBlacklistAction(id: string, blacklisted: boolean, teamId: string) {
  try {
    await prisma.guest.update({
      where: { id },
      data: {
        blacklisted: !blacklisted,
      },
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to toggle blacklist status.',
    };
  }

  revalidatePath(`/teams/${teamId}/guests`);
}
