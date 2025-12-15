'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Room } from '@prisma/client'; // Import Room type from Prisma

const RoomSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['dormitory', 'private', 'suite']),
  beds: z.coerce.number().min(1, 'At least one bed is required'),
  pricePerNight: z.coerce.number().min(0, 'Price cannot be negative'),
  maxOccupancy: z.coerce.number().min(1, 'Max occupancy must be at least 1'),
});

type RoomForExport = Pick<Room, 'name' | 'type' | 'beds' | 'pricePerNight' | 'maxOccupancy' | 'status'> & {
  [key: string]: string | number | boolean | Date | null | undefined; // Add index signature
};

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



const RoomImportSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  type: z.enum(['dormitory', 'private', 'suite']),
  beds: z.coerce.number().int().min(1, 'At least one bed is required'),
  pricePerNight: z.coerce.number().min(0, 'Price cannot be negative'), // Expecting number like 25.00
  maxOccupancy: z.coerce.number().int().min(1, 'Max occupancy must be at least 1'),
  status: z.enum(['available', 'maintenance', 'closed']).default('available'),
});

export async function importRooms(propertyId: string, prevState: any, formData: FormData) {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { message: 'No file selected.' };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(line => line.trim() !== ''); // Filter empty lines
  const headers = lines[0].split(',').map(h => h.trim());

  // Basic header validation
  const requiredHeaders = ['name', 'type', 'beds', 'pricePerNight', 'maxOccupancy'];
  if (!requiredHeaders.every(header => headers.includes(header))) {
    return { message: `Invalid CSV format. Required headers: ${requiredHeaders.join(', ')}.` };
  }

  const roomsToCreate = [];
  let successCount = 0;
  let failCount = 0;

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

    const parsedRow = RoomImportSchema.safeParse(rowData);

    if (parsedRow.success) {
      const { pricePerNight, ...rest } = parsedRow.data;
      roomsToCreate.push({
        propertyId,
        pricePerNight: Math.round(pricePerNight * 100), // Convert to cents
        ...rest,
      });
    } else {
      failCount++;
      console.warn(`Skipping invalid row: ${line}. Errors: ${JSON.stringify(parsedRow.error.flatten().fieldErrors)}`);
    }
  }

  if (roomsToCreate.length === 0) {
    return { message: 'No valid rooms found to import.' };
  }

  try {
    const { count } = await prisma.room.createMany({
      data: roomsToCreate,
      skipDuplicates: true, // Optional: if you want to skip rooms with existing unique constraints
    });
    successCount = count;
  } catch (error) {
    console.error('Import Rooms Error:', error);
    return { message: 'Database Error during room import.' };
  }

  revalidatePath(`/properties/${propertyId}`);
  redirect(`/properties/${propertyId}`); // Redirect back to property details page
}
