import prisma from '@/lib/db';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Calculate "Today" (UTC for simplicity)
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  // Parallel data fetching
  const [property, rooms, checkIns, checkOuts, occupiedBookings] = await Promise.all([
    prisma.property.findUnique({ where: { id } }),
    prisma.room.findMany({ where: { propertyId: id } }),
    
    // Check-ins Today
    prisma.booking.findMany({
      where: {
        propertyId: id,
        checkIn: { gte: todayStart, lt: todayEnd },
        status: { not: 'cancelled' },
      },
      include: { guest: true },
    }),

    // Check-outs Today
    prisma.booking.findMany({
      where: {
        propertyId: id,
        checkOut: { gte: todayStart, lt: todayEnd },
        status: { not: 'cancelled' },
      },
      include: { guest: true },
    }),

    // Occupied (Overlapping Today)
    prisma.booking.findMany({
      where: {
        propertyId: id,
        checkIn: { lt: todayEnd },
        checkOut: { gt: todayStart },
        status: { not: 'cancelled' },
      },
      include: { beds: true },
    }),
  ]);

  if (!property) return <div>Property not found</div>;

  // Stats Calculation
  const totalBeds = rooms.reduce((sum, room) => sum + room.beds, 0);
  const occupiedBedsCount = occupiedBookings.reduce((sum, booking) => sum + booking.beds.length, 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBedsCount / totalBeds) * 100) : 0;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
           <Link href={`/properties/${id}`} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
            Properties / {property.name}
          </Link>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-gray-600">Overview for {now.toLocaleDateString()}</p>
        </div>
        <Link href={`/properties/${id}/bookings/new`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          New Booking
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="stats shadow w-full mb-8 bg-white">
        <div className="stat">
          <div className="stat-figure text-blue-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <div className="stat-title">Arrivals</div>
          <div className="stat-value text-blue-600">{checkIns.length}</div>
          <div className="stat-desc">Guests checking in today</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-orange-600">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
          </div>
          <div className="stat-title">Departures</div>
          <div className="stat-value text-orange-600">{checkOuts.length}</div>
          <div className="stat-desc">Guests checking out today</div>
        </div>

        <div className="stat">
          <div className="stat-figure text-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"></path></svg>
          </div>
          <div className="stat-title">Occupancy</div>
          <div className="stat-value">{occupancyRate}%</div>
          <div className="stat-desc">{occupiedBedsCount} / {totalBeds} beds occupied</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Arrivals List */}
        <div className="card bg-white shadow-xl">
          <div className="card-body p-0">
            <div className="px-6 py-4 border-b border-base-200">
              <h3 className="card-title text-base">Today&apos;s Arrivals</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <tbody>
                  {checkIns.length === 0 ? (
                    <tr><td className="text-center text-gray-500 py-4">No arrivals scheduled.</td></tr>
                  ) : (
                    checkIns.map(booking => (
                      <tr key={booking.id}>
                        <td>
                          <div className="font-bold">{booking.guest?.firstName} {booking.guest?.lastName}</div>
                          <div className="text-xs opacity-50">Code: {booking.confirmationCode || 'N/A'}</div>
                        </td>
                        <td className="text-right">
                          <div className="badge badge-primary badge-outline badge-sm">Confirmed</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Departures List */}
        <div className="card bg-white shadow-xl">
          <div className="card-body p-0">
            <div className="px-6 py-4 border-b border-base-200">
              <h3 className="card-title text-base">Today&apos;s Departures</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="table w-full">
                <tbody>
                  {checkOuts.length === 0 ? (
                    <tr><td className="text-center text-gray-500 py-4">No departures scheduled.</td></tr>
                  ) : (
                    checkOuts.map(booking => (
                      <tr key={booking.id}>
                        <td>
                          <div className="font-bold">{booking.guest?.firstName} {booking.guest?.lastName}</div>
                          <div className="text-xs opacity-50">Paid: {(booking.amountPaid / 100).toFixed(2)}</div>
                        </td>
                        <td className="text-right">
                          <div className="badge badge-warning badge-outline badge-sm">Checking Out</div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
