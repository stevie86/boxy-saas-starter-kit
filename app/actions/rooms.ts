'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const RoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['dormitory', 'private', 'suite']),
  beds: z.coerce.number().min(1, 'At least one bed is required'),
  pricePerNight: z.coerce.number().min(0, 'Price cannot be negative'),
  maxOccupancy: z.coerce.number().min(1, 'Max occupancy must be at least 1'),
});

export async function createRoom(propertyId: string, prevState: any, formData: FormData) {
  const validatedFields = RoomSchema.safeParse({
    name: formData.get('name'),
    type: formData.get('type'),
    beds: formData.get('beds'),
    pricePerNight: formData.get('pricePerNight'),
    maxOccupancy: formData.get('maxOccupancy'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Missing Fields. Failed to Create Room.',
    };
  }

  const { name, type, beds, pricePerNight, maxOccupancy } = validatedFields.data;
  const priceInCents = Math.round(pricePerNight * 100);

  try {
    await prisma.room.create({
      data: {
        propertyId,
        name,
        type,
        beds,
        pricePerNight: priceInCents,
        maxOccupancy,
        status: 'available',
      },
    });
  } catch (error) {
    console.error('Database Error:', error);
    return {
      message: 'Database Error: Failed to Create Room.',
    };
  }

  revalidatePath(`/properties/${propertyId}`);
  redirect(`/properties/${propertyId}`);
}

export async function deleteRoom(propertyId: string, roomId: string) {
  try {
    await prisma.room.delete({
      where: { id: roomId },
    });
    revalidatePath(`/properties/${propertyId}`);
  } catch (error) {
    console.error('Failed to delete room:', error);
    // In a real app, we might want to throw or handle this differently,
    // but for the form action type compatibility, we return void.
  }
}
