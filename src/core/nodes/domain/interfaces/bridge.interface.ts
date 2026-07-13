export interface Bridge {
  id: string;
  spaceId: string | null;
  name: string | null;
  status: string;
  lastSeenAt: string | null;
  createdAt: string;
  updatedAt: string;
}
