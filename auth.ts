import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import Credentials from 'next-auth/providers/credentials';
import { z } from 'zod';
import prisma from '@/lib/db';
import bcrypt from 'bcryptjs';

export const { auth, signIn, signOut, handlers } = (NextAuth as any)({
  ...authConfig,
  session: { strategy: 'jwt' },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);

                    if (parsedCredentials.success) {
                        const { email, password } = parsedCredentials.data;
                        
                        console.log(`[AUTH DEBUG] Attempting login for: ${email}`);
                        const user = await prisma.user.findUnique({
                          where: { email },
                        });
        
                        if (!user) {
                            console.log(`[AUTH DEBUG] User not found for email: ${email}`);
                            return null;
                        }
        
                        console.log(`[AUTH DEBUG] User found: ${user.email}, ID: ${user.id}`);
                        console.log(`[AUTH DEBUG] Stored DB password: ${user.password ? (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$') ? '[HASHED]' : '[PLAINTEXT]') : '[NULL]'}`);
                        console.log(`[AUTH DEBUG] Input password length: ${password.length}`);
        
        
                        // If stored password is a hash, use bcrypt.compare
                        if (user.password && (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$'))) {
                           console.log('[AUTH DEBUG] Attempting bcrypt compare...');
                           const passwordsMatch = await bcrypt.compare(password, user.password);
                           console.log(`[AUTH DEBUG] Bcrypt comparison match: ${passwordsMatch}`);
                           if (passwordsMatch) {
                             return { id: user.id, name: user.name, email: user.email };
                           }
                        } else if (user.password === password) { // Fallback for plaintext seeded password
                          console.log('[AUTH DEBUG] Plaintext comparison match: true');
                          return { id: user.id, name: user.name, email: user.email };
                        }
                    }
                    console.log('[AUTH DEBUG] Authentication failed after all checks.');
                    return null;
                  },    }),
  ],
});