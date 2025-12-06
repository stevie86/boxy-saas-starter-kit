import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function RoomsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const rooms = await prisma.room.findMany({
    where: {
      teamId: session.team.id,
    },
  });

  return (
    <div>
      <h1>Rooms</h1>
      <ul>
        {rooms.map((room) => (
          <li key={room.id}>
            {room.name} - {room.type} - {room.beds} beds
          </li>
        ))}
      </ul>
    </div>
  );
}
