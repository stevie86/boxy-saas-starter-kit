import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { faker } from '@faker-js/faker';

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn().mockImplementation(() => ({
    user: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
    team: {
      create: jest.fn(),
      upsert: jest.fn(),
    },
    teamMember: {
      createMany: jest.fn(),
      upsert: jest.fn(),
    },
    invitation: {
      create: jest.fn(),
    },
    property: {
      upsert: jest.fn(),
    },
    room: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    booking: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
  })),
}));

jest.mock('bcryptjs', () => ({
  hash: jest.fn().mockResolvedValue('hashed_password'),
}));

jest.mock('@faker-js/faker', () => ({
  faker: {
    internet: {
      email: jest.fn().mockReturnValue('test@example.com'),
      password: jest.fn().mockReturnValue('password123'),
    },
    person: {
      firstName: jest.fn().mockReturnValue('John'),
    },
    company: {
      name: jest.fn().mockReturnValue('Test Company'),
    },
  },
}));

describe('Prisma Seed Script', () => {
  let mockConsoleLog;
  let mockConsoleError;
  let mockConsoleWarn;
  let prismaClient;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    prismaClient = new PrismaClient();
    
    // Reset mock implementations
    prismaClient.user.create.mockResolvedValue({ id: 'user1', email: 'test@example.com' });
    prismaClient.team.create.mockResolvedValue({ id: 'team1', name: 'Test Team', slug: 'test-team' });
    prismaClient.teamMember.createMany.mockResolvedValue({ count: 5 });
    prismaClient.invitation.create.mockResolvedValue({ id: 'invitation1' });
    prismaClient.user.findFirst.mockResolvedValue({ id: 'admin1', email: 'admin@example.com' });
    prismaClient.team.upsert.mockResolvedValue({ id: 'demoTeam1', name: 'Lisbon Demo Hostel', slug: 'lisbon-demo-hostel' });
    prismaClient.property.upsert.mockResolvedValue({ id: 'property1', name: 'Lisbon Demo Hostel' });
    prismaClient.room.findFirst.mockResolvedValue(null);
    prismaClient.room.create.mockResolvedValue({ id: 'room1', name: 'Room 1' });
    prismaClient.booking.findFirst.mockResolvedValue(null);
    prismaClient.booking.create.mockResolvedValue({ id: 'booking1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should seed users', async () => {
    // Import and run the seed function
    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Verify user creation was called
    expect(prismaClient.user.create).toHaveBeenCalled();
    expect(hash).toHaveBeenCalled();
  });

  it('should handle duplicate email errors when creating users', async () => {
    // Mock a unique constraint error
    prismaClient.user.create.mockRejectedValueOnce({
      message: 'Unique constraint failed on the fields: (`email`)',
    });

    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(mockConsoleError).toHaveBeenCalledWith('Duplicate email', expect.any(String));
  });

  it('should seed teams', async () => {
    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.team.create).toHaveBeenCalled();
  });

  it('should seed team members', async () => {
    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.teamMember.createMany).toHaveBeenCalled();
  });

  it('should seed invitations', async () => {
    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.invitation.create).toHaveBeenCalled();
  });

  it('should seed demo hostel', async () => {
    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.team.upsert).toHaveBeenCalledWith({
      where: { slug: 'lisbon-demo-hostel' },
      update: { name: 'Lisbon Demo Hostel' },
      create: {
        name: 'Lisbon Demo Hostel',
        slug: 'lisbon-demo-hostel',
      },
    });

    expect(prismaClient.property.upsert).toHaveBeenCalled();
    expect(prismaClient.room.findFirst).toHaveBeenCalled();
    expect(prismaClient.booking.findFirst).toHaveBeenCalled();
  });

  it('should create a room if none exists', async () => {
    prismaClient.room.findFirst.mockResolvedValue(null);

    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.room.create).toHaveBeenCalled();
  });

  it('should create a booking if none exists', async () => {
    prismaClient.booking.findFirst.mockResolvedValue(null);

    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(prismaClient.booking.create).toHaveBeenCalled();
  });

  it('should skip creating booking if one already exists', async () => {
    prismaClient.booking.findFirst.mockResolvedValue({ id: 'existingBooking' });

    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Should not create a new booking
    expect(prismaClient.booking.create).not.toHaveBeenCalled();
  });

  it('should warn and skip demo hostel seed if admin user not found', async () => {
    prismaClient.user.findFirst.mockResolvedValue(null);

    jest.isolateModules(async () => {
      await require('../../prisma/seed');
    });

    // Wait for promises to resolve
    await new Promise(process.nextTick);

    expect(mockConsoleWarn).toHaveBeenCalledWith('Admin user not found, skipping demo hostel seed.');
    expect(prismaClient.team.upsert).not.toHaveBeenCalled();
  });
});
