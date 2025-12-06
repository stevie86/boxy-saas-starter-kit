import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getTeamBySlug } from '@/models/team';
import { getProperty } from '@/models/property';
import { getBooking, updateBooking, deleteBooking, checkInBooking, checkOutBooking, cancelBooking } from '@/models/booking';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { slug, id } = req.query as { slug: string; id: string };
    const team = await getTeamBySlug(slug);
    
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }

    const teamMember = team.members.find(m => m.userId === session.user.id);
    if (!teamMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const property = await getProperty(team.id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found' });
    }

    switch (req.method) {
      case 'GET':
        const booking = await getBooking(id);
        if (!booking || booking.propertyId !== property.id) {
          return res.status(404).json({ error: 'Booking not found' });
        }
        return res.status(200).json(booking);

      case 'PUT':
        const { action, ...updateData } = req.body;
        
        let updatedBooking;
        if (action === 'check_in') {
          updatedBooking = await checkInBooking(id);
        } else if (action === 'check_out') {
          updatedBooking = await checkOutBooking(id);
        } else if (action === 'cancel') {
          updatedBooking = await cancelBooking(id);
        } else {
          updatedBooking = await updateBooking(id, updateData);
        }
        
        return res.status(200).json(updatedBooking);

      case 'DELETE':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        await deleteBooking(id);
        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Booking API error:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
