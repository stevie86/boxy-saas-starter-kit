import GuestForm from './guest-form';
import Link from 'next/link';

export default async function NewGuestPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href={`/properties/${id}/guests`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Guests
        </Link>
        <h1 className="text-2xl font-bold">New Guest</h1>
      </div>
      <GuestForm propertyId={id} />
    </div>
  );
}
