import { prisma } from "@/lib/prisma";

export async function getRooms(teamId: string) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        teamId: teamId,
      },
    });
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export async function getRoomById(id: string) {
  try {
    const room = await prisma.room.findUnique({
      where: {
        id: id,
      },
    });
    return room;
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}
