export type MembershipRole = 'owner' | 'member';

export interface SpaceMembership {
  userId: string;
  spaceId: string;
  role: MembershipRole;
  joinedAt: string;
}
