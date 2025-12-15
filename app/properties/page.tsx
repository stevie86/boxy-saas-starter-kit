// app/properties/page.tsx
import prisma from '@/lib/db';
import Link from 'next/link';
import { Property } from '@prisma/client';

export const dynamic = 'force-dynamic'; // Ensures this page is always rendered dynamically

export default async function PropertiesPage() {
  let properties: Property[] = [];
  let error = null;

  try {
    properties = await prisma.property.findMany();
  } catch (e) {
    console.error("Failed to fetch properties:", e);
    error = "Unable to load properties. Please check your database connection.";
  }

  if (error) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold mb-4">Properties</h1>
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Properties</h1>
      {properties.length === 0 ? (
        <p>No properties found. Add some to get started!</p>
      ) : (
        <ul>
          {properties.map((property) => (
            <li key={property.id} className="mb-2 p-3 border rounded-lg shadow-sm">
              <Link href={`/properties/${property.id}`} className="text-blue-600 hover:underline">
                <h2 className="text-xl font-semibold">{property.name}</h2>
              </Link>
              <p>{property.city}, {property.country}</p>
              <p>Check-in: {property.checkInTime} / Check-out: {property.checkOutTime}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
