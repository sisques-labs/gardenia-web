'use client';

import * as React from 'react';
import { Command } from 'cmdk';
import { cn } from '@/shared/lib/utils';

export interface ComboboxOption {
  value: string;
  label: string;
}

export interface ComboboxProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'> {
  options: ComboboxOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

const Combobox = React.forwardRef<HTMLDivElement, ComboboxProps>(
  ({ className, options, value, onChange, placeholder = 'Search…', ...props }, ref) => {
    const [open, setOpen] = React.useState(false);
    const [inputValue, setInputValue] = React.useState('');

    const handleSelect = (selectedValue: string) => {
      onChange?.(selectedValue);
      setOpen(false);
      setInputValue(options.find((o) => o.value === selectedValue)?.label ?? '');
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        <Command shouldFilter={false}>
          <Command.Input
            role="combobox"
            aria-expanded={open}
            value={inputValue}
            placeholder={placeholder}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') setOpen(false);
            }}
            onValueChange={(v) => {
              setInputValue(v);
              setOpen(true);
            }}
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
          />
          {open && (
            <Command.List className="card absolute z-50 mt-1 w-full py-1 max-h-60 overflow-auto text-sm">
              {options
                .filter((o) =>
                  o.label.toLowerCase().includes(inputValue.toLowerCase()),
                )
                .map((o) => (
                  <Command.Item
                    key={o.value}
                    value={o.value}
                    onSelect={handleSelect}
                    className="px-3 py-1.5 cursor-pointer hover:bg-[var(--paper-2)] aria-selected:bg-[var(--paper-2)]"
                  >
                    {o.label}
                  </Command.Item>
                ))}
              {options.filter((o) => o.label.toLowerCase().includes(inputValue.toLowerCase())).length === 0 && (
                <p className="px-3 py-1.5 text-[var(--ink-3)]">No results</p>
              )}
            </Command.List>
          )}
        </Command>
      </div>
    );
  },
);
Combobox.displayName = 'Combobox';

export { Combobox };
