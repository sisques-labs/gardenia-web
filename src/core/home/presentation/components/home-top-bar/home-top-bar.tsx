'use client';

import { Bell, ChevronDown, Leaf, BookOpen } from 'lucide-react';
import { Button } from '@/shared/presentation/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/presentation/components/ui/dropdown-menu';
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
        <Button
          variant="ghost"
          size="sm"
          aria-label={dict.topbar.notifications}
          className="p-2"
        >
          <Bell size={18} />
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="gap-1.5">
              {dict.topbar.newEntry}
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{dict.topbar.createMenu.label}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>
              <Leaf className="h-4 w-4" />
              {dict.topbar.createMenu.newPlant}
            </DropdownMenuItem>
            <DropdownMenuItem disabled>
              <BookOpen className="h-4 w-4" />
              {dict.topbar.createMenu.newJournalEntry}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
