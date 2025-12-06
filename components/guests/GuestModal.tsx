import { useState } from 'react';
import { CreateGuestInput, UpdateGuestInput } from '@/lib/validation/guest';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createGuestSchema, updateGuestSchema } from '@/lib/validation/guest';
import { useToast } from '@/components/ui/use-toast';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { useRouter } from 'next/navigation';

interface GuestModalProps {
  isOpen: boolean;
  onClose: () => void;
  guest?: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    phone?: string;
    dateOfBirth?: string;
    nationality?: string;
    documentType?: 'passport' | 'id_card' | 'driving_license';
    documentId?: string;
    address?: string;
    city?: string;
    country?: string;
    notes?: string;
    blacklisted?: boolean;
  };
  teamId: string;
}

const GuestModal: React.FC<GuestModalProps> = ({ isOpen, onClose, guest, teamId }) => {
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<CreateGuestInput>({
    resolver: zodResolver(createGuestSchema),
    defaultValues: {
      firstName: guest?.firstName || '',
      lastName: guest?.lastName || '',
      email: guest?.email || '',
      phone: guest?.phone || '',
      dateOfBirth: guest?.dateOfBirth || '',
      nationality: guest?.nationality || '',
      documentType: guest?.documentType || undefined,
      documentId: guest?.documentId || '',
      address: guest?.address || '',
      city: guest?.city || '',
      country: guest?.country || '',
      notes: guest?.notes || '',
    },
  });

  const onSubmit = async (values: CreateGuestInput) => {
    try {
      if (guest) {
        // Update guest
        await prisma.guest.update({
          where: { id: guest.id },
          data: values,
        });
        toast({
          title: "Success",
          description: "Guest updated successfully",
        });
      } else {
        // Create guest
        await prisma.guest.create({
          data: {
            ...values,
            teamId: teamId,
          },
        });
        toast({
          title: "Success",
          description: "Guest created successfully",
        });
      }
      revalidatePath(`/teams/${teamId}/guests`);
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
        <h3 className="font-bold text-lg">{guest ? 'Edit Guest' : 'Add Guest'}</h3>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">
              <span className="label-text">First Name</span>
            </label>
            <input
              type="text"
              placeholder="First Name"
              className="input input-bordered w-full"
              {...form.register('firstName')}
            />
            {form.formState.errors.firstName && (
              <p className="text-red-500">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Last Name</span>
            </label>
            <input
              type="text"
              placeholder="Last Name"
              className="input input-bordered w-full"
              {...form.register('lastName')}
            />
            {form.formState.errors.lastName && (
              <p className="text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Email</span>
            </label>
            <input
              type="email"
              placeholder="Email Address"
              className="input input-bordered w-full"
              {...form.register('email')}
            />
            {form.formState.errors.email && (
              <p className="text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>
          <div>
            <label className="label">
              <span className="label-text">Phone</span>
            </label>
            <input
              type="tel"
              placeholder="Phone Number"
              className="input input-bordered w-full"
              {...form.register('phone')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Date of Birth</span>
            </label>
            <input
              type="date"
              placeholder="Date of Birth"
              className="input input-bordered w-full"
              {...form.register('dateOfBirth')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Nationality</span>
            </label>
            <input
              type="text"
              placeholder="Nationality"
              className="input input-bordered w-full"
              {...form.register('nationality')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Document Type</span>
            </label>
            <select className="select select-bordered w-full" {...form.register('documentType')}>
              <option value="passport">Passport</option>
              <option value="id_card">ID Card</option>
              <option value="driving_license">Driving License</option>
            </select>
          </div>
          <div>
            <label className="label">
              <span className="label-text">Document ID</span>
            </label>
            <input
              type="text"
              placeholder="Document ID"
              className="input input-bordered w-full"
              {...form.register('documentId')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Address</span>
            </label>
            <input
              type="text"
              placeholder="Address"
              className="input input-bordered w-full"
              {...form.register('address')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">City</span>
            </label>
            <input
              type="text"
              placeholder="City"
              className="input input-bordered w-full"
              {...form.register('city')}
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text">Country</span>
            </label>
            <input
              type="text"
              placeholder="Country"
              className="input input-bordered w-full"
              {...form.register('country')}
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
              {guest ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default GuestModal;
