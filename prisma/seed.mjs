// prisma/seed.mjs
import 'dotenv/config'; // Load .env files at the very top
import { faker } from '@faker-js/faker';
import { PrismaClient } from '@prisma/client';
// import bcrypt from 'bcryptjs'; // Removed due to persistent module resolution issues
import { randomUUID } from 'node:crypto';

const client = new PrismaClient();

const USER_COUNT = 1;
const TEAM_COUNT = 1;

const ADMIN_EMAIL = 'admin@hostelpulse.com';
const ADMIN_PASSWORD = 'password'; // Plaintext password for seeding

async function seedUsers() {
  const newUsers = [];
  try {
    // const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 12); // Hashing removed
    const adminUser = await client.user.create({
      data: {
        email: ADMIN_EMAIL,
        name: 'Admin User',
        password: ADMIN_PASSWORD, // Set plaintext password directly
        emailVerified: new Date(),
      },
    });
    newUsers.push(adminUser);
    console.log(`Seeded admin user: ${ADMIN_EMAIL}`);
  } catch (ex) {
    if (ex.code === 'P2002' && ex.meta?.target?.includes('email')) {
      console.log(`Admin user ${ADMIN_EMAIL} already exists. Skipping.`);
      const existingAdmin = await client.user.findUnique({ where: { email: ADMIN_EMAIL } });
      if (existingAdmin) newUsers.push(existingAdmin);
    } else {
      console.error('Error seeding admin user:', ex);
    }
  }
  return newUsers;
}

async function seedTeams(users) {
  const newTeams = [];
  const teamName = 'HostelPulse Global';
  try {
    const team = await client.team.create({
      data: {
        name: teamName,
        slug: 'hostelpulse-global',
        defaultRole: 'OWNER', // As String for SQLite
      },
    });
    newTeams.push(team);
    console.log(`Seeded team: ${teamName}`);

    // Link admin user to this team
    if (users.length > 0) {
      await client.teamMember.create({
        data: {
          teamId: team.id,
          userId: users[0].id,
          role: 'OWNER', // As String for SQLite
        },
      });
      console.log(`Linked admin user to ${teamName}`);
    }

  } catch (ex) {
    if (ex.code === 'P2002' && ex.meta?.target?.includes('slug')) {
      console.log(`Team ${teamName} already exists. Skipping.`);
      const existingTeam = await client.team.findUnique({ where: { slug: 'hostelpulse-global' } });
      if (existingTeam) newTeams.push(existingTeam);
    } else {
      console.error('Error seeding team:', ex);
    }
  }
  return newTeams;
}

async function seedProperties(teams) {
  const newProperties = [];
  if (teams.length === 0) {
    console.log('No teams available to link properties.');
    return newProperties;
  }
  const teamId = teams[0].id; // Link to the first team
  const propertyName = 'HostelPulse Lisbon';

  try {
    const property = await client.property.create({
      data: {
        teamId: teamId,
        name: propertyName,
        city: 'Lisbon',
        country: 'Portugal',
        address: 'Rua do Teste, 123',
        currency: 'EUR',
        timezone: 'Europe/Lisbon',
        checkInTime: '15:00',
        checkOutTime: '11:00',
      },
    });
    newProperties.push(property);
    console.log(`Seeded property: ${propertyName}`);
  } catch (ex) {
    if (ex.code === 'P2002' && ex.meta?.target?.includes('teamId')) {
      console.log(`Property ${propertyName} already exists for this team. Skipping.`);
      const existingProperty = await client.property.findFirst({ where: { name: propertyName, teamId: teamId } });
      if (existingProperty) newProperties.push(existingProperty);
    } else {
      console.error('Error seeding property:', ex);
    }
  }
  return newProperties;
}

async function seedRooms(properties) {
  const newRooms = [];
  if (properties.length === 0) {
    console.log('No properties available to link rooms.');
    return newRooms;
  }
  const propertyId = properties[0].id;

  const roomData = [
    { name: 'Dorm 1', type: 'dormitory', beds: 8, pricePerNight: 2500, maxOccupancy: 8, status: 'available' },
    { name: 'Private A', type: 'private', beds: 2, pricePerNight: 6000, maxOccupancy: 2, status: 'available' },
    { name: 'Suite Deluxe', type: 'suite', beds: 2, pricePerNight: 10000, maxOccupancy: 2, status: 'available' },
  ];

  for (const data of roomData) {
    try {
      const room = await client.room.create({
        data: {
          propertyId,
          ...data,
        },
      });
      newRooms.push(room);
      console.log(`Seeded room: ${data.name}`);
    } catch (ex) {
      if (ex.code === 'P2002' && ex.meta?.target?.includes('name')) {
        console.log(`Room ${data.name} already exists. Skipping.`);
        const existingRoom = await client.room.findFirst({ where: { name: data.name, propertyId } });
        if (existingRoom) newRooms.push(existingRoom);
      } else {
        console.error('Error seeding room:', ex);
      }
    }
  }
  return newRooms;
}

async function seedGuests(properties) {
  const newGuests = [];
  if (properties.length === 0) {
    console.log('No properties available to link guests.');
    return newGuests;
  }
  const propertyId = properties[0].id;

  for (let i = 0; i < 5; i++) {
    try {
      const guest = await client.guest.create({
        data: {
          propertyId,
          firstName: faker.person.firstName(),
          lastName: faker.person.lastName(),
          email: faker.internet.email(),
          phone: faker.phone.number(),
          nationality: faker.location.country(),
        },
      });
      newGuests.push(guest);
    } catch (ex) {
      console.error('Error seeding guest:', ex);
    }
  }
  console.log(`Seeded ${newGuests.length} guests.`);
  return newGuests;
}

async function seedBookings(properties, rooms, guests) {
  const newBookings = [];
  if (properties.length === 0 || rooms.length === 0 || guests.length === 0) {
    console.log('Missing data for booking. Skipping bookings seed.');
    return newBookings;
  }
  const propertyId = properties[0].id;

  const allRooms = rooms.length > 0 ? rooms : await client.room.findMany({ where: { propertyId } });
  const allGuests = guests.length > 0 ? guests : await client.guest.findMany({ where: { propertyId } });

  if (allRooms.length === 0 || allGuests.length === 0) {
    console.log('Not enough rooms or guests to create bookings. Skipping.');
    return newBookings;
  }

  for (let i = 0; i < 5; i++) {
    const randomRoom = allRooms[Math.floor(Math.random() * allRooms.length)];
    const randomGuest = allGuests[Math.floor(Math.random() * allGuests.length)];
    const checkIn = faker.date.soon({ days: 10, refDate: new Date() });
    const checkOut = faker.date.soon({ days: 5, refDate: checkIn });

    try {
      const booking = await client.booking.create({
        data: {
          propertyId,
          guestId: randomGuest.id,
          checkIn,
          checkOut,
          status: 'confirmed',
          totalAmount: randomRoom.pricePerNight * Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
          amountPaid: randomRoom.pricePerNight * Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24)),
          paymentStatus: 'paid',
          confirmationCode: faker.string.alphanumeric(10).toUpperCase(),
        },
      });

      await client.bookingBed.create({
        data: {
          bookingId: booking.id,
          roomId: randomRoom.id,
          bedLabel: 'Bed 1',
          pricePerNight: randomRoom.pricePerNight,
        },
      });
      newBookings.push(booking);
    } catch (ex) {
      console.error('Error seeding booking:', ex);
    }
  }
  console.log(`Seeded ${newBookings.length} bookings.`);
  return newBookings;
}

async function main() {
  console.log('Start seeding...');
  const users = await seedUsers();
  const teams = await seedTeams(users);
  const properties = await seedProperties(teams);
  const rooms = await seedRooms(properties);
  const guests = await seedGuests(properties);
  await seedBookings(properties, rooms, guests);
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await client.$disconnect();
  });