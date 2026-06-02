'use client';

import { useState } from 'react';
import type { UseFormRegisterReturn } from 'react-hook-form';

export type AuthFieldProps = {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

export function AuthField({ id, label, type = 'text', placeholder, error, registration }: AuthFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = type === 'password';
  const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        htmlFor={id}
        style={{
          fontFamily: 'var(--mono)',
          fontSize: '10.5px',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: 'var(--ink-2)',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input
          id={id}
          type={inputType}
          placeholder={placeholder}
          {...registration}
          style={{
            width: '100%',
            fontFamily: 'var(--sans)',
            fontSize: '14px',
            padding: '10px 12px',
            borderRadius: '9px',
            border: `1.5px solid ${error ? 'var(--terracotta)' : 'oklch(0.84 0.03 70)'}`,
            boxShadow: error
              ? '0 0 0 3px oklch(0.62 0.13 35 / 0.14)'
              : 'none',
            outline: 'none',
            background: 'var(--paper)',
            color: 'var(--ink)',
            boxSizing: 'border-box',
          }}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            style={{
              position: 'absolute',
              right: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--ink-3)',
              padding: '4px',
              fontSize: '12px',
            }}
          >
            {showPassword ? 'Hide' : 'Show'}
          </button>
        )}
      </div>
      {error && (
        <p role="alert" style={{ fontSize: '12px', color: 'var(--terracotta)', margin: 0 }}>
          {error}
        </p>
      )}
    </div>
  );
}
