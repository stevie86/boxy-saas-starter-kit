import type { Team, TeamMember } from '@prisma/client';

export type TeamMemberWithTeam = TeamMember & { team: Team };
