export type InvitationRole = 'owner' | 'member';

export interface SpaceInvitation {
  id: string;
  displayCode: string;
  code: string;
  qrId: string | null;
  expiresAt: string;
  role: InvitationRole;
  spaceId: string;
}
