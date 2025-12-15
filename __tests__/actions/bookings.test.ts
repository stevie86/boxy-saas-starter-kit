// __tests__/actions/bookings.test.ts
import { createBooking } from '@/app/actions/bookings';
import prisma from '@/lib/db';

// Mock Next.js functions
jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));
jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@/lib/db', () => ({
  room: {
    findUnique: jest.fn(),
  },
  bookingBed: {
    count: jest.fn(),
    create: jest.fn(),
  },
  guest: {
    create: jest.fn(),
  },
  booking: {
    create: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRevalidatePath = require('next/cache').revalidatePath as jest.Mock;
const mockRedirect = require('next/navigation').redirect as jest.Mock;

describe('Bookings Server Actions', () => {
  const PROPERTY_ID = 'test-property-id';
  const ROOM_ID = 'test-room-id';
  const GUEST_ID = 'test-guest-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const mockRoom = {
      id: ROOM_ID,
      propertyId: PROPERTY_ID,
      name: 'Dorm 1',
      type: 'dormitory',
      beds: 8,
      pricePerNight: 2500,
      maxOccupancy: 8,
      status: 'available',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockGuest = {
      id: GUEST_ID,
      propertyId: PROPERTY_ID,
      firstName: 'Test',
      lastName: 'Guest',
      email: 'test@example.com',
      phone: null,
      nationality: null,
      documentId: null,
      dateOfBirth: null,
      address: null,
      city: null,
      country: null,
      notes: null,
      blacklisted: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockBooking = {
      id: 'test-booking-id',
      propertyId: PROPERTY_ID,
      guestId: GUEST_ID,
      roomId: ROOM_ID,
      checkIn: new Date('2025-01-10T00:00:00.000Z'),
      checkOut: new Date('2025-01-12T00:00:00.000Z'),
      status: 'confirmed',
      totalAmount: 5000,
      amountPaid: 5000,
      paymentStatus: 'paid',
      confirmationCode: 'ABCDEF123',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create a booking and redirect on success', async () => {
      const formData = new FormData();
      formData.append('roomId', ROOM_ID);
      formData.append('guestName', 'John Doe');
      formData.append('checkIn', '2025-01-10');
      formData.append('checkOut', '2025-01-12');

      mockPrisma.room.findUnique.mockResolvedValueOnce(mockRoom);
      mockPrisma.bookingBed.count.mockResolvedValueOnce(0); // No overlapping bookings
      mockPrisma.guest.create.mockResolvedValueOnce(mockGuest);
      mockPrisma.booking.create.mockResolvedValueOnce(mockBooking);
      mockPrisma.bookingBed.create.mockResolvedValueOnce({
        id: 'booking-bed-id',
        bookingId: mockBooking.id,
        roomId: mockRoom.id,
        bedLabel: 'Auto-Assigned',
        pricePerNight: mockRoom.pricePerNight,
      });

      await createBooking(PROPERTY_ID, null, formData);

      expect(mockPrisma.room.findUnique).toHaveBeenCalledWith({ where: { id: ROOM_ID } });
      expect(mockPrisma.bookingBed.count).toHaveBeenCalledTimes(1);
      expect(mockPrisma.guest.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          propertyId: PROPERTY_ID,
          firstName: 'John',
          lastName: 'Doe',
        }),
      });
      expect(mockPrisma.booking.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          propertyId: PROPERTY_ID,
          guestId: GUEST_ID,
          checkIn: new Date('2025-01-10T00:00:00.000Z'),
          checkOut: new Date('2025-01-12T00:00:00.000Z'),
        }),
      });
      expect(mockPrisma.bookingBed.create).toHaveBeenCalledTimes(1);
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}`);
      expect(mockRedirect).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/bookings`);
    });

    it('should return an error for invalid form data', async () => {
      const formData = new FormData(); // Empty form data

      const result = await createBooking(PROPERTY_ID, null, formData);

      expect(result).toHaveProperty('errors');
      expect(result?.errors).toHaveProperty('roomId');
      expect(result?.errors).toHaveProperty('guestName');
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return an error if check-out date is before check-in date', async () => {
      const formData = new FormData();
      formData.append('roomId', ROOM_ID);
      formData.append('guestName', 'John Doe');
      formData.append('checkIn', '2025-01-12');
      formData.append('checkOut', '2025-01-10');

      const result = await createBooking(PROPERTY_ID, null, formData);

      expect(result).toEqual({ message: 'Check-out date must be after check-in date.' });
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return an error if the room is fully booked', async () => {
      const formData = new FormData();
      formData.append('roomId', ROOM_ID);
      formData.append('guestName', 'John Doe');
      formData.append('checkIn', '2025-01-10');
      formData.append('checkOut', '2025-01-12');

      mockPrisma.room.findUnique.mockResolvedValueOnce(mockRoom);
      mockPrisma.bookingBed.count.mockResolvedValueOnce(mockRoom.beds); // Fully booked

      const result = await createBooking(PROPERTY_ID, null, formData);

      expect(result).toEqual({ message: 'Room is fully booked for these dates.' });
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });

    it('should return a database error message on Prisma failure', async () => {
      const formData = new FormData();
      formData.append('roomId', ROOM_ID);
      formData.append('guestName', 'John Doe');
      formData.append('checkIn', '2025-01-10');
      formData.append('checkOut', '2025-01-12');

      mockPrisma.room.findUnique.mockResolvedValueOnce(mockRoom);
      mockPrisma.bookingBed.count.mockResolvedValueOnce(0);
      mockPrisma.guest.create.mockRejectedValueOnce(new Error('DB guest creation failed')); // Simulate DB error

      const result = await createBooking(PROPERTY_ID, null, formData);

      expect(result).toEqual({ message: 'Database Error: Failed to create booking.' });
      expect(mockPrisma.booking.create).not.toHaveBeenCalled();
    });
  });
});
