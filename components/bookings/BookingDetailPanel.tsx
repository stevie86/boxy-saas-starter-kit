import { UpdateBookingInput } from '@/lib/validation/booking';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateBookingSchema } from '@/lib/validation/booking';
import { useToast } from '@/components/ui/use-toast';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface BookingDetailPanelProps {
  booking: {
    id: string;
    guestId: string;
    checkIn: Date;
    checkOut: Date;
    totalAmount: number;
    channel?: string;
    notes?: string;
    status?: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled' | 'no_show';
    paymentStatus?: 'pending' | 'partial' | 'paid' | 'refunded';
    teamId: string;
    guest: {
      firstName: string;
      lastName: string;
    };
    rooms: {
      name: string;
    }[];
  };
  onClose: () => void;
}

const BookingDetailPanel: React.FC<BookingDetailPanelProps> = ({ booking, onClose }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<UpdateBookingInput>({
    resolver: zodResolver(updateBookingSchema),
    defaultValues: {
      status: booking.status || 'pending',
      paymentStatus: booking.paymentStatus || 'pending',
    },
  });

  useEffect(() => {
    form.reset({
      status: booking.status || 'pending',
      paymentStatus: booking.paymentStatus || 'pending',
    });
  }, [booking, form]);

  const onSubmit = async (values: UpdateBookingInput) => {
    try {
      // Update booking
      await prisma.booking.update({
        where: { id: booking.id },
        data: values,
      });
      toast({
        title: "Success",
        description: "Booking updated successfully",
      });
      revalidatePath(`/teams/${booking.teamId}/bookings`);
      router.refresh();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <h3 className="font-bold text-lg">Booking Details</h3>
      <p>Guest: {booking.guest.firstName} {booking.guest.lastName}</p>
      <p>Rooms: {booking.rooms.map((room) => room.name).join(', ')}</p>
      <p>Check-in: {booking.checkIn.toLocaleDateString()}</p>
      <p>Check-out: {booking.checkOut.toLocaleDateString()}</p>
      <p>Total Amount: {booking.totalAmount}</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Status</span>
          </label>
          <select className="select select-bordered w-full" {...form.register('status')}>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Cancelled</option>
            <option value="no_show">No Show</option>
          </select>
        </div>
        <div>
          <label className="label">
            <span className="label-text">Payment Status</span>
          </label>
          <select className="select select-bordered w-full" {...form.register('paymentStatus')}>
            <option value="pending">Pending</option>
            <option value="partial">Partial</option>
            <option value="paid">Paid</option>
            <option value="refunded">Refunded</option>
          </select>
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="btn btn-primary">
            Update
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingDetailPanel;
