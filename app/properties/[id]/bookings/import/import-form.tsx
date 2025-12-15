'use client';

import { useActionState } from 'react';
import { importBookings } from '@/app/actions/bookings';
import Link from 'next/link';

export default function BookingImportForm({ propertyId }: { propertyId: string }) {
  const initialState = { message: '' };
  const importBookingsWithId = importBookings.bind(null, propertyId);
  const [state, dispatch] = useActionState(importBookingsWithId, initialState);

  const sampleCsvContent = `guestFirstName,guestLastName,email,phone,roomName,checkIn,checkOut,status
John,Doe,john.doe@example.com,,Dorm 1,2025-01-01,2025-01-03,confirmed
Jane,Smith,,123-456-7890,Private A,2025-01-05,2025-01-07,pending`;

  const downloadSampleCsv = () => {
    const blob = new Blob([sampleCsvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) { // feature detection
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'sample_bookings.csv');
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
          <span className="text-gray-600 block mb-2">Select CSV File to Import Bookings</span>
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
        <p>Expected columns: <span className="font-bold">guestFirstName, guestLastName, email, phone, roomName, checkIn (YYYY-MM-DD), checkOut (YYYY-MM-DD), status</span></p>
        <p className="mt-2">`roomName` must match an existing room in this property.</p>
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
        <Link href={`/properties/${propertyId}/bookings`} className="text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
      
      {state.message && (
        <p className="text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}