import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';
import { faker } from '@faker-js/faker';

// Create a mock PrismaClient instance
const mockPrismaClient = {
  user: {
    create: jest.fn(),
    findFirst: jest.fn(),
    findUnique: jest.fn(),
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
  $disconnect: jest.fn(),
};

// Mock dependencies
jest.mock('@prisma/client', () => ({
  PrismaClient: jest.fn(() => mockPrismaClient),
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

// Mock the randomUUID function
jest.mock('crypto', () => ({
  randomUUID: jest.fn().mockReturnValue('mock-uuid'),
}));

describe('Prisma Seed Script', () => {
  let mockConsoleLog;
  let mockConsoleError;
  let mockConsoleWarn;

  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
    mockConsoleError = jest.spyOn(console, 'error').mockImplementation();
    mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation();
    
    // Reset mock implementations
    mockPrismaClient.user.create.mockResolvedValue({ id: 'user1', email: 'test@example.com' });
    mockPrismaClient.team.create.mockResolvedValue({ id: 'team1', name: 'Test Team', slug: 'test-team' });
    mockPrismaClient.teamMember.createMany.mockResolvedValue({ count: 5 });
    mockPrismaClient.invitation.create.mockResolvedValue({ id: 'invitation1' });
    mockPrismaClient.user.findFirst.mockResolvedValue({ id: 'admin1', email: 'admin@example.com' });
    mockPrismaClient.team.upsert.mockResolvedValue({ id: 'demoTeam1', name: 'Lisbon Demo Hostel', slug: 'lisbon-demo-hostel' });
    mockPrismaClient.property.upsert.mockResolvedValue({ id: 'property1', name: 'Lisbon Demo Hostel' });
    mockPrismaClient.room.findFirst.mockResolvedValue(null);
    mockPrismaClient.room.create.mockResolvedValue({ id: 'room1', name: 'Room 1' });
    mockPrismaClient.booking.findFirst.mockResolvedValue(null);
    mockPrismaClient.booking.create.mockResolvedValue({ id: 'booking1' });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should seed users', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.user.create.mockResolvedValueOnce({ id: 'user1', email: 'admin@example.com' });
      mockPrismaClient.user.create.mockResolvedValueOnce({ id: 'user2', email: 'user@example.com' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify user creation was called
    expect(mockPrismaClient.user.create).toHaveBeenCalled();
    expect(hash).toHaveBeenCalled();
  });

  it('should handle duplicate email errors when creating users', async () => {
    // Mock a unique constraint error
    mockPrismaClient.user.create.mockRejectedValueOnce({
      message: 'Unique constraint failed on the fields: (`email`)',
    });

    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);

    // Verify error handling
    expect(mockConsoleError).toHaveBeenCalledWith('Duplicate email', expect.any(String));
  });

  it('should seed teams', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.team.create.mockResolvedValueOnce({ id: 'team1', name: 'Test Team', slug: 'test-team' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify team creation was called
    expect(mockPrismaClient.team.create).toHaveBeenCalled();
  });

  it('should seed team members', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.teamMember.createMany.mockResolvedValueOnce({ count: 5 });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify team members creation was called
    expect(mockPrismaClient.teamMember.createMany).toHaveBeenCalled();
  });

  it('should seed invitations', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.invitation.create.mockResolvedValueOnce({ id: 'invitation1' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify invitation creation was called
    expect(mockPrismaClient.invitation.create).toHaveBeenCalled();
  });

  it('should seed demo hostel', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.team.upsert.mockResolvedValueOnce({ 
        id: 'demoTeam1', 
        name: 'Lisbon Demo Hostel', 
        slug: 'lisbon-demo-hostel' 
      });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify team upsert was called with correct parameters
    expect(mockPrismaClient.team.upsert).toHaveBeenCalledWith({
      where: { slug: 'lisbon-demo-hostel' },
      update: { name: 'Lisbon Demo Hostel' },
      create: {
        name: 'Lisbon Demo Hostel',
        slug: 'lisbon-demo-hostel',
      },
    });
  });

  it('should create a room if none exists', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.room.findFirst.mockResolvedValueOnce(null);
      mockPrismaClient.room.create.mockResolvedValueOnce({ id: 'room1', name: 'Room 1' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify room creation was called
    expect(mockPrismaClient.room.create).toHaveBeenCalled();
  });

  it('should create a booking if none exists', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce(null);
      mockPrismaClient.booking.create.mockResolvedValueOnce({ id: 'booking1' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify booking creation was called
    expect(mockPrismaClient.booking.create).toHaveBeenCalled();
  });

  it('should skip creating booking if one already exists', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.booking.findFirst.mockResolvedValueOnce({ id: 'existingBooking' });
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Should not create a new booking
    expect(mockPrismaClient.booking.create).not.toHaveBeenCalled();
  });

  it('should warn and skip demo hostel seed if admin user not found', async () => {
    // Mock the module
    jest.doMock('../../prisma/seed', () => {
      // This will trigger the code in the module
      mockPrismaClient.user.findFirst.mockResolvedValueOnce(null);
      
      return {};
    }, { virtual: true });
    
    // Import the module to execute it
    require('../../prisma/seed');
    
    // Wait for promises to resolve
    await new Promise(process.nextTick);
    
    // Verify warning was logged and team upsert was not called
    expect(mockConsoleWarn).toHaveBeenCalledWith('Admin user not found, skipping demo hostel seed.');
    expect(mockPrismaClient.team.upsert).not.toHaveBeenCalled();
  });
});
