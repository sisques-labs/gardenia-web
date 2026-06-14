export interface CreateInvitationInput {
  spaceId: string;
  role?: 'owner' | 'member';
  expiresAt?: Date;
}
