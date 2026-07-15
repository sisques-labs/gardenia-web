'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { cn } from '@/shared/lib/utils';
import { useSpeciesSearch } from '@/core/plants/presentation/hooks/use-species-search/use-species-search.hook';
import type { GbifSpeciesSuggestion } from '@/core/plants/domain/interfaces/gbif-species-suggestion.interface';

export interface SpeciesComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'id'> {
  ref?: React.Ref<HTMLDivElement>;
  /** Accessible name for the search input (cmdk manages its own internal id, so an external <label for> won't link up — use this instead). */
  ariaLabel?: string;
  value?: GbifSpeciesSuggestion | null;
  onChange?: (value: GbifSpeciesSuggestion | null) => void;
  placeholder?: string;
  noResultsLabel?: string;
  unavailableLabel?: string;
}

const SpeciesCombobox = ({
  ref,
  ariaLabel,
  className,
  value,
  onChange,
  placeholder = 'Search…',
  noResultsLabel = 'No results',
  unavailableLabel = 'Species search is unavailable right now',
  ...props
}: SpeciesComboboxProps) => {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value?.scientificName ?? '');
  const listId = React.useId();
  const { data: suggestions, isFetching, isError } = useSpeciesSearch(query);

  const handleSelect = (suggestion: GbifSpeciesSuggestion) => {
    onChange?.(suggestion);
    setQuery(suggestion.scientificName);
    setOpen(false);
  };

  return (
    <div ref={ref} className={cn('relative', className)} {...props}>
      <Command shouldFilter={false} label={ariaLabel}>
        <Command.Input
          aria-label={ariaLabel}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-haspopup="listbox"
          value={query}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') setOpen(false);
          }}
          onValueChange={(v) => {
            setQuery(v);
            setOpen(true);
            if (v !== value?.scientificName) onChange?.(null);
          }}
          className="flex h-9 w-full rounded-md border border-[var(--rule)] bg-[var(--paper-2)] px-3 py-1 text-sm shadow-sm outline-none placeholder:text-[var(--ink-3)] focus:ring-1 focus:ring-[var(--forest-2)] disabled:cursor-not-allowed disabled:opacity-50"
        />
        {open && (
          <Command.List id={listId} className="card absolute z-50 mt-1 w-full py-1 max-h-60 overflow-auto text-sm">
            {isError ? (
              <p className="px-3 py-1.5 text-destructive">{unavailableLabel}</p>
            ) : isFetching ? (
              <p className="px-3 py-1.5 text-[var(--ink-3)]">…</p>
            ) : suggestions && suggestions.length > 0 ? (
              suggestions.map((suggestion) => (
                <Command.Item
                  key={suggestion.gbifKey}
                  value={String(suggestion.gbifKey)}
                  onSelect={() => handleSelect(suggestion)}
                  className="px-3 py-1.5 cursor-pointer hover:bg-[var(--paper-2)] aria-selected:bg-[var(--paper-2)]"
                >
                  {suggestion.scientificName}
                </Command.Item>
              ))
            ) : (
              <p className="px-3 py-1.5 text-[var(--ink-3)]">{noResultsLabel}</p>
            )}
          </Command.List>
        )}
      </Command>
    </div>
  );
};

SpeciesCombobox.displayName = 'SpeciesCombobox';

export { SpeciesCombobox };
