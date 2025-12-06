import { z } from 'zod';

export const createBookingSchema = z.object({
  guestId: z.string().min(1, 'Guest is required'),
  checkIn: z.string().min(1, 'Check-in date is required'),
  checkOut: z.string().min(1, 'Check-out date is required'),
  totalAmount: z.number().min(0, 'Total amount must be positive'),
  channel: z.string().optional(),
  notes: z.string().optional(),
  roomIds: z.array(z.string()).min(1, 'At least one room is required'),
}).refine((data) => {
  const checkIn = new Date(data.checkIn);
  const checkOut = new Date(data.checkOut);
  return checkOut > checkIn;
}, {
  message: 'Check-out date must be after check-in date',
  path: ['checkOut']
});

export const updateBookingSchema = z.object({
  guestId: z.string().optional(),
  checkIn: z.string().optional(),
  checkOut: z.string().optional(),
  totalAmount: z.number().min(0, 'Total amount must be positive').optional(),
  channel: z.string().optional(),
  notes: z.string().optional(),
  status: z.enum(['pending', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'no_show']).optional(),
  paymentStatus: z.enum(['pending', 'partial', 'paid', 'refunded']).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
