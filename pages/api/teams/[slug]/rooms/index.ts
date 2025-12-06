import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getTeamBySlug } from '@/models/team';
import { getProperty } from '@/models/property';
import { createRoom, getRooms, getRoomAvailability } from '@/models/room';
import { ApiError } from '@/lib/errors';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const session = await getSession(req, res);
    if (!session?.user?.id) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { slug } = req.query as { slug: string };
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
        const { checkIn, checkOut } = req.query;
        
        if (checkIn && checkOut) {
          // Get room availability
          const availableRooms = await getRoomAvailability(
            property.id,
            new Date(checkIn as string),
            new Date(checkOut as string)
          );
          return res.status(200).json(availableRooms);
        } else {
          // Get all rooms
          const rooms = await getRooms(property.id);
          return res.status(200).json(rooms);
        }

      case 'POST':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        const newRoom = await createRoom({
          propertyId: property.id,
          ...req.body,
        });
        return res.status(201).json(newRoom);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Rooms API error:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
