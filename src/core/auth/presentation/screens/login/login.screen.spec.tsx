import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';

const mockMutate = vi.hoisted(() => vi.fn());
const mockIsPending = vi.hoisted(() => ({ value: false }));
const mockError = vi.hoisted(() => ({ value: null as Error | null }));

vi.mock('@/core/auth/presentation/hooks/use-login/useLogin.hook', () => ({
  useLogin: () => ({
    mutate: mockMutate,
    isPending: mockIsPending.value,
    error: mockError.value,
  }),
}));

vi.mock('next/navigation', () => ({
  useRouter: () => ({ replace: vi.fn() }),
  useSearchParams: () => ({ get: () => null }),
}));

import { LoginScreen } from './login.screen';

const dict = {
  title: 'Sign in',
  eyebrow: '✦ Bienvenida de vuelta',
  email: 'Email',
  emailPlaceholder: 'you@example.com',
  password: 'Password',
  passwordPlaceholder: 'Min. 6 characters',
  submit: 'Sign in',
  submitting: 'Signing in...',
  invalidCredentials: 'Invalid email or password',
  keepSession: 'Keep me signed in on this device',
  emailInvalid: 'Invalid email',
  passwordMin: 'At least 6 characters',
  forgotPassword: 'Forgot your password?',
  register: "Don't have an account?",
};

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const Wrapper = ({ children }: { children: React.ReactNode }) =>
    React.createElement(QueryClientProvider, { client: queryClient }, children);
  Wrapper.displayName = 'QueryWrapper';
  return Wrapper;
}

describe('LoginScreen', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockIsPending.value = false;
    mockError.value = null;
  });

  it('renders without error banner when no error', () => {
    render(<LoginScreen dict={dict} />, { wrapper: createWrapper() });

    expect(screen.getByLabelText(dict.email)).toBeDefined();
    expect(screen.getByLabelText(dict.password)).toBeDefined();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders error banner after failed login', () => {
    mockError.value = new Error('Invalid credentials');

    render(<LoginScreen dict={dict} />, { wrapper: createWrapper() });

    expect(screen.getByRole('alert')).toBeDefined();
    expect(screen.getByText(dict.invalidCredentials)).toBeDefined();
  });

  it('renders forgot-password link', () => {
    render(<LoginScreen dict={dict} />, { wrapper: createWrapper() });

    const forgotLink = screen.getByText(dict.forgotPassword);
    expect(forgotLink.closest('a')?.getAttribute('href')).toContain('forgot-password');
  });
});
