'use client';

import * as React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { SearchInput } from '../search-input/search-input';

export interface FilterBarProps extends React.HTMLAttributes<HTMLDivElement> {
  ref?: React.Ref<HTMLDivElement>;
  onSearch?: (q: string) => void;
  onFilterChange?: (filters: Record<string, string>) => void;
  onSortChange?: (sort: string) => void;
  onViewChange?: (view: 'grid' | 'list') => void;
}

const FilterBar = ({ className, onSearch, onFilterChange, onSortChange, onViewChange, ref, ...props }: FilterBarProps) => {
  const [view, setView] = React.useState<'grid' | 'list'>('grid');
  const [search, setSearch] = React.useState('');

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    onSearch?.(val);
  };

  const handleViewChange = (newView: 'grid' | 'list') => {
    setView(newView);
    onViewChange?.(newView);
  };

  return (
    <div ref={ref} className={cn('flex items-center gap-3', className)} {...props}>
      <SearchInput
        placeholder="Search…"
        value={search}
        onChange={handleSearch}
        onClear={() => {
          setSearch('');
          onSearch?.('');
        }}
        className="flex-1"
      />

      {/* View toggle */}
      <div className="flex items-center gap-1 border border-[var(--rule)] rounded p-0.5">
        <button
          type="button"
          aria-label="Grid view"
          aria-pressed={view === 'grid'}
          onClick={() => handleViewChange('grid')}
          className={cn(
            'p-1.5 rounded transition-colors',
            view === 'grid' ? 'bg-[var(--paper-2)] text-[var(--ink)]' : 'text-[var(--ink-3)]'
          )}
        >
          <LayoutGrid className="h-4 w-4" />
        </button>
        <button
          type="button"
          aria-label="List view"
          aria-pressed={view === 'list'}
          onClick={() => handleViewChange('list')}
          className={cn(
            'p-1.5 rounded transition-colors',
            view === 'list' ? 'bg-[var(--paper-2)] text-[var(--ink)]' : 'text-[var(--ink-3)]'
          )}
        >
          <List className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

FilterBar.displayName = 'FilterBar';

export { FilterBar };
