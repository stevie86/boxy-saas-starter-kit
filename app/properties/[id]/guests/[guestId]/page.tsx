import prisma from '@/lib/db';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function GuestDetailPage({ params }: { params: Promise<{ id: string; guestId: string }> }) {
  const { id: propertyId, guestId } = await params;

  const guest = await prisma.guest.findUnique({
    where: { id: guestId, propertyId: propertyId },
    include: {
      bookings: {
        orderBy: { checkIn: 'desc' },
        include: {
          beds: {
            include: { room: true }
          }
        }
      }
    }
  });

  if (!guest) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href={`/properties/${propertyId}/guests`} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
            &larr; Back to Guest List
          </Link>
          <h1 className="text-3xl font-bold">{guest.firstName} {guest.lastName}</h1>
          <p className="text-gray-600">Guest Details</p>
        </div>
        <div className="flex gap-2">
          {/* Placeholder for Edit Guest */}
          <Link href={`/properties/${propertyId}/guests/${guest.id}/edit`} className="btn btn-sm btn-outline">
            Edit
          </Link>
          {/* Placeholder for Delete Guest */}
          <button className="btn btn-sm btn-error btn-outline">Delete</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium">Email:</span> {guest.email || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Phone:</span> {guest.phone || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Nationality:</span> {guest.nationality || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Document ID:</span> {guest.documentId || 'N/A'}
          </div>
          <div>
            <span className="font-medium">Blacklisted:</span> {guest.blacklisted ? 'Yes' : 'No'}
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-4">Booking History</h2>
      {guest.bookings.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-2">No bookings for this guest.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="table w-full">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Room</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Status</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {guest.bookings.map(booking => (
                <tr key={booking.id}>
                  <td>{booking.id.substring(0, 8)}...</td>
                  <td>{booking.beds.map(b => b.room.name).join(', ')}</td>
                  <td>{new Date(booking.checkIn).toLocaleDateString()}</td>
                  <td>{new Date(booking.checkOut).toLocaleDateString()}</td>
                  <td><span className="badge">{booking.status}</span></td>
                  <td>{(booking.totalAmount / 100).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
