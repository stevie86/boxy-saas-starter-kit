import { useState } from 'react';
import { CreateRoomInput, UpdateRoomInput } from '@/lib/validation/room';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createRoomSchema, updateRoomSchema } from '@/lib/validation/room';
import { useToast } from '@/components/ui/use-toast';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';

interface RoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  room?: {
    id: string;
    name: string;
    type: string;
    beds: number;
    pricePerNight: number;
    description?: string;
    amenities?: string[];
    maxOccupancy: number;
    status?: string;
  };
  teamId: string;
}

const RoomModal: React.FC<RoomModalProps> = ({ isOpen, onClose, room, teamId }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateRoomInput>({
    resolver: zodResolver(createRoomSchema),
    defaultValues: {
      name: room?.name || '',
      type: room?.type || 'dormitory',
      beds: room?.beds || 1,
      pricePerNight: room?.pricePerNight || 0,
      description: room?.description || '',
      amenities: room?.amenities || [],
      maxOccupancy: room?.maxOccupancy || 1,
    },
  });

  const onSubmit = async (values: CreateRoomInput) => {
    try {
      if (room) {
        // Update room
        await prisma.room.update({
          where: { id: room.id },
          data: values,
        });
        toast({
          title: "Success",
          description: "Room updated successfully",
        });
      } else {
        // Create room
        await prisma.room.create({
          data: {
            ...values,
            teamId: teamId,
          },
        });
        toast({
          title: "Success",
          description: "Room created successfully",
        });
      }
      revalidatePath(`/teams/${teamId}/rooms`);
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
    <div className={`modal ${isOpen ? 'modal-open' : ''}`}>
      <div className="modal-box">
        <h3 className="font-bold text-lg">{room ? 'Edit Room' : 'Create Room'}</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">Name</span>
            </label>
            <input
              type="text"
              placeholder="Room Name"
              className="input input-bordered w-full"
              {...form.register('name')}
            />
            {form.formState.errors.name && (
              <p className="text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Type</span>
            </label>
            <select className="select select-bordered w-full" {...form.register('type')}>
              <option value="dormitory">Dormitory</option>
              <option value="private">Private</option>
              <option value="suite">Suite</option>
            </select>
            {form.formState.errors.type && (
              <p className="text-red-500">{form.formState.errors.type.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Beds</span>
            </label>
            <input
              type="number"
              placeholder="Number of Beds"
              className="input input-bordered w-full"
              {...form.register('beds', { valueAsNumber: true })}
            />
            {form.formState.errors.beds && (
              <p className="text-red-500">{form.formState.errors.beds.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Price per Night</span>
            </label>
            <input
              type="number"
              placeholder="Price"
              className="input input-bordered w-full"
              {...form.register('pricePerNight', { valueAsNumber: true })}
            />
            {form.formState.errors.pricePerNight && (
              <p className="text-red-500">{form.formState.errors.pricePerNight.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Max Occupancy</span>
            </label>
            <input
              type="number"
              placeholder="Max Occupancy"
              className="input input-bordered w-full"
              {...form.register('maxOccupancy', { valueAsNumber: true })}
            />
            {form.formState.errors.maxOccupancy && (
              <p className="text-red-500">{form.formState.errors.maxOccupancy.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Description</span>
            </label>
            <textarea
              placeholder="Description"
              className="textarea textarea-bordered w-full"
              {...form.register('description')}
            />
          </div>
          <div className="modal-action">
            <button type="button" className="btn" onClick={onClose}>
              Close
            </button>
            <button type="submit" className="btn btn-primary">
              {room ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoomModal;
