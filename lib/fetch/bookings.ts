import { prisma } from "@/lib/prisma";

export async function getBookings(teamId: string) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        teamId: teamId,
      },
      include: {
        guest: true,
        room: true,
      },
    });
    return bookings;
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return [];
  }
}

export async function getBookingById(id: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: {
        id: id,
      },
      include: {
        guest: true,
        room: true,
      },
    });
    return booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    return null;
  }
}
