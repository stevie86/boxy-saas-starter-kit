import prisma from '@/lib/db';
import Link from 'next/link';
// Removed import { exportGuests } from '@/app/actions/guests'; // Import exportGuests action

export const dynamic = 'force-dynamic';

export default async function GuestsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const guests = await prisma.guest.findMany({
    where: { propertyId: id },
    orderBy: { lastName: 'asc' },
    include: { _count: { select: { bookings: true } } }
  });

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <Link href={`/properties/${id}`} className="text-sm text-gray-500 hover:underline mb-1 inline-block">
            Properties / {id.substring(0,8)}...
          </Link>
          <h1 className="text-3xl font-bold">Guests</h1>
        </div>
        <div className="flex gap-2">
          <Link 
            href={`/api/export/guests/${id}`}
            className="btn btn-outline"
          >
            Export CSV
          </Link>
          <Link 
            href={`/properties/${id}/guests/import`}
            className="btn btn-outline"
          >
            Import CSV
          </Link>
          <Link 
            href={`/properties/${id}/guests/new`}
            className="btn btn-primary"
          >
            Add Guest
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nationality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bookings</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {guests.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-gray-500">
                  No guests found.
                </td>
              </tr>
            ) : (
              guests.map((guest) => (
                <tr key={guest.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link href={`/properties/${id}/guests/${guest.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                      {guest.lastName}, {guest.firstName}
                    </Link>
                    {guest.documentId && <div className="text-xs text-gray-500">ID: {guest.documentId}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div>{guest.email}</div>
                    <div>{guest.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest.nationality || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {guest._count.bookings}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
