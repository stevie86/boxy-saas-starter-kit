import { NextApiRequest, NextApiResponse } from 'next';
import { getSession } from '@/lib/session';
import { getTeamBySlug } from '@/models/team';
import { getProperty } from '@/models/property';
import { createGuest, getGuests } from '@/models/guest';
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
        const { search, blacklisted } = req.query;
        
        const filters: any = {};
        if (search) filters.search = search as string;
        if (blacklisted !== undefined) filters.blacklisted = blacklisted === 'true';
        
        const guests = await getGuests(property.id, filters);
        return res.status(200).json(guests);

      case 'POST':
        const newGuest = await createGuest({
          propertyId: property.id,
          ...req.body,
        });
        return res.status(201).json(newGuest);

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Guests API error:', error);
    if (error instanceof ApiError) {
      return res.status(error.code).json({ error: error.message });
    }
    return res.status(500).json({ error: 'Internal server error' });
  }
}
