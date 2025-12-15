// lib/db.ts
import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
  const url = process.env.DATABASE_URL;
  console.log('----------------------------------------');
  console.log('Initializing Prisma Client');
  console.log(`DATABASE_URL: ${url}`);
  console.log('----------------------------------------');
  return new PrismaClient();
};

declare global {
  var prisma: undefined | ReturnType<typeof prismaClientSingleton>;
}

const prisma = globalThis.prisma ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}
