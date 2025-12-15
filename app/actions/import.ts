'use server';

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function importGuests(propertyId: string, prevState: any, formData: FormData) {
  const file = formData.get('file') as File;

  if (!file || file.size === 0) {
    return { message: 'No file selected.' };
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/);
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

  // Simple validation of headers
  if (!headers.includes('firstname') || !headers.includes('lastname')) {
    return { message: 'Invalid CSV format. Header must contain firstName and lastName.' };
  }

  const guestsToCreate = [];
  let successCount = 0;
  let failCount = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = line.split(',');
    if (values.length !== headers.length) {
      failCount++;
      continue;
    }

    const guest: any = { propertyId };
    headers.forEach((header, index) => {
      let value = values[index]?.trim();
      // Basic mapping
      if (header === 'firstname') guest.firstName = value;
      if (header === 'lastname') guest.lastName = value;
      if (header === 'email') guest.email = value || null;
      if (header === 'phone') guest.phone = value || null;
      if (header === 'nationality') guest.nationality = value || null;
    });

    if (guest.firstName && guest.lastName) {
      guestsToCreate.push(guest);
    } else {
      failCount++;
    }
  }

  try {
    // Prisma createMany is supported in SQLite? Yes.
    await prisma.guest.createMany({
      data: guestsToCreate,
    });
    successCount = guestsToCreate.length;
  } catch (error) {
    console.error('Import Error:', error);
    return { message: 'Database Error during import.' };
  }

  revalidatePath(`/properties/${propertyId}/guests`);
  // Redirect to list with success message? Or just redirect.
  // For now, redirect.
  redirect(`/properties/${propertyId}/guests`);
}
