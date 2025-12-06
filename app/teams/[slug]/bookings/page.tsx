import { useState } from 'react';
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageHeader from "@/components/ui/panels/PageHeader";
import BookingForm from "@/components/bookings/BookingForm";
import BookingDetailPanel from "@/components/bookings/BookingDetailPanel";

export default async function BookingsPage() {
  const session = await getSession();

  if (!session) {
    redirect('/auth/sign-in');
  }

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const openForm = () => setIsFormOpen(true);
  const closeForm = () => setIsFormOpen(false);
  const closePanel = () => setSelectedBooking(null);

  const bookings = await prisma.booking.findMany({
    where: {
      teamId: session.team.id,
    },
    include: {
      guest: true,
      rooms: true,
    },
  });

  const handleBookingClick = (booking) => {
    setSelectedBooking(booking);
  };

  return (
    <div>
      <PageHeader title="Bookings" description="Manage your bookings" />
      <div className="mb-4">
        <button className="btn btn-primary" onClick={openForm}>
          Create Booking
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="table w-full">
          <thead>
            <tr>
              <th>Guest</th>
              <th>Rooms</th>
              <th>Check-in</th>
              <th>Check-out</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} onClick={() => handleBookingClick(booking)}>
                <td>{booking.guest.firstName} {booking.guest.lastName}</td>
                <td>{booking.rooms.map((room) => room.name).join(', ')}</td>
                <td>{booking.checkIn.toLocaleDateString()}</td>
                <td>{booking.checkOut.toLocaleDateString()}</td>
                <td>
                  <button className="btn btn-sm">
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <input type="checkbox" id="booking-form-modal" className="modal-toggle" checked={isFormOpen} onChange={() => setIsFormOpen(!isFormOpen)}/>
      <div className="modal">
        <div className="modal-box">
          <BookingForm teamId={session.team.id} onClose={closeForm} />
        </div>
      </div>
      {selectedBooking && (
        <div className="modal modal-open">
          <div className="modal-box">
            <BookingDetailPanel booking={selectedBooking} onClose={closePanel} />
          </div>
        </div>
      )}
    </div>
  );
}
