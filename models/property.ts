import { prisma } from '@/lib/prisma';
import type { Property } from '@prisma/client';

export interface CreatePropertyParams {
  teamId: string;
  name: string;
  city: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  taxRate?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface UpdatePropertyParams {
  name?: string;
  city?: string;
  country?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  timezone?: string;
  currency?: string;
  taxRate?: string;
  checkInTime?: string;
  checkOutTime?: string;
}

export const createProperty = async (params: CreatePropertyParams): Promise<Property> => {
  return await prisma.property.create({
    data: params,
  });
};

export const getProperty = async (teamId: string): Promise<Property | null> => {
  return await prisma.property.findUnique({
    where: { teamId },
    include: {
      rooms: true,
      _count: {
        select: {
          rooms: true,
          bookings: true,
          guests: true,
        },
      },
    },
  });
};

export const updateProperty = async (
  teamId: string,
  params: UpdatePropertyParams
): Promise<Property> => {
  return await prisma.property.update({
    where: { teamId },
    data: params,
  });
};

export const deleteProperty = async (teamId: string): Promise<void> => {
  await prisma.property.delete({
    where: { teamId },
  });
};
