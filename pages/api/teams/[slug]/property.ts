import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getTeamBySlug } from '@/models/team';
import { createProperty, getProperty, updateProperty, deleteProperty } from '@/models/property';
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

    // Check if user is member of the team
    const teamMember = team.members.find(m => m.userId === session.user.id);
    if (!teamMember) {
      return res.status(403).json({ error: 'Access denied' });
    }

    switch (req.method) {
      case 'GET':
        const property = await getProperty(team.id);
        return res.status(200).json(property);

      case 'POST':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        const newProperty = await createProperty({
          teamId: team.id,
          ...req.body,
        });
        return res.status(201).json(newProperty);

      case 'PUT':
        if (teamMember.role !== 'ADMIN' && teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Insufficient permissions' });
        }
        
        const updatedProperty = await updateProperty(team.id, req.body);
        return res.status(200).json(updatedProperty);

      case 'DELETE':
        if (teamMember.role !== 'OWNER') {
          return res.status(403).json({ error: 'Only owners can delete property' });
        }
        
        await deleteProperty(team.id);
        return res.status(204).end();

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Property API error:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
