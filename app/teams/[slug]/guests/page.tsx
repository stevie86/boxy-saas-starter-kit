import { useState } from 'react';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/panels/PageHeader";
import GuestModal from "@/components/guests/GuestModal";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGuest, setSelectedGuest] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedGuest(null);
  };

  const handleEdit = (guest) => {
    setSelectedGuest(guest);
    openModal();
  };

  return (
    <div>
      <PageHeader title="Guests" description="Manage your guests" />
      <div className="mb-4">
        <button className="btn btn-primary" onClick={openModal}>
          Add Guest
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((guest) => (
              <tr key={guest.id}>
                <td>{guest.firstName}</td>
                <td>{guest.lastName}</td>
                <td>{guest.email}</td>
                <td>{guest.phone}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => handleEdit(guest)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <GuestModal
        isOpen={isModalOpen}
        onClose={closeModal}
        guest={selectedGuest}
        teamId={session.team.id}
      />
    </div>
  );
}
