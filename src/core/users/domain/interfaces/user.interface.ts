export interface User {
  id: string;
  status: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  locale?: string | null;
  timezone?: string | null;
  createdAt: string;
  updatedAt?: string | null;
}
