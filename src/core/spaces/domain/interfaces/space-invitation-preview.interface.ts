import type { InvitationRole } from '@/core/spaces/domain/types/space-invitation.type';

export interface SpaceInvitationPreview {
  spaceName: string;
  role: InvitationRole;
  expiresAt: string;
  isExpired: boolean;
}
