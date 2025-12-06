import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function BookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const bookings = await prisma.booking.findMany({
    where: {
      teamId: session.team.id,
    },
    include: {
      guest: true,
      room: true,
    },
  });

  return (
    <div>
      <h1>Bookings</h1>
      <ul>
        {bookings.map((booking) => (
          <li key={booking.id}>
            {booking.guest.firstName} {booking.guest.lastName} - Room: {booking.room.name} - Check-in: {booking.checkInDate.toLocaleDateString()}
          </li>
        ))}
      </ul>
    </div>
  );
}
