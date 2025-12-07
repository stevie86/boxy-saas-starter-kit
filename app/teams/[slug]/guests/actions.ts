"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createGuestSchema, updateGuestSchema } from "@/lib/validation/guest";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createGuestAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  const teamId = session.team.id;
  
  try {
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string || undefined;
    const phone = formData.get("phone") as string || undefined;
    const dateOfBirth = formData.get("dateOfBirth") as string || undefined;
    const nationality = formData.get("nationality") as string || undefined;
    const documentType = formData.get("documentType") as string || undefined;
    const documentId = formData.get("documentId") as string || undefined;
    const address = formData.get("address") as string || undefined;
    const city = formData.get("city") as string || undefined;
    const country = formData.get("country") as string || undefined;
    const notes = formData.get("notes") as string || undefined;
    
    const validatedData = createGuestSchema.parse({
      teamId,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      documentType,
      documentId,
      address,
      city,
      country,
      notes,
    });

    await prisma.guest.create({
      data: validatedData,
    });

    revalidatePath(`/teams/${session.team.slug}/guests`);
    return { success: true };
  } catch (error) {
    console.error("Error creating guest:", error);
    return { success: false, error: "Failed to create guest" };
  }
}

export async function updateGuestAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    const id = formData.get("id") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const email = formData.get("email") as string || undefined;
    const phone = formData.get("phone") as string || undefined;
    const dateOfBirth = formData.get("dateOfBirth") as string || undefined;
    const nationality = formData.get("nationality") as string || undefined;
    const documentType = formData.get("documentType") as string || undefined;
    const documentId = formData.get("documentId") as string || undefined;
    const address = formData.get("address") as string || undefined;
    const city = formData.get("city") as string || undefined;
    const country = formData.get("country") as string || undefined;
    const notes = formData.get("notes") as string || undefined;
    const blacklisted = formData.get("blacklisted") === "true";
    
    // Verify the guest belongs to the team
    const existingGuest = await prisma.guest.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingGuest) {
      return { success: false, error: "Guest not found" };
    }

    const validatedData = updateGuestSchema.parse({
      id,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      nationality,
      documentType,
      documentId,
      address,
      city,
      country,
      notes,
      blacklisted,
    });

    await prisma.guest.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath(`/teams/${session.team.slug}/guests`);
    return { success: true };
  } catch (error) {
    console.error("Error updating guest:", error);
    return { success: false, error: "Failed to update guest" };
  }
}

export async function toggleBlacklistAction(id: string) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    // Verify the guest belongs to the team
    const existingGuest = await prisma.guest.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingGuest) {
      return { success: false, error: "Guest not found" };
    }

    await prisma.guest.update({
      where: { id },
      data: {
        blacklisted: !existingGuest.blacklisted,
      },
    });

    revalidatePath(`/teams/${session.team.slug}/guests`);
    return { success: true };
  } catch (error) {
    console.error("Error toggling blacklist:", error);
    return { success: false, error: "Failed to toggle blacklist status" };
  }
}
