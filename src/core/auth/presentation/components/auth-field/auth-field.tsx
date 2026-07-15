'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';
import { cn } from '@/shared/lib/utils';

export type AuthFieldProps = {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
  showLabel?: string;
  hideLabel?: string;
};

export function AuthField({ id, label, type = 'text', placeholder, error, registration, showLabel = 'Show', hideLabel = 'Hide' }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-[var(--mono)] text-[10.5px] uppercase tracking-[0.05em] text-[var(--ink-2)]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          {...registration}
          className={cn(
            'w-full box-border font-[var(--sans)] text-sm px-3 py-2.5 rounded-[9px] outline-none bg-[var(--paper)] text-[var(--ink)] border-[1.5px]',
            error
              ? 'border-[var(--terracotta)] shadow-[0_0_0_3px_oklch(0.62_0.13_35_/_0.14)]'
              : 'border-[oklch(0.84_0.03_70)] shadow-none',
          )}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? hideLabel : showLabel}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-0 cursor-pointer text-[var(--ink-3)] p-1 text-xs"
          >
            {showPassword ? hideLabel : showLabel}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" className="text-xs text-[var(--terracotta)] m-0">
          {error}
        </p>
      )}
    </div>
  );
}
