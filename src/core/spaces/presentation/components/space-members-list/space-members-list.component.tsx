'use client';

import { useSpaceMembers } from '@/core/spaces/presentation/hooks/use-space-members/useSpaceMembers.hook';

type Props = {
  dict: {
    loading: string;
    empty: string;
  };
};

export function SpaceMembersList({ dict }: Props) {
  const { data, isLoading } = useSpaceMembers();

  if (isLoading) {
    return (
      <ul className="flex flex-col gap-3" aria-label={dict.loading}>
        {[0, 1, 2].map((i) => (
          <li key={i} className="flex items-center gap-3 animate-pulse">
            <div className="h-8 w-8 rounded-full bg-muted" />
            <div className="flex flex-col gap-1">
              <div className="h-3 w-28 rounded bg-muted" />
              <div className="h-2 w-20 rounded bg-muted" />
            </div>
          </li>
        ))}
      </ul>
    );
  }

  if (!data || data.length === 0) {
    return <p className="text-sm text-muted-foreground">{dict.empty}</p>;
  }

  return (
    <ul className="flex flex-col gap-3">
      {data.map((user) => {
        const displayName =
          [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;
        const initial = user.username[0]?.toUpperCase() ?? '?';

        return (
          <li key={user.id} className="flex items-center gap-3">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={displayName}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div
                className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium text-primary"
                aria-hidden="true"
              >
                {initial}
              </div>
            )}
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-tight">{displayName}</span>
              <span className="text-xs text-muted-foreground">@{user.username}</span>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
