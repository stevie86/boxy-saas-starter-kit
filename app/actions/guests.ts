'use server';

import { z } from 'zod';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

const GuestSchema = z.object({
  firstName: z.string().min(1, 'First Name is required'),
  lastName: z.string().min(1, 'Last Name is required'),
  email: z.string().email().optional().or(z.literal('')),
  phone: z.string().optional(),
  nationality: z.string().optional(),
  documentId: z.string().optional(),
});

export async function createGuest(propertyId: string, prevState: any, formData: FormData) {
  const validatedFields = GuestSchema.safeParse({
    firstName: formData.get('firstName'),
    lastName: formData.get('lastName'),
    email: formData.get('email'),
    phone: formData.get('phone'),
    nationality: formData.get('nationality'),
    documentId: formData.get('documentId'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: 'Validation Error',
    };
  }

  const { firstName, lastName, email, phone, nationality, documentId } = validatedFields.data;

  try {
    await prisma.guest.create({
      data: {
        propertyId,
        firstName,
        lastName,
        email: email || null,
        phone: phone || null,
        nationality: nationality || null,
        documentId: documentId || null,
      },
    });

    revalidatePath(`/properties/${propertyId}/guests`);
  } catch (error) {
    console.error('Create Guest Error:', error);
    return { message: 'Database Error: Failed to create guest.' };
  }

  redirect(`/properties/${propertyId}/guests`);
}
