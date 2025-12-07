import { getGuests, getGuestById, searchGuests, getBlacklistedGuests } from '@/lib/fetch/guests';
import { prisma } from '@/lib/prisma';

// Mock the prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    guest: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
    },
  },
}));

describe('Guest Fetch Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getGuests', () => {
    it('should return guests for a team', async () => {
      const mockGuests = [
        { id: 'guest1', firstName: 'John', lastName: 'Doe' },
        { id: 'guest2', firstName: 'Jane', lastName: 'Smith' },
      ];

      (prisma.guest.findMany as jest.Mock).mockResolvedValue(mockGuests);

      const result = await getGuests('team123');

      expect(prisma.guest.findMany).toHaveBeenCalledWith({
        where: { teamId: 'team123' },
        orderBy: { lastName: 'asc' },
      });
      expect(result).toEqual(mockGuests);
    });

    it('should return empty array on error', async () => {
      (prisma.guest.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getGuests('team123');

      expect(result).toEqual([]);
    });
  });

  describe('getGuestById', () => {
    it('should return a guest by ID', async () => {
      const mockGuest = { 
        id: 'guest1', 
        firstName: 'John', 
        lastName: 'Doe',
        bookings: []
      };

      (prisma.guest.findFirst as jest.Mock).mockResolvedValue(mockGuest);

      const result = await getGuestById('guest1', 'team123');

      expect(prisma.guest.findFirst).toHaveBeenCalledWith({
        where: { id: 'guest1', teamId: 'team123' },
        include: {
          bookings: {
            include: {
              rooms: true,
            },
            orderBy: {
              checkIn: 'desc',
            },
          },
        },
      });
      expect(result).toEqual(mockGuest);
    });

    it('should return null if guest not found', async () => {
      (prisma.guest.findFirst as jest.Mock).mockResolvedValue(null);

      const result = await getGuestById('nonexistent', 'team123');

      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      (prisma.guest.findFirst as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getGuestById('guest1', 'team123');

      expect(result).toBeNull();
    });
  });

  describe('searchGuests', () => {
    it('should search guests by query', async () => {
      const mockGuests = [
        { id: 'guest1', firstName: 'John', lastName: 'Doe' },
      ];

      (prisma.guest.findMany as jest.Mock).mockResolvedValue(mockGuests);

      const result = await searchGuests('team123', 'John');

      expect(prisma.guest.findMany).toHaveBeenCalled();
      expect(result).toEqual(mockGuests);
    });

    it('should return empty array on error', async () => {
      (prisma.guest.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await searchGuests('team123', 'John');

      expect(result).toEqual([]);
    });
  });

  describe('getBlacklistedGuests', () => {
    it('should return blacklisted guests', async () => {
      const mockGuests = [
        { id: 'guest1', firstName: 'John', lastName: 'Doe', blacklisted: true },
      ];

      (prisma.guest.findMany as jest.Mock).mockResolvedValue(mockGuests);

      const result = await getBlacklistedGuests('team123');

      expect(prisma.guest.findMany).toHaveBeenCalledWith({
        where: { teamId: 'team123', blacklisted: true },
      });
      expect(result).toEqual(mockGuests);
    });

    it('should return empty array on error', async () => {
      (prisma.guest.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      const result = await getBlacklistedGuests('team123');

      expect(result).toEqual([]);
    });
  });
});
