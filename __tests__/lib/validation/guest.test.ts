import { createGuestSchema, updateGuestSchema } from '@/lib/validation/guest';

describe('Guest Validation Schemas', () => {
  describe('createGuestSchema', () => {
    it('should validate a valid guest creation input', () => {
      const validInput = {
        teamId: 'team123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        dateOfBirth: '1990-01-01',
        nationality: 'US',
        documentType: 'passport',
        documentId: 'AB123456',
        address: '123 Main St',
        city: 'New York',
        country: 'USA',
        notes: 'VIP guest',
      };

      const result = createGuestSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with missing required fields', () => {
      const invalidInput = {
        teamId: 'team123',
        // firstName is missing
        lastName: 'Doe',
        email: 'john.doe@example.com',
      };

      const result = createGuestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(err => err.path.includes('firstName'))).toBe(true);
      }
    });

    it('should reject input with invalid email', () => {
      const invalidInput = {
        teamId: 'team123',
        firstName: 'John',
        lastName: 'Doe',
        email: 'invalid-email', // invalid email format
      };

      const result = createGuestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.errors.some(err => err.path.includes('email'))).toBe(true);
      }
    });
  });

  describe('updateGuestSchema', () => {
    it('should validate a valid guest update input', () => {
      const validInput = {
        id: 'guest123',
        firstName: 'John',
        lastName: 'Smith',
        email: 'john.smith@example.com',
      };

      const result = updateGuestSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should allow partial updates', () => {
      const validInput = {
        id: 'guest123',
        phone: '+9876543210',
      };

      const result = updateGuestSchema.safeParse(validInput);
      expect(result.success).toBe(true);
    });

    it('should reject input with invalid email', () => {
      const invalidInput = {
        id: 'guest123',
        email: 'invalid-email',
      };

      const result = updateGuestSchema.safeParse(invalidInput);
      expect(result.success).toBe(false);
    });
  });
});
