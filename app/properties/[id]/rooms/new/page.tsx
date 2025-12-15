import RoomForm from './room-form';

export default async function NewRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Add New Room</h1>
      <RoomForm propertyId={id} />
    </div>
  );
}
