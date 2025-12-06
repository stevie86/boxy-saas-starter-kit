import { prisma } from '@/lib/prisma';
import type { Room, BookingBed } from '@prisma/client';

export interface CreateRoomParams {
  propertyId: string;
  name: string;
  type: string;
  beds?: number;
  pricePerNight?: number;
  status?: string;
  description?: string;
  amenities?: string[];
  maxOccupancy?: number;
}

export interface UpdateRoomParams {
  name?: string;
  type?: string;
  beds?: number;
  pricePerNight?: number;
  status?: string;
  description?: string;
  amenities?: string[];
  maxOccupancy?: number;
}

export const createRoom = async (params: CreateRoomParams): Promise<Room> => {
  return await prisma.room.create({
    data: params,
  });
};

export const getRooms = async (propertyId: string): Promise<Room[]> => {
  return await prisma.room.findMany({
    where: { propertyId },
    orderBy: { name: 'asc' },
  });
};

export const getRoom = async (id: string): Promise<Room | null> => {
  return await prisma.room.findUnique({
    where: { id },
    include: {
      bookingBeds: {
        include: {
          booking: true,
        },
      },
    },
  });
};

export const updateRoom = async (id: string, params: UpdateRoomParams): Promise<Room> => {
  return await prisma.room.update({
    where: { id },
    data: params,
  });
};

export const deleteRoom = async (id: string): Promise<void> => {
  await prisma.room.delete({
    where: { id },
  });
};

export const getRoomAvailability = async (
  propertyId: string,
  checkIn: Date,
  checkOut: Date
): Promise<Room[]> => {
  return await prisma.room.findMany({
    where: {
      propertyId,
      status: 'available',
      bookingBeds: {
        none: {
          booking: {
            OR: [
              {
                AND: [
                  { checkIn: { lte: checkIn } },
                  { checkOut: { gt: checkIn } },
                ],
              },
              {
                AND: [
                  { checkIn: { lt: checkOut } },
                  { checkOut: { gte: checkOut } },
                ],
              },
              {
                AND: [
                  { checkIn: { gte: checkIn } },
                  { checkOut: { lte: checkOut } },
                ],
              },
            ],
            status: {
              notIn: ['cancelled', 'no_show'],
            },
          },
        },
      },
    },
    include: {
      bookingBeds: {
        include: {
          booking: true,
        },
      },
    },
  });
};
