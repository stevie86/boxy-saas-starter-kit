"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { createRoomSchema, updateRoomSchema } from "@/lib/validation/room";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createRoomAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  const teamId = session.team.id;
  
  try {
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const beds = parseInt(formData.get("beds") as string);
    const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
    const description = formData.get("description") as string || "";
    const amenitiesString = formData.get("amenities") as string || "";
    const amenities = amenitiesString ? amenitiesString.split(",").map(item => item.trim()) : [];
    const maxOccupancy = parseInt(formData.get("maxOccupancy") as string);
    
    const validatedData = createRoomSchema.parse({
      teamId,
      name,
      type,
      beds,
      pricePerNight,
      description,
      amenities,
      maxOccupancy,
    });

    await prisma.room.create({
      data: validatedData,
    });

    revalidatePath(`/teams/${session.team.slug}/rooms`);
    return { success: true };
  } catch (error) {
    console.error("Error creating room:", error);
    return { success: false, error: "Failed to create room" };
  }
}

export async function updateRoomAction(formData: FormData) {
  const session = await getSession();

  if (!session?.team) {
    throw new Error("Unauthorized");
  }

  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const type = formData.get("type") as string;
    const beds = parseInt(formData.get("beds") as string);
    const pricePerNight = parseFloat(formData.get("pricePerNight") as string);
    const description = formData.get("description") as string || "";
    const amenitiesString = formData.get("amenities") as string || "";
    const amenities = amenitiesString ? amenitiesString.split(",").map(item => item.trim()) : [];
    const maxOccupancy = parseInt(formData.get("maxOccupancy") as string);
    const status = formData.get("status") as string;
    
    // Verify the room belongs to the team
    const existingRoom = await prisma.room.findFirst({
      where: {
        id,
        teamId: session.team.id,
      },
    });

    if (!existingRoom) {
      return { success: false, error: "Room not found" };
    }

    const validatedData = updateRoomSchema.parse({
      id,
      name,
      type,
      beds,
      pricePerNight,
      description,
      amenities,
      maxOccupancy,
      status,
    });

    await prisma.room.update({
      where: { id },
      data: validatedData,
    });

    revalidatePath(`/teams/${session.team.slug}/rooms`);
    return { success: true };
  } catch (error) {
    console.error("Error updating room:", error);
    return { success: false, error: "Failed to update room" };
  }
}
