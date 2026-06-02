'use client';

import { useSpaces } from '@/core/spaces/presentation/hooks/use-spaces/useSpaces.hook';
import { useSpacesStore } from '@/core/spaces/infrastructure/store/spaces.store';
import { useSidebarStore } from '@/shared/infrastructure/store/sidebar/sidebar.store';

export function SpaceSwitcher() {
  const { collapsed } = useSidebarStore();
  const { data: spaces = [] } = useSpaces();
  const currentSpaceId = useSpacesStore((s) => s.currentSpaceId);
  const setActiveSpace = useSpacesStore((s) => s.setActiveSpace);

  const currentSpace = spaces.find((s) => s.id === currentSpaceId) ?? null;

  if (!currentSpace && spaces.length === 0) {
    return <div data-testid="space-switcher" className="px-3 py-2" />;
  }

  return (
    <div data-testid="space-switcher" className="px-3 py-3">
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-md bg-[var(--forest-bg)] flex items-center justify-center shrink-0">
          <span className="text-sm font-bold text-[var(--forest)]">
            {currentSpace?.name?.[0]?.toUpperCase() ?? '?'}
          </span>
        </div>
        {!collapsed && (
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] font-medium text-[var(--ink)]/50 uppercase tracking-wider leading-none mb-0.5">
              Huerta activa {/* TODO: i18n */}
            </span>
            {spaces.length > 1 ? (
              <select
                className="text-xs font-medium text-[var(--ink)] bg-transparent border-none outline-none cursor-pointer p-0 leading-tight truncate max-w-[140px]"
                value={currentSpaceId ?? ''}
                onChange={(e) => setActiveSpace(e.target.value)}
                aria-label="Switch space"
              >
                {spaces.map((space) => (
                  <option key={space.id} value={space.id}>
                    {space.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="text-xs font-medium text-[var(--ink)] truncate leading-tight">
                {currentSpace?.name ?? '—'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
