import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ──────────────────────────────────────────────
// T4: redirectToLogin action tests
// ──────────────────────────────────────────────

describe('useAuthStore — redirectToLogin', () => {
  let originalLocation: Location;
  let replaceSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    // Reset the store module to get a fresh instance
    vi.resetModules();

    // Stub window.location — jsdom does not allow direct assignment
    originalLocation = window.location;
    replaceSpy = vi.fn();

    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: {
        ...originalLocation,
        replace: replaceSpy,
        pathname: '/',
        href: '/',
        search: '',
        hash: '',
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      writable: true,
      value: originalLocation,
    });
  });

  it('does NOT call replace when pathname includes /login (loop guard)', async () => {
    window.location.pathname = '/es/login';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('does NOT call replace when pathname is exactly /login', async () => {
    window.location.pathname = '/login';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('calls replace with /es/login when pathname is /es/home', async () => {
    window.location.pathname = '/es/home';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).toHaveBeenCalledOnce();
    expect(replaceSpy).toHaveBeenCalledWith('/es/login');
  });

  it('calls replace with /en/login when pathname is /en/dashboard', async () => {
    window.location.pathname = '/en/dashboard';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).toHaveBeenCalledOnce();
    expect(replaceSpy).toHaveBeenCalledWith('/en/login');
  });

  it('falls back to /login when there is no locale prefix in the pathname', async () => {
    window.location.pathname = '/dashboard/plants';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).toHaveBeenCalledOnce();
    expect(replaceSpy).toHaveBeenCalledWith('/login');
  });

  it('falls back to /login when pathname is /', async () => {
    window.location.pathname = '/';

    const { useAuthStore } = await import('./auth.store');
    useAuthStore.getState().redirectToLogin();

    expect(replaceSpy).toHaveBeenCalledOnce();
    expect(replaceSpy).toHaveBeenCalledWith('/login');
  });
});
