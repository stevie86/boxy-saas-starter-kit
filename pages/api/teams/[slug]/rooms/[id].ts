import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getTeamBySlug } from '@/models/team';
import { getProperty } from '@/models/property';
import { getRoom, updateRoom, deleteRoom } from '@/models/room';
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
        const room = await getRoom(id);
        if (!room || room.propertyId !== property.id) {
          return res.status(404).json({ error: 'Room not found' });
        }
        return res.status(200).json(room);

      case 'PUT':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        const updatedRoom = await updateRoom(id, req.body);
        return res.status(200).json(updatedRoom);

      case 'DELETE':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        await deleteRoom(id);
        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Room API error:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
