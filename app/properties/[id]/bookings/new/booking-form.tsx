'use client';

import { useActionState } from 'react';
import { createBooking } from '@/app/actions/bookings';
import Link from 'next/link';

type Room = {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
};

export default function BookingForm({ propertyId, rooms }: { propertyId: string; rooms: Room[] }) {
  const initialState = { message: '', errors: {} };
  const createBookingWithId = createBooking.bind(null, propertyId);
  const [state, dispatch] = useActionState(createBookingWithId, initialState);

  return (
    <form action={dispatch} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
      
      {/* Guest Name */}
      <div>
        <label htmlFor="guestName" className="block text-sm font-medium text-gray-700">Guest Name</label>
        <input
          id="guestName"
          name="guestName"
          type="text"
          required
          placeholder="John Doe"
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
        {state.errors?.guestName && (
          <p className="text-sm text-red-500 mt-1">{state.errors.guestName}</p>
        )}
      </div>

      {/* Room Selection */}
      <div>
        <label htmlFor="roomId" className="block text-sm font-medium text-gray-700">Room</label>
        <select
          id="roomId"
          name="roomId"
          required
          className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value="">Select a Room</option>
          {rooms.map((room) => (
            <option key={room.id} value={room.id}>
              {room.name} ({room.type}) - {(room.pricePerNight / 100).toFixed(2)}/night
            </option>
          ))}
        </select>
        {state.errors?.roomId && (
          <p className="text-sm text-red-500 mt-1">{state.errors.roomId}</p>
        )}
      </div>

      {/* Dates */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkIn" className="block text-sm font-medium text-gray-700">Check-In</label>
          <input
            id="checkIn"
            name="checkIn"
            type="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {state.errors?.checkIn && (
            <p className="text-sm text-red-500 mt-1">{state.errors.checkIn}</p>
          )}
        </div>

        <div>
          <label htmlFor="checkOut" className="block text-sm font-medium text-gray-700">Check-Out</label>
          <input
            id="checkOut"
            name="checkOut"
            type="date"
            required
            className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {state.errors?.checkOut && (
            <p className="text-sm text-red-500 mt-1">{state.errors.checkOut}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 items-center pt-4">
        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Create Booking
        </button>
        <Link href={`/properties/${propertyId}/bookings`} className="text-gray-600 hover:text-gray-900">
          Cancel
        </Link>
      </div>

      {state.message && (
        <div className={`p-3 rounded text-sm ${state.message.includes('Error') || state.message.includes('fully booked') || state.message.includes('must be after') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {state.message}
        </div>
      )}
    </form>
  );
}
