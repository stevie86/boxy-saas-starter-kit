import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function GuestsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const guests = await prisma.guest.findMany({
    where: {
      teamId: session.team.id,
    },
  });

  return (
    <div>
      <h1>Guests</h1>
      <ul>
        {guests.map((guest) => (
          <li key={guest.id}>
            {guest.firstName} {guest.lastName} - {guest.email}
          </li>
        ))}
      </ul>
    </div>
  );
}
