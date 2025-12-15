// __tests__/actions/import.test.ts
import { importGuests } from '@/app/actions/import';
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
    createMany: jest.fn(),
  },
}));

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockRevalidatePath = require('next/cache').revalidatePath as jest.Mock;
const mockRedirect = require('next/navigation').redirect as jest.Mock;

// Helper to create a mock File object that has a .text() method
const createMockFile = (content: string, filename: string, mimeType: string) => {
    const file = new Blob([content], { type: mimeType }) as any; // Cast to any to add properties
    file.name = filename;
    file.text = jest.fn().mockResolvedValue(content);
    return file;
};

// Mock FormData globally for this test suite
// NOTE: This might interfere with other tests if not carefully scoped.
// A more targeted approach would be to mock it per test case if needed.
const mockFormData = jest.fn(() => ({
    get: jest.fn(),
    append: jest.fn(),
    // Add other FormData methods if your action uses them
}));

// Jest will use this mock instead of the real FormData for this test file
global.FormData = mockFormData as unknown as typeof FormData;


describe('Import Server Actions', () => {
  const PROPERTY_ID = 'test-property-id';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('importGuests', () => {
    it('should return an error if no file is selected', async () => {
      const formDataInstance = new FormData();
      // Ensure formData.get('file') returns null for this test
      (formDataInstance.get as jest.Mock).mockReturnValueOnce(null);

      const result = await importGuests(PROPERTY_ID, null, formDataInstance);

      expect(result).toEqual({ message: 'No file selected.' });
      expect(mockPrisma.guest.createMany).not.toHaveBeenCalled();
    });

    it('should return an error for invalid CSV format (missing headers)', async () => {
      const csvContent = 'email,phone\njane.doe@example.com,12345';
      const file = createMockFile(csvContent, 'guests.csv', 'text/csv');
      const formDataInstance = new FormData();
      // Ensure formData.get('file') returns our mock file for this test
      (formDataInstance.get as jest.Mock).mockReturnValueOnce(file);

      const result = await importGuests(PROPERTY_ID, null, formDataInstance);

      expect(result).toEqual({ message: 'Invalid CSV format. Header must contain firstName and lastName.' });
      expect(mockPrisma.guest.createMany).not.toHaveBeenCalled();
    });

    it('should import guests successfully and redirect', async () => {
      const csvContent = 'firstName,lastName,email,phone\nJohn,Doe,john.doe@example.com,111\nJane,Smith,jane.smith@example.com,222';
      const file = createMockFile(csvContent, 'guests.csv', 'text/csv');
      const formDataInstance = new FormData();
      (formDataInstance.get as jest.Mock).mockReturnValueOnce(file); // Mock file selected

      mockPrisma.guest.createMany.mockResolvedValueOnce({ count: 2 }); // Prisma returns count

      await importGuests(PROPERTY_ID, null, formDataInstance);

      expect(mockPrisma.guest.createMany).toHaveBeenCalledWith({
        data: [
          expect.objectContaining({
            propertyId: PROPERTY_ID,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '111',
          }),
          expect.objectContaining({
            propertyId: PROPERTY_ID,
            firstName: 'Jane',
            lastName: 'Smith',
            email: 'jane.smith@example.com',
            phone: '222',
          }),
        ],
      });
      expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
      expect(mockRedirect).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
    });

    it('should handle database error during import', async () => {
      const csvContent = 'firstName,lastName\nJohn,Doe';
      const file = createMockFile(csvContent, 'guests.csv', 'text/csv');
      const formDataInstance = new FormData();
      (formDataInstance.get as jest.Mock).mockReturnValueOnce(file); // Mock file selected

      mockPrisma.guest.createMany.mockRejectedValueOnce(new Error('DB import failed'));

      const result = await importGuests(PROPERTY_ID, null, formDataInstance);

      expect(result).toEqual({ message: 'Database Error during import.' });
      expect(mockPrisma.guest.createMany).toHaveBeenCalled();
      expect(mockRevalidatePath).not.toHaveBeenCalled();
      expect(mockRedirect).not.toHaveBeenCalled();
    });

    it('should skip invalid rows and create valid ones', async () => {
        const csvContent = 'firstName,lastName,email\nValid,User,valid@example.com\nMissing,,empty@example.com';
        const file = createMockFile(csvContent, 'guests.csv', 'text/csv');
        const formDataInstance = new FormData();
        (formDataInstance.get as jest.Mock).mockReturnValueOnce(file); // Mock file selected

        mockPrisma.guest.createMany.mockResolvedValueOnce({ count: 1 });

        await importGuests(PROPERTY_ID, null, formDataInstance);

        expect(mockPrisma.guest.createMany).toHaveBeenCalledWith({
            data: [
                expect.objectContaining({ firstName: 'Valid', lastName: 'User', email: 'valid@example.com' }),
            ],
        });
        expect(mockRevalidatePath).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
        expect(mockRedirect).toHaveBeenCalledWith(`/properties/${PROPERTY_ID}/guests`);
    });
  });
});