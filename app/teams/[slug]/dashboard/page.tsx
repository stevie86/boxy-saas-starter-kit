import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/panels/PageHeader";
import StatsCard from "@/components/ui/panels/StatsCard";

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const teamId = session.team.id;

  // Fetch today's check-ins
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const checkInsToday = await prisma.booking.count({
    where: {
      teamId: teamId,
      checkIn: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        not: 'cancelled',
      },
    },
  });

  // Fetch today's check-outs
  const checkOutsToday = await prisma.booking.count({
    where: {
      teamId: teamId,
      checkOut: {
        gte: today,
        lt: tomorrow,
      },
      status: {
        not: 'cancelled',
      },
    },
  });

  // Fetch total number of rooms
  const totalRooms = await prisma.room.count({
    where: {
      teamId: teamId,
    },
  });

  // Fetch number of occupied rooms
  const occupiedRooms = await prisma.booking.count({
    where: {
      teamId: teamId,
      checkIn: {
        lte: new Date(),
      },
      checkOut: {
        gte: new Date(),
      },
      status: {
        not: 'cancelled',
      },
    },
  });

  // Calculate occupancy percentage
  const occupancyPercentage = totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="Check-ins Today" value={checkInsToday} />
        <StatsCard title="Check-outs Today" value={checkOutsToday} />
        <StatsCard title="Occupancy" value={`${occupancyPercentage}%`} />
      </div>
    </div>
  );
}
