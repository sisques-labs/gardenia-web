'use client';

import { useState } from 'react';
import { Bell, ChevronDown, Leaf } from 'lucide-react';
import { ScreenHeader } from '@/shared/presentation/components/screen-header/screen-header';
import { Button } from '@/shared/presentation/components/ui/button/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/shared/presentation/components/ui/dropdown-menu/dropdown-menu';
import { CreatePlantModal } from '@/core/plants/presentation/components/create-plant-modal/create-plant-modal';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: AppDict['home'];
  plantsDict: AppDict['plants']['create'];
};

export function HomeTopBar({ dict, plantsDict }: Props) {
  const currentUser = useAuthStore((s) => s.currentUser);
  const availableSpaces = useSpacesStore((s) => s.availableSpaces);
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const [isCreatePlantOpen, setIsCreatePlantOpen] = useState(false);

  const currentSpaceName = availableSpaces.find((s) => s.id === currentSpaceId)?.name;
  const displayName = currentUser ? currentUser.email.split('@')[0] : (currentSpaceName ?? '');

  // Only show the space name as a separate eyebrow when the greeting itself doesn't already
  // fall back to it — otherwise the same name would render twice.
  return (
    <>
      <ScreenHeader
        eyebrow={currentUser ? currentSpaceName : undefined}
        title={`${dict.greeting}, ${displayName}`}
        actions={
          <>
            <input
              type="text"
              placeholder={dict.topbar.search}
              readOnly
              className="w-40 sm:w-56 rounded-md border px-3 py-1.5 text-sm"
              style={{ backgroundColor: 'var(--paper)', color: 'var(--ink-2)' }}
            />

            <Button variant="ghost" size="sm" aria-label={dict.topbar.notifications} className="p-2">
              <Bell size={18} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="gap-1.5 bg-[var(--forest)] hover:bg-[var(--forest-2)] text-white">
                  {dict.topbar.newEntry}
                  <ChevronDown className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{dict.topbar.createMenu.label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setIsCreatePlantOpen(true)}>
                  <Leaf className="h-4 w-4" />
                  {dict.topbar.createMenu.newPlant}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </>
        }
      />

      {isCreatePlantOpen && (
        <CreatePlantModal
          spaceId={currentSpaceId}
          dict={plantsDict}
          onClose={() => setIsCreatePlantOpen(false)}
        />
      )}
    </>
  );
}
