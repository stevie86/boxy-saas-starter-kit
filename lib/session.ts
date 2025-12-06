import type {
  GetServerSidePropsContext,
  NextApiRequest,
  NextApiResponse,
} from 'next';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { getAuthOptions } from './nextAuth';

export const getSession = async (
  req?: NextApiRequest | GetServerSidePropsContext['req'],
  res?: NextApiResponse | GetServerSidePropsContext['res']
) => {
  const authOptions = getAuthOptions(req, res);
  const session = await getServerSession(req, res, authOptions);
  
  if (!session?.user?.id) {
    return null;
  }

  // Get user with team membership and property
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      teamMembers: {
        include: {
          team: {
            include: {
              property: true
            }
          }
        }
      }
    }
  });

  if (!user || user.teamMembers.length === 0) {
    return null;
  }

  // Return the first team for now (can be enhanced for multi-team support)
  const teamMember = user.teamMembers[0];
  
  return {
    user,
    team: teamMember.team,
    teamMember,
    property: teamMember.team.property,
    // Keep original session for compatibility
    ...session
  };
};
