export type InvitationRole = 'OWNER' | 'MEMBER';

export interface SpaceInvitation {
  id: string;
  displayCode: string;
  code: string;
  qrId: string | null;
  expiresAt: string;
  role: InvitationRole;
  spaceId: string;
}
