import { useState } from 'react';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/panels/PageHeader";
import RoomModal from "@/components/rooms/RoomModal";

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

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  };

  const handleEdit = (room) => {
    setSelectedRoom(room);
    openModal();
  };

  return (
    <div>
      <PageHeader title="Rooms" description="Manage your rooms" />
      <div className="mb-4">
        <button className="btn btn-primary" onClick={openModal}>
          Add Room
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Beds</th>
              <th>Price</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id}>
                <td>{room.name}</td>
                <td>{room.type}</td>
                <td>{room.beds}</td>
                <td>{room.pricePerNight}</td>
                <td>
                  <button className="btn btn-sm" onClick={() => handleEdit(room)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <RoomModal
        isOpen={isModalOpen}
        onClose={closeModal}
        room={selectedRoom}
        teamId={session.team.id}
      />
    </div>
  );
}
