export interface Node {
  id: string;
  spaceId: string;
  bridgeId: string;
  name: string | null;
  status: string;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
