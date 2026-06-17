'use client';

import Link from 'next/link';
import { Check, ChevronUp, LogOut, Plus, Settings, User } from 'lucide-react';
import { useAuthStore } from '@/core/auth/infrastructure/store/auth.store';
import { useLogout } from '@/core/auth/presentation/hooks/use-logout/useLogout.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/presentation/components/ui/dropdown-menu/dropdown-menu';
import type { AppDict } from '@/shared/presentation/i18n/get-dictionary';

type Props = {
  dict: {
    spaceSwitcher: AppDict['shell']['spaceSwitcher'];
    userMenu: AppDict['shell']['userMenu'];
  };
  locale: string;
  onNavigate?: () => void;
};

export function SidebarFooter({ dict, locale, onNavigate }: Props) {
  const { collapsed } = useSidebarStore();
  const currentUser = useAuthStore((s) => s.currentUser);
  const spaces = useSpacesStore((s) => s.availableSpaces);
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const setActiveSpace = useSpacesStore((s) => s.setActiveSpace);
  const { mutate: logout, isPending } = useLogout();

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) ?? null;
  const displayName = currentUser?.email.split('@')[0] ?? '';
  const spaceInitial = currentSpace?.name?.[0]?.toUpperCase() ?? displayName[0]?.toUpperCase() ?? '?';

  if (!currentUser && !currentSpace && spaces.length === 0) {
    return <div data-testid="sidebar-footer" className="px-3 py-2" />;
  }

  return (
    <div data-testid="sidebar-footer" className={collapsed ? 'px-1 py-2' : 'px-3 py-3'}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={dict.userMenu.openMenu}
            className={`rounded-md hover:bg-[var(--forest-bg)] transition-colors outline-none focus-visible:ring-2 focus-visible:ring-[var(--forest)] ${
              collapsed ? 'flex w-full justify-center p-2' : 'flex w-full items-center gap-2.5'
            }`}
          >
            <div className={`rounded-md bg-[var(--forest-bg)] flex items-center justify-center shrink-0 ${collapsed ? 'w-9 h-9' : 'w-8 h-8'}`}>
              <span className="text-sm font-bold text-[var(--forest)]">{spaceInitial}</span>
            </div>
            {!collapsed && (
              <>
                <div className="flex flex-col min-w-0 flex-1 text-left">
                  <span className="text-[10px] font-medium text-[var(--ink)]/50 uppercase tracking-wider leading-none mb-0.5">
                    {dict.spaceSwitcher.activeSpaceLabel}
                  </span>
                  <span className="text-xs font-medium text-[var(--ink)] truncate leading-tight">
                    {currentSpace?.name ?? displayName}
                  </span>
                  {currentUser && (
                    <span className="text-[10px] text-[var(--ink)]/50 truncate leading-tight">
                      {displayName}
                    </span>
                  )}
                </div>
                <ChevronUp className="h-3.5 w-3.5 shrink-0 text-[var(--ink)]/40" />
              </>
            )}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="top" align="start" className="w-56">
          {spaces.length > 0 && (
            <>
              <DropdownMenuLabel>{dict.spaceSwitcher.switchSpace}</DropdownMenuLabel>
              {spaces.map((space) => (
                <DropdownMenuItem
                  key={space.id}
                  onClick={() => setActiveSpace(space.id)}
                  className={space.id === currentSpaceId ? 'font-medium' : undefined}
                >
                  {space.id === currentSpaceId ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span className="h-4 w-4" aria-hidden="true" />
                  )}
                  {space.name}
                </DropdownMenuItem>
              ))}
            </>
          )}
          <DropdownMenuItem asChild>
            <Link href={`/${locale}/spaces/new`} onClick={onNavigate}>
              <Plus className="h-4 w-4" />
              {dict.spaceSwitcher.createSpace}
            </Link>
          </DropdownMenuItem>
          {currentUser && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/profile`} onClick={onNavigate}>
                  <User className="h-4 w-4" />
                  {dict.userMenu.profile}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/${locale}/settings`} onClick={onNavigate}>
                  <Settings className="h-4 w-4" />
                  {dict.userMenu.settings}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem danger disabled={isPending} onClick={() => logout()}>
                <LogOut className="h-4 w-4" />
                {dict.userMenu.logOut}
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
