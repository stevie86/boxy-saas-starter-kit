import { z } from 'zod';

export const createRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required'),
  type: z.enum(['dormitory', 'private', 'suite']),
  beds: z.number().min(1, 'Beds must be at least 1'),
  pricePerNight: z.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1'),
});

export const updateRoomSchema = z.object({
  name: z.string().min(1, 'Room name is required').optional(),
  type: z.enum(['dormitory', 'private', 'suite']).optional(),
  beds: z.number().min(1, 'Beds must be at least 1').optional(),
  pricePerNight: z.number().min(0, 'Price must be positive').optional(),
  description: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  maxOccupancy: z.number().min(1, 'Max occupancy must be at least 1').optional(),
  status: z.enum(['available', 'maintenance', 'closed']).optional(),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>;
export type UpdateRoomInput = z.infer<typeof updateRoomSchema>;
