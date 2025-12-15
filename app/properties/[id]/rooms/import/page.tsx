import RoomImportForm from './import-form';
import Link from 'next/link';

export default async function RoomImportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href={`/properties/${id}`} className="text-sm text-blue-600 hover:underline mb-2 inline-block">
          &larr; Back to Property
        </Link>
        <h1 className="text-2xl font-bold">Import Rooms</h1>
      </div>
      <RoomImportForm propertyId={id} />
    </div>
  );
}
