'use client';

import { useActionState } from 'react';
import { importGuests } from '@/app/actions/import';
import Link from 'next/link';

export default function ImportForm({ propertyId }: { propertyId: string }) {
  const initialState = { message: '' };
  const importGuestsWithId = importGuests.bind(null, propertyId);
  const [state, dispatch] = useActionState(importGuestsWithId, initialState);

  return (
    <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <label htmlFor="file" className="cursor-pointer block">
          <span className="text-gray-600 block mb-2">Select CSV File</span>
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
        <p>Expected columns: firstName, lastName, email, phone</p>
      </div>

      <div className="flex gap-4 items-center pt-4">
        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
        >
          Upload & Import
        </button>
        <Link href={`/properties/${propertyId}/guests`} className="text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>
      
      {state.message && (
         <p className="text-red-500 text-sm">{state.message}</p>
      )}
    </form>
  );
}
