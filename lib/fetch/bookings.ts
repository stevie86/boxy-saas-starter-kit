import { prisma } from "@/lib/prisma";

export async function getBookings(teamId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        teamId: teamId,
      },
      include: {
        guest: true,
        rooms: true,
      },
      orderBy: {
        checkIn: "desc",
      },
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function getBookingById(id: string, teamId: string) {
  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id: id,
        teamId: teamId,
      },
      include: {
        guest: true,
        rooms: true,
      },
    });
    return booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}

export async function getTodayCheckIns(teamId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkIns = await prisma.booking.findMany({
      where: {
        teamId: teamId,
        checkIn: {
          gte: today,
          lt: tomorrow,
        },
        status: {
          in: ["pending", "confirmed"],
        },
      },
      include: {
        guest: true,
        rooms: true,
      },
    });
    
    return checkIns;
  } catch (error) {
    console.error("Error fetching today's check-ins:", error);
    return [];
  }
}

export async function getTodayCheckOuts(teamId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const checkOuts = await prisma.booking.findMany({
      where: {
        teamId: teamId,
        checkOut: {
          gte: today,
          lt: tomorrow,
        },
        status: "checked_in",
      },
      include: {
        guest: true,
        rooms: true,
      },
    });
    
    return checkOuts;
  } catch (error) {
    console.error("Error fetching today's check-outs:", error);
    return [];
  }
}

export async function getCurrentOccupancy(teamId: string) {
  try {
    // Get total number of rooms
    const totalRooms = await prisma.room.count({
      where: {
        teamId: teamId,
      },
    });
    
    // Get number of occupied rooms
    const occupiedRooms = await prisma.booking.count({
      where: {
        teamId: teamId,
        status: "checked_in",
        checkIn: {
          lte: new Date(),
        },
        checkOut: {
          gt: new Date(),
        },
      },
    });
    
    // Calculate occupancy percentage
    const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;
    
    return {
      totalRooms,
      occupiedRooms,
      occupancyPercentage,
    };
  } catch (error) {
    console.error("Error calculating occupancy:", error);
    return {
      totalRooms: 0,
      occupiedRooms: 0,
      occupancyPercentage: 0,
    };
  }
}
