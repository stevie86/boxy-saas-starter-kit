'use client';

import { useActionState } from 'react';
import { createGuest } from '@/app/actions/guests';
import Link from 'next/link';

export default function GuestForm({ propertyId }: { propertyId: string }) {
  const initialState = { message: '', errors: {} };
  const createGuestWithId = createGuest.bind(null, propertyId);
  const [state, dispatch] = useActionState(createGuestWithId, initialState);

  return (
    <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {state.errors?.firstName && <p className="text-sm text-red-500 mt-1">{state.errors.firstName}</p>}
        </div>
        <div>
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {state.errors?.lastName && <p className="text-sm text-red-500 mt-1">{state.errors.lastName}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.email && <p className="text-sm text-red-500 mt-1">{state.errors.email}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
        <input
          id="phone"
          name="phone"
          type="tel"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">Nationality</label>
          <input
            id="nationality"
            name="nationality"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
        <div>
          <label htmlFor="documentId" className="block text-sm font-medium text-gray-700">Document ID</label>
          <input
            id="documentId"
            name="documentId"
            type="text"
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex gap-4 items-center pt-4">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Guest
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
