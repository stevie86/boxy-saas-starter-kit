import prisma from '@/lib/db';
import BookingForm from './booking-form';
import Link from 'next/link';

export default async function NewBookingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Fetch rooms for the dropdown
  const rooms = await prisma.room.findMany({
    where: { propertyId: id },
    select: { id: true, name: true, type: true, pricePerNight: true },
  });

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href={`/properties/${id}/bookings`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Bookings
        </Link>
        <h1 className="text-2xl font-bold">New Booking</h1>
      </div>
      
      {rooms.length === 0 ? (
        <div className="text-center p-8 bg-yellow-50 rounded border border-yellow-200">
           <p className="text-yellow-800 mb-4">You need to create rooms before you can add bookings.</p>
           <Link href={`/properties/${id}/rooms/new`} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
             Create First Room
           </Link>
        </div>
      ) : (
        <BookingForm propertyId={id} rooms={rooms} />
      )}
    </div>
  );
}
