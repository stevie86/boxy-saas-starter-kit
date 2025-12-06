import { prisma } from '@/lib/prisma';
import type { Booking, BookingBed, Guest } from '@prisma/client';
import { generateToken } from '@/lib/server-common';

export interface CreateBookingParams {
  propertyId: string;
  guestId?: string;
  checkIn: Date;
  checkOut: Date;
  status?: string;
  channel?: string;
  totalAmount?: number;
  notes?: string;
  beds: {
    roomId: string;
    bedLabel: string;
    pricePerNight?: number;
  }[];
}

export interface UpdateBookingParams {
  guestId?: string;
  checkIn?: Date;
  checkOut?: Date;
  status?: string;
  channel?: string;
  totalAmount?: number;
  amountPaid?: number;
  paymentStatus?: string;
  notes?: string;
}

export type BookingWithDetails = Booking & {
  guest: Guest | null;
  beds: (BookingBed & { room: { name: string; type: string } })[];
  payments: { amount: number; method: string; createdAt: Date }[];
};

export const createBooking = async (params: CreateBookingParams): Promise<Booking> => {
  const confirmationCode = generateToken(8).toUpperCase();
  
  return await prisma.booking.create({
    data: {
      propertyId: params.propertyId,
      guestId: params.guestId,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      status: params.status || 'confirmed',
      channel: params.channel,
      totalAmount: params.totalAmount || 0,
      notes: params.notes,
      confirmationCode,
      beds: {
        create: params.beds,
      },
    },
    include: {
      guest: true,
      beds: {
        include: {
          room: true,
        },
      },
    },
  });
};

export const getBookings = async (
  propertyId: string,
  filters?: {
    status?: string;
    checkIn?: Date;
    checkOut?: Date;
    guestName?: string;
  }
): Promise<BookingWithDetails[]> => {
  const where: any = { propertyId };

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.checkIn) {
    where.checkIn = { gte: filters.checkIn };
  }

  if (filters?.checkOut) {
    where.checkOut = { lte: filters.checkOut };
  }

  if (filters?.guestName) {
    where.guest = {
      OR: [
        { firstName: { contains: filters.guestName, mode: 'insensitive' } },
        { lastName: { contains: filters.guestName, mode: 'insensitive' } },
      ],
    };
  }

  return await prisma.booking.findMany({
    where,
    include: {
      guest: true,
      beds: {
        include: {
          room: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
      payments: {
        select: {
          amount: true,
          method: true,
          createdAt: true,
        },
      },
    },
    orderBy: { checkIn: 'asc' },
  });
};

export const getBooking = async (id: string): Promise<BookingWithDetails | null> => {
  return await prisma.booking.findUnique({
    where: { id },
    include: {
      guest: true,
      beds: {
        include: {
          room: {
            select: {
              name: true,
              type: true,
            },
          },
        },
      },
      payments: {
        select: {
          amount: true,
          method: true,
          createdAt: true,
        },
      },
    },
  });
};

export const updateBooking = async (
  id: string,
  params: UpdateBookingParams
): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: params,
  });
};

export const deleteBooking = async (id: string): Promise<void> => {
  await prisma.booking.delete({
    where: { id },
  });
};

export const checkInBooking = async (id: string): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'checked_in',
    },
  });
};

export const checkOutBooking = async (id: string): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'checked_out',
    },
  });
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  return await prisma.booking.update({
    where: { id },
    data: {
      status: 'cancelled',
    },
  });
};
