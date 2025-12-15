import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { deleteRoom } from '@/app/actions/rooms'; // Removed exportRooms action

export const dynamic = 'force-dynamic';

export default async function PropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const property = await prisma.property.findUnique({
    where: { id },
    include: {
      rooms: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!property) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">{property.name}</h1>
          <p className="text-gray-600">{property.city}, {property.country}</p>
        </div>
        <div className="flex gap-2">
          <Link 
            href={`/properties/${id}/dashboard`}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Dashboard
          </Link>
          <Link 
            href={`/properties/${id}/bookings`}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
          >
            Manage Bookings
          </Link>
          <Link 
            href={`/properties/${id}/guests`}
            className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
          >
            Manage Guests
          </Link>
          <Link 
            href={`/properties/${id}/rooms/new`}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Add Room
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4">
           <div>
             <span className="font-medium">Currency:</span> {property.currency}
           </div>
           <div>
             <span className="font-medium">Timezone:</span> {property.timezone}
           </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Rooms</h2>
      <div className="mb-4 text-right flex gap-2 justify-end">
        <Link href={`/api/export/rooms/${id}`} className="btn btn-outline btn-sm">
          Export Rooms CSV
        </Link>
        <Link href={`/properties/${id}/rooms/import`} className="btn btn-primary btn-sm">
          Import Rooms CSV
        </Link>
      </div>
      {property.rooms.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No rooms added yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {property.rooms.map((room) => (
            <div key={room.id} className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold">{room.name}</h3>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  room.status === 'available' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                }`}>
                  {room.status}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-4 space-y-1">
                <p>Type: <span className="capitalize">{room.type}</span></p>
                <p>Beds: {room.beds}</p>
                <p>Max Occupancy: {room.maxOccupancy}</p>
                <p className="font-medium text-black">
                  Price: {(room.pricePerNight / 100).toFixed(2)} {property.currency}
                </p>
              </div>
              <div className="flex justify-end gap-2 mt-2">
                 {/* Delete Form */}
                 <form action={deleteRoom.bind(null, id, room.id)}>
                    <button 
                      type="submit" 
                      className="text-red-600 text-sm hover:underline"
                    >
                      Delete
                    </button>
                 </form>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-8">
        <Link href="/properties" className="text-gray-500 hover:underline">
          &larr; Back to Properties
        </Link>
      </div>
    </div>
  );
}
