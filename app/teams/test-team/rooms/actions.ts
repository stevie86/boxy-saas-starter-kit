'use server';

import { revalidatePath } from 'next/cache';
import { CreateRoomInput, UpdateRoomInput, createRoomSchema, updateRoomSchema } from '@/lib/validation/room';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';

export async function createRoomAction(data: CreateRoomInput, teamId: string) {
  const validatedFields = createRoomSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.room.create({
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
      message: 'Failed to create room.',
    };
  }

  revalidatePath(`/teams/${teamId}/rooms`);
  redirect(`/teams/${teamId}/rooms`);
}

export async function updateRoomAction(id: string, data: UpdateRoomInput, teamId: string) {
  const validatedFields = updateRoomSchema.safeParse(data);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  try {
    await prisma.room.update({
      where: { id },
      data: validatedFields.data,
    });
  } catch (e: any) {
    console.error(e);
    return {
      message: 'Failed to update room.',
    };
  }

  revalidatePath(`/teams/${teamId}/rooms`);
  redirect(`/teams/${teamId}/rooms`);
}
