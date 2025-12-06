import { prisma } from '@/lib/prisma';
import type { Guest, Booking } from '@prisma/client';

export interface CreateGuestParams {
  propertyId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  nationality?: string;
  documentType?: string;
  documentId?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateGuestParams {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  nationality?: string;
  documentType?: string;
  documentId?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
  blacklisted?: boolean;
}

export type GuestWithBookings = Guest & {
  bookings: (Booking & {
    beds: { room: { name: string } }[];
  })[];
};

export const createGuest = async (params: CreateGuestParams): Promise<Guest> => {
  return await prisma.guest.create({
    data: params,
  });
};

export const getGuests = async (
  propertyId: string,
  filters?: {
    search?: string;
    blacklisted?: boolean;
  }
): Promise<GuestWithBookings[]> => {
  const where: any = { propertyId };

  if (filters?.blacklisted !== undefined) {
    where.blacklisted = filters.blacklisted;
  }

  if (filters?.search) {
    where.OR = [
      { firstName: { contains: filters.search, mode: 'insensitive' } },
      { lastName: { contains: filters.search, mode: 'insensitive' } },
      { email: { contains: filters.search, mode: 'insensitive' } },
      { documentId: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  return await prisma.guest.findMany({
    where,
    include: {
      bookings: {
        include: {
          beds: {
            include: {
              room: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { checkIn: 'desc' },
        take: 5, // Last 5 bookings
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getGuest = async (id: string): Promise<GuestWithBookings | null> => {
  return await prisma.guest.findUnique({
    where: { id },
    include: {
      bookings: {
        include: {
          beds: {
            include: {
              room: {
                select: {
                  name: true,
                },
              },
            },
          },
        },
        orderBy: { checkIn: 'desc' },
      },
    },
  });
};

export const updateGuest = async (id: string, params: UpdateGuestParams): Promise<Guest> => {
  return await prisma.guest.update({
    where: { id },
    data: params,
  });
};

export const deleteGuest = async (id: string): Promise<void> => {
  await prisma.guest.delete({
    where: { id },
  });
};

export const findGuestByEmail = async (
  propertyId: string,
  email: string
): Promise<Guest | null> => {
  return await prisma.guest.findFirst({
    where: {
      propertyId,
      email,
    },
  });
};

export const findGuestByDocument = async (
  propertyId: string,
  documentId: string
): Promise<Guest | null> => {
  return await prisma.guest.findFirst({
    where: {
      propertyId,
      documentId,
    },
  });
};
