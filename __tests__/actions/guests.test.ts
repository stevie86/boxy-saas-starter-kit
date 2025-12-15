// __tests__/actions/guests.test.ts
import { createGuest } from '@/app/actions/guests';
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
  guest: {
    create: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRevalidatePath = require('next/cache').revalidatePath as jest.Mock;
const mockRedirect = require('next/navigation').redirect as jest.Mock;

describe('Guests Server Actions', () => {
  const PROPERTY_ID = 'test-property-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createGuest', () => {
    it('should create a guest and redirect on success', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Jane');
      formData.append('lastName', 'Doe');
      formData.append('email', 'jane.doe@example.com');
      formData.append('phone', '123-456-7890');
      formData.append('nationality', 'US');
      formData.append('documentId', 'ABC12345');

      mockPrisma.guest.create.mockResolvedValueOnce({
        id: 'new-guest-id',
        propertyId: PROPERTY_ID,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phone: '123-456-7890',
        nationality: 'US',
        documentId: 'ABC12345',
        dateOfBirth: null,
        address: null,
        city: null,
        country: null,
        notes: null,
        blacklisted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await createGuest(PROPERTY_ID, null, formData);

      expect(mockPrisma.guest.create).toHaveBeenCalledWith({
        data: {
          propertyId: PROPERTY_ID,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          phone: '123-456-7890',
          nationality: 'US',
          documentId: 'ABC12345',
        },
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
      expect(mockRedirect).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
    });

    it('should create a guest with optional fields as null', async () => {
      const formData = new FormData();
      formData.append('firstName', 'John');
      formData.append('lastName', 'Smith');
      formData.append('email', ''); // Explicitly append empty string
      formData.append('phone', '');
      formData.append('nationality', '');
      formData.append('documentId', '');

      mockPrisma.guest.create.mockResolvedValueOnce({
        id: 'new-guest-id-2',
        propertyId: PROPERTY_ID,
        firstName: 'John',
        lastName: 'Smith',
        email: null, phone: null, nationality: null, documentId: null,
        dateOfBirth: null, address: null, city: null, country: null, notes: null, blacklisted: false,
        createdAt: new Date(), updatedAt: new Date(),
      });

      await createGuest(PROPERTY_ID, null, formData);

      expect(mockPrisma.guest.create).toHaveBeenCalledWith({
        data: {
          propertyId: PROPERTY_ID,
          firstName: 'John',
          lastName: 'Smith',
          email: null,
          phone: null,
          nationality: null,
          documentId: null,
        },
      });
    });

    it('should return errors for invalid form data', async () => {
      const formData = new FormData(); // Empty form data

      const result = await createGuest(PROPERTY_ID, null, formData);

      expect(result).toHaveProperty('errors');
      expect(result?.errors).toHaveProperty('firstName');
      expect(result?.errors).toHaveProperty('lastName');
      expect(mockPrisma.guest.create).not.toHaveBeenCalled();
    });

    it('should return a message on database error', async () => {
      const formData = new FormData();
      formData.append('firstName', 'Valid');
      formData.append('lastName', 'User');
      formData.append('email', ''); // Explicitly append empty string
      formData.append('phone', '');
      formData.append('nationality', '');
      formData.append('documentId', '');

      mockPrisma.guest.create.mockRejectedValueOnce(new Error('DB creation failed'));

      const result = await createGuest(PROPERTY_ID, null, formData);

      expect(result).toEqual({ message: 'Database Error: Failed to create guest.' });
      expect(mockPrisma.guest.create).toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });
  });
});
