'use client';

import { useActionState } from 'react';
import { createRoom } from '@/app/actions/rooms';
import Link from 'next/link';

export default function RoomForm({ propertyId }: { propertyId: string }) {
  const initialState = { message: '', errors: {} };
  const createRoomWithId = createRoom.bind(null, propertyId);
  const [state, dispatch] = useActionState(createRoomWithId, initialState);

  return (
    <form action={dispatch} className="space-y-4 max-w-lg">
      
      {/* Name */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Room Name</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="e.g. Dorm 1"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.name && (
          <p className="text-sm text-red-500 mt-1">{state.errors.name}</p>
        )}
      </div>

      {/* Type */}
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">Type</label>
        <select
          id="type"
          name="type"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="dormitory">Dormitory</option>
          <option value="private">Private</option>
          <option value="suite">Suite</option>
        </select>
        {state.errors?.type && (
          <p className="text-sm text-red-500 mt-1">{state.errors.type}</p>
        )}
      </div>

      {/* Beds */}
      <div>
        <label htmlFor="beds" className="block text-sm font-medium text-gray-700">Number of Beds</label>
        <input
          id="beds"
          name="beds"
          type="number"
          min="1"
          defaultValue="1"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.beds && (
          <p className="text-sm text-red-500 mt-1">{state.errors.beds}</p>
        )}
      </div>

      {/* Max Occupancy */}
      <div>
        <label htmlFor="maxOccupancy" className="block text-sm font-medium text-gray-700">Max Occupancy</label>
        <input
          id="maxOccupancy"
          name="maxOccupancy"
          type="number"
          min="1"
          defaultValue="1"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.maxOccupancy && (
          <p className="text-sm text-red-500 mt-1">{state.errors.maxOccupancy}</p>
        )}
      </div>

      {/* Price */}
      <div>
        <label htmlFor="pricePerNight" className="block text-sm font-medium text-gray-700">Price Per Night (EUR)</label>
        <input
          id="pricePerNight"
          name="pricePerNight"
          type="number"
          step="0.01"
          min="0"
          defaultValue="0"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.pricePerNight && (
          <p className="text-sm text-red-500 mt-1">{state.errors.pricePerNight}</p>
        )}
      </div>

      <div className="flex gap-4 items-center">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Room
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
