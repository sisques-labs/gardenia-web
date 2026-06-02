'use client';

import { Bell } from 'lucide-react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
};

export function HomeTopBar({ dict }: Props) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const availableSpaces = useSpacesStore((s) => s.availableSpaces);
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);

  const displayName = currentUser
    ? currentUser.email.split('@')[0]
    : (availableSpaces.find((s) => s.id === currentSpaceId)?.name ?? '');

  return (
    <div className="flex items-center justify-between gap-4 px-8 py-4 border-b" style={{ color: 'var(--ink)' }}>
      <div className="text-lg font-semibold" style={{ color: 'var(--forest)' }}>
        {dict.greeting}, {displayName}
      </div>

      <div className="flex items-center gap-3 flex-1 max-w-sm mx-auto">
        <input
          type="text"
          placeholder={dict.topbar.search}
          readOnly
          className="w-full rounded-md border px-3 py-1.5 text-sm"
          style={{ backgroundColor: 'var(--paper)', color: 'var(--ink-2)' }}
        />
      </div>

      <div className="flex items-center gap-2">
        <button
          aria-label="notifications"
          className="p-2 rounded-md hover:bg-muted transition-colors"
          style={{ color: 'var(--ink-3)' }}
        >
          <Bell size={18} />
        </button>

        <button
          className="px-4 py-1.5 rounded-md text-sm font-medium transition-colors"
          style={{ backgroundColor: 'var(--forest)', color: 'var(--paper)' }}
        >
          {dict.topbar.newEntry}
        </button>
      </div>
    </div>
  );
}
