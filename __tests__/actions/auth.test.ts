// __tests__/actions/auth.test.ts
import { authenticate } from '@/app/actions/auth';
import prisma from '@/lib/db';
import { AuthError } from 'next-auth'; // Need to import it if exists

// Mock NextAuth's signIn function
jest.mock('@/auth', () => ({
  signIn: jest.fn(),
}));

// Mock Prisma Client
jest.mock('@/lib/db', () => ({
  user: {
    findUnique: jest.fn(),
  },
}));

const mockSignIn = require('@/auth').signIn as jest.Mock;
const mockPrisma = prisma as jest.Mocked<typeof prisma>;

describe('Auth Server Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticate', () => {
    it('should call signIn with credentials on success', async () => {
      const formData = new FormData();
      formData.append('email', 'admin@hostelpulse.com');
      formData.append('password', 'password');

      mockPrisma.user.findUnique.mockResolvedValueOnce({
        id: 'admin-id',
        email: 'admin@hostelpulse.com',
        name: 'Admin User',
        password: 'password', // Plaintext for testing seeded user
      });

      // Mock signIn to succeed (not throw)
      mockSignIn.mockResolvedValueOnce(undefined);

      await authenticate(undefined, formData);

      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
      // Further checks would be if signIn returns a session, but authenticate handles the errors
    });

    it('should return "Invalid credentials." for CredentialsSignin error', async () => {
      const formData = new FormData();
      formData.append('email', 'wrong@example.com');
      formData.append('password', 'wrong');

      // Mock signIn to throw AuthError with CredentialsSignin type
      mockSignIn.mockRejectedValueOnce(new AuthError('CredentialsSignin', { cause: 'Invalid' }));

      const result = await authenticate(undefined, formData);

      expect(result).toBe('Invalid credentials.');
      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
    });

    it('should throw other AuthErrors', async () => {
      const formData = new FormData();
      formData.append('email', 'other@example.com');
      formData.append('password', 'other');

      // Mock signIn to throw another AuthError type
      mockSignIn.mockRejectedValueOnce(new AuthError('CallbackError', { cause: 'Other' }));

      await expect(authenticate(undefined, formData)).rejects.toThrow(AuthError);
      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
    });

    it('should throw non-AuthErrors', async () => {
      const formData = new FormData();
      formData.append('email', 'generic@example.com');
      formData.append('password', 'generic');

      // Mock signIn to throw a generic error
      mockSignIn.mockRejectedValueOnce(new Error('Generic error'));

      await expect(authenticate(undefined, formData)).rejects.toThrow('Generic error');
      expect(mockSignIn).toHaveBeenCalledWith('credentials', formData);
    });
  });
});
