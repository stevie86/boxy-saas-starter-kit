import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { getTodayCheckIns, getTodayCheckOuts, getCurrentOccupancy } from "@/lib/fetch/bookings";
import PageHeader from "@/components/ui/panels/PageHeader";
import StatsCard from "@/components/ui/panels/StatsCard";
import Link from "next/link";

export default async function DashboardPage({ params }: { params: { slug: string } }) {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const teamId = session.team.id;
  const { slug } = params;

  // Fetch today's check-ins
  const checkInsToday = await getTodayCheckIns(teamId);
  
  // Fetch today's check-outs
  const checkOutsToday = await getTodayCheckOuts(teamId);
  
  // Fetch occupancy data
  const occupancyData = await getCurrentOccupancy(teamId);

  return (
    <div className="container mx-auto px-4 py-8">
      <PageHeader title="Dashboard" description="Welcome to your property dashboard" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatsCard title="Occupancy" value={`${occupancyData.occupancyPercentage}%`} description={`${occupancyData.occupiedRooms} of ${occupancyData.totalRooms} rooms`} />
        <StatsCard title="Check-ins Today" value={checkInsToday.length} />
        <StatsCard title="Check-outs Today" value={checkOutsToday.length} />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Today's Check-ins</h2>
          {checkInsToday.length > 0 ? (
            <ul className="divide-y">
              {checkInsToday.map((booking) => (
                <li key={booking.id} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                      <p className="text-sm text-gray-500">
                        Rooms: {booking.rooms.map(room => room.name).join(', ')}
                      </p>
                    </div>
                    <Link 
                      href={`/teams/${slug}/bookings?id=${booking.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No check-ins scheduled for today</p>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Today's Check-outs</h2>
          {checkOutsToday.length > 0 ? (
            <ul className="divide-y">
              {checkOutsToday.map((booking) => (
                <li key={booking.id} className="py-3">
                  <div className="flex justify-between">
                    <div>
                      <p className="font-medium">{booking.guest.firstName} {booking.guest.lastName}</p>
                      <p className="text-sm text-gray-500">
                        Rooms: {booking.rooms.map(room => room.name).join(', ')}
                      </p>
                    </div>
                    <Link 
                      href={`/teams/${slug}/bookings?id=${booking.id}`}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      View
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No check-outs scheduled for today</p>
          )}
        </div>
      </div>
      
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link 
          href={`/teams/${slug}/rooms`}
          className="bg-blue-600 text-white p-4 rounded-lg text-center hover:bg-blue-700"
        >
          Manage Rooms
        </Link>
        <Link 
          href={`/teams/${slug}/bookings`}
          className="bg-green-600 text-white p-4 rounded-lg text-center hover:bg-green-700"
        >
          Manage Bookings
        </Link>
        <Link 
          href={`/teams/${slug}/guests`}
          className="bg-purple-600 text-white p-4 rounded-lg text-center hover:bg-purple-700"
        >
          Manage Guests
        </Link>
      </div>
    </div>
  );
}
