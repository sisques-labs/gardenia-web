export interface SpaceMembership {
  readonly userId: string;
  readonly spaceId: string;
  readonly role: 'owner' | 'member';
}
