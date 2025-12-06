import { prisma } from "@/lib/prisma";

export async function getGuests(teamId: string) {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        teamId: teamId,
      },
    });
    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

export async function getGuestById(id: string) {
  try {
    const guest = await prisma.guest.findUnique({
      where: {
        id: id,
      },
    });
    return guest;
  } catch (error) {
    console.error("Error fetching guest:", error);
    return null;
  }
}
