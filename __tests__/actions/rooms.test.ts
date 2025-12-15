// __tests__/actions/rooms.test.ts
import { createRoom, deleteRoom } from '@/app/actions/rooms';
import prisma from '@/lib/db'; // Assuming '@/lib/db' exports a PrismaClient instance

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
    create: jest.fn(),
    delete: jest.fn(),
  },
  property: { // Needed for createRoom in some cases (e.g. context)
    findUnique: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRevalidatePath = require('next/cache').revalidatePath as jest.Mock;
const mockRedirect = require('next/navigation').redirect as jest.Mock;

describe('Rooms Server Actions', () => {
  const PROPERTY_ID = 'test-property-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test createRoom
  describe('createRoom', () => {
    it('should create a room and redirect on success', async () => {
      const formData = new FormData();
      formData.append('name', 'Test Room');
      formData.append('type', 'private');
      formData.append('beds', '2');
      formData.append('pricePerNight', '50.00');
      formData.append('maxOccupancy', '2');

      mockPrisma.room.create.mockResolvedValueOnce({
        id: 'new-room-id',
        propertyId: PROPERTY_ID,
        name: 'Test Room',
        type: 'private',
        beds: 2,
        pricePerNight: 5000,
        maxOccupancy: 2,
        status: 'available',
        description: null,
        amenities: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createRoom(PROPERTY_ID, null, formData); // prevState is null for initial call

      expect(mockPrisma.room.create).toHaveBeenCalledWith({
        data: {
          propertyId: PROPERTY_ID,
          name: 'Test Room',
          type: 'private',
          beds: 2,
          pricePerNight: 5000,
          maxOccupancy: 2,
          status: 'available',
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}`);
      expect(mockRedirect).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}`);
    });

    it('should return errors for invalid form data', async () => {
      const formData = new FormData(); // Empty form data

      const result = await createRoom(PROPERTY_ID, null, formData);

      expect(result).toHaveProperty('errors');
      expect(result?.errors).toHaveProperty('name');
      expect(result?.errors).toHaveProperty('type');
      expect(mockPrisma.room.create).not.toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should return a message on database error', async () => {
      const formData = new FormData();
      formData.append('name', 'Valid Room');
      formData.append('type', 'dormitory');
      formData.append('beds', '4');
      formData.append('pricePerNight', '25.00');
      formData.append('maxOccupancy', '4');

      mockPrisma.room.create.mockRejectedValueOnce(new Error('DB creation failed'));

      const result = await createRoom(PROPERTY_ID, null, formData);

      expect(result).toEqual({ message: 'Database Error: Failed to Create Room.' });
      expect(mockPrisma.room.create).toHaveBeenCalled(); // Should have been attempted
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });

  // Test deleteRoom
  describe('deleteRoom', () => {
    it('should delete a room and revalidate path on success', async () => {
      const ROOM_ID = 'room-to-delete';
      mockPrisma.room.delete.mockResolvedValueOnce(null); // delete returns the deleted record, or null

      await deleteRoom(PROPERTY_ID, ROOM_ID);

      expect(mockPrisma.room.delete).toHaveBeenCalledWith({ where: { id: ROOM_ID } });
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}`);
      // No redirect for deleteRoom
    });

    it('should handle database error during deletion', async () => {
      const ROOM_ID = 'room-to-delete';
      mockPrisma.room.delete.mockRejectedValueOnce(new Error('DB deletion failed'));
      
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      await deleteRoom(PROPERTY_ID, ROOM_ID);

      expect(mockPrisma.room.delete).toHaveBeenCalledWith({ where: { id: ROOM_ID } });
      expect(mockRevalidatePath).not.toHaveBeenCalled(); // Revalidate should not be called on error
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to delete room:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });
  });
});
