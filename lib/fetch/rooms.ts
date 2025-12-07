import { prisma } from "@/lib/prisma";

export async function getRooms(teamId: string) {
  try {
    const rooms = await prisma.room.findMany({
      where: {
        teamId: teamId,
      },
      orderBy: {
        name: "asc",
      },
    });
    return rooms;
  } catch (error) {
    console.error("Error fetching rooms:", error);
    return [];
  }
}

export async function getRoomById(id: string, teamId: string) {
  try {
    const room = await prisma.room.findFirst({
      where: {
        id: id,
        teamId: teamId,
      },
    });
    return room;
  } catch (error) {
    console.error("Error fetching room:", error);
    return null;
  }
}

export async function getAvailableRooms(teamId: string, checkIn: Date, checkOut: Date) {
  try {
    // Get all rooms for the team
    const allRooms = await prisma.room.findMany({
      where: {
        teamId: teamId,
        status: "available",
      },
    });
    
    // Get rooms with bookings that overlap with the requested dates
    const bookings = await prisma.booking.findMany({
      where: {
        teamId: teamId,
        status: {
          notIn: ["cancelled", "no_show"],
        },
        OR: [
          {
            // Booking starts during the requested period
            checkIn: {
              gte: checkIn,
              lt: checkOut,
            },
          },
          {
            // Booking ends during the requested period
            checkOut: {
              gt: checkIn,
              lte: checkOut,
            },
          },
          {
            // Booking spans the entire requested period
            checkIn: {
              lte: checkIn,
            },
            checkOut: {
              gte: checkOut,
            },
          },
        ],
      },
      include: {
        rooms: true,
      },
    });
    
    // Get all room IDs that are booked during the requested period
    const bookedRoomIds = new Set();
    bookings.forEach(booking => {
      booking.rooms.forEach(room => {
        bookedRoomIds.add(room.id);
      });
    });
    
    // Filter out booked rooms
    const availableRooms = allRooms.filter(room => !bookedRoomIds.has(room.id));
    
    return availableRooms;
  } catch (error) {
    console.error("Error fetching available rooms:", error);
    return [];
  }
}
