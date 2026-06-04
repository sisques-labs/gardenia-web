import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AuthSocial } from './auth-social';

vi.mock('@/shared/config/env', () => ({
  oauthUrl: (provider: string) => `https://api.example.com/auth/oauth/${provider}`,
}));

describe('AuthSocial', () => {
  let hrefSetter: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    hrefSetter = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, set href(v: string) { hrefSetter(v); } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders 3 social buttons', () => {
    render(<AuthSocial />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(3);
  });

  it('all buttons are enabled', () => {
    render(<AuthSocial />);
    const buttons = screen.getAllByRole('button') as HTMLButtonElement[];
    buttons.forEach((btn) => expect(btn.disabled).toBe(false));
  });

  it('clicking GitHub sets window.location.href to the GitHub OAuth URL', () => {
    render(<AuthSocial />);
    const githubBtn = screen.getByRole('button', { name: /github/i });
    fireEvent.click(githubBtn);
    expect(hrefSetter).toHaveBeenCalledWith('https://api.example.com/auth/oauth/github');
  });

  it('clicking Apple sets window.location.href to the Apple OAuth URL', () => {
    render(<AuthSocial />);
    const appleBtn = screen.getByRole('button', { name: /apple/i });
    fireEvent.click(appleBtn);
    expect(hrefSetter).toHaveBeenCalledWith('https://api.example.com/auth/oauth/apple');
  });

  it('clicking Google sets window.location.href to the Google OAuth URL', () => {
    render(<AuthSocial />);
    const googleBtn = screen.getByRole('button', { name: /google/i });
    fireEvent.click(googleBtn);
    expect(hrefSetter).toHaveBeenCalledWith('https://api.example.com/auth/oauth/google');
  });

  it('renders inline SVG elements for Apple and Google (no <img> tags)', () => {
    const { container } = render(<AuthSocial />);
    const imgs = container.querySelectorAll('img');
    expect(imgs).toHaveLength(0);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(2);
  });
});
