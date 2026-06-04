export interface UpdateUserInput {
  id: string;
  username?: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  locale?: string | null;
  timezone?: string | null;
}
