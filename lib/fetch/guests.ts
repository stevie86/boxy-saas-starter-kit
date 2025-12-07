import { prisma } from "@/lib/prisma";

export async function getGuests(teamId: string) {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        teamId: teamId,
      },
      orderBy: {
        lastName: "asc",
      },
    });
    return guests;
  } catch (error) {
    console.error("Error fetching guests:", error);
    return [];
  }
}

export async function getGuestById(id: string, teamId: string) {
  try {
    const guest = await prisma.guest.findFirst({
      where: {
        id: id,
        teamId: teamId,
      },
      include: {
        bookings: {
          include: {
            rooms: true,
          },
          orderBy: {
            checkIn: "desc",
          },
        },
      },
    });
    return guest;
  } catch (error) {
    console.error("Error fetching guest:", error);
    return null;
  }
}

export async function searchGuests(teamId: string, query: string) {
  try {
    const guests = await prisma.guest.findMany({
      where: {
        teamId: teamId,
        OR: [
          {
            firstName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: query,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: query,
              mode: "insensitive",
            },
          },
        ],
      },
    });
    return guests;
  } catch (error) {
    console.error("Error searching guests:", error);
    return [];
  }
}

export async function getBlacklistedGuests(teamId: string) {
  try {
    const blacklistedGuests = await prisma.guest.findMany({
      where: {
        teamId: teamId,
        blacklisted: true,
      },
    });
    return blacklistedGuests;
  } catch (error) {
    console.error("Error fetching blacklisted guests:", error);
    return [];
  }
}
