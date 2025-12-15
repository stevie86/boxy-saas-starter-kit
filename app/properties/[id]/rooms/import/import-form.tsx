'use client';

import { useActionState } from 'react';
import { importRooms } from '@/app/actions/rooms';
import Link from 'next/link';

export default function RoomImportForm({ propertyId }: { propertyId: string }) {
  const initialState = { message: '' };
  const importRoomsWithId = importRooms.bind(null, propertyId);
  const [state, dispatch] = useActionState(importRoomsWithId, initialState);

  const sampleCsvContent = `name,type,beds,pricePerNight,maxOccupancy,status
Dorm A,dormitory,6,25.50,6,available
Private 1,private,2,75.00,2,available
Suite Deluxe,suite,2,150.00,2,closed`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'sample_rooms.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <label htmlFor="file" className="cursor-pointer block">
          <span className="text-gray-600 block mb-2">Select CSV File to Import Rooms</span>
          <input
            id="file"
            name="file"
            type="file"
            accept=".csv"
            required
            className="block w-full text-sm text-gray-500
              file:mr-4 file:py-2 file:px-4
              file:rounded-full file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
          />
        </label>
      </div>

      <div className="text-sm text-gray-500">
        <p>Expected columns: <span className="font-bold">name, type (dormitory/private/suite), beds, pricePerNight, maxOccupancy, status (available/maintenance/closed)</span></p>
        <p className="mt-2">PricePerNight should be a decimal (e.g., 25.50).</p>
        <button type="button" onClick={downloadSampleCsv} className="btn btn-ghost btn-sm mt-2">
          Download Sample CSV
        </button>
      </div>

      <div className="flex gap-4 items-center pt-4">
        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Upload & Import
        </button>
        <Link href={`/properties/${propertyId}`} className="text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
      
      {state.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
