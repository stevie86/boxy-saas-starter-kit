import { useState, useEffect } from 'react';
import { CreateBookingInput } from '@/lib/validation/booking';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createBookingSchema } from '@/lib/validation/booking';
import { useToast } from '@/components/ui/use-toast';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';

interface BookingFormProps {
  teamId: string;
  onClose: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ teamId, onClose }) => {
  const { toast } = useToast();
  const router = useRouter();
  const [guests, setGuests] = useState([]);
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const fetchGuests = async () => {
      const guests = await prisma.guest.findMany({
        where: {
          teamId: teamId,
        },
      });
      setGuests(guests);
    };

    const fetchRooms = async () => {
      const rooms = await prisma.room.findMany({
        where: {
          teamId: teamId,
        },
      });
      setRooms(rooms);
    };

    fetchGuests();
    fetchRooms();
  }, [teamId]);

  const form = useForm<CreateBookingInput>({
    resolver: zodResolver(createBookingSchema),
    defaultValues: {
      guestId: '',
      checkIn: '',
      checkOut: '',
      totalAmount: 0,
      channel: '',
      notes: '',
      roomIds: [],
    },
  });

  const onSubmit = async (values: CreateBookingInput) => {
    try {
      // Create booking
      await prisma.booking.create({
        data: {
          guestId: values.guestId,
          checkIn: new Date(values.checkIn),
          checkOut: new Date(values.checkOut),
          totalAmount: values.totalAmount,
          channel: values.channel,
          notes: values.notes,
          teamId: teamId,
          rooms: {
            connect: values.roomIds.map((roomId) => ({ id: roomId })),
          },
        },
      });
      toast({
        title: "Success",
        description: "Booking created successfully",
      });
      revalidatePath(`/teams/${teamId}/bookings`);
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
      <h3 className="font-bold text-lg">Create Booking</h3>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="label">
            <span className="label-text">Guest</span>
          </label>
          <select className="select select-bordered w-full" {...form.register('guestId')}>
            <option value="">Select a guest</option>
            {guests.map((guest) => (
              <option key={guest.id} value={guest.id}>
                {guest.firstName} {guest.lastName}
              </option>
            ))}
          </select>
          {form.formState.errors.guestId && (
            <p className="text-red-500">{form.formState.errors.guestId.message}</p>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Check-in Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            {...form.register('checkIn')}
          />
          {form.formState.errors.checkIn && (
            <p className="text-red-500">{form.formState.errors.checkIn.message}</p>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Check-out Date</span>
          </label>
          <input
            type="date"
            className="input input-bordered w-full"
            {...form.register('checkOut')}
          />
          {form.formState.errors.checkOut && (
            <p className="text-red-500">{form.formState.errors.checkOut.message}</p>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Rooms</span>
          </label>
          <select
            className="select select-bordered w-full"
            multiple
            {...form.register('roomIds')}
          >
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.name}
              </option>
            ))}
          </select>
          {form.formState.errors.roomIds && (
            <p className="text-red-500">{form.formState.errors.roomIds.message}</p>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Total Amount</span>
          </label>
          <input
            type="number"
            placeholder="Total Amount"
            className="input input-bordered w-full"
            {...form.register('totalAmount', { valueAsNumber: true })}
          />
          {form.formState.errors.totalAmount && (
            <p className="text-red-500">{form.formState.errors.totalAmount.message}</p>
          )}
        </div>
        <div>
          <label className="label">
            <span className="label-text">Channel</span>
          </label>
          <input
            type="text"
            placeholder="Channel"
            className="input input-bordered w-full"
            {...form.register('channel')}
          />
        </div>
        <div>
          <label className="label">
            <span className="label-text">Notes</span>
          </label>
          <textarea
            placeholder="Notes"
            className="textarea textarea-bordered w-full"
            {...form.register('notes')}
          />
        </div>
        <div className="modal-action">
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
          <button type="submit" className="btn btn-primary">
            Create
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingForm;
