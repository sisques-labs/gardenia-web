# Spec: auth-login-redirect

## Requirements

### R-1 — API calls reach NestJS
All HTTP requests from the browser must be sent to the NestJS API URL defined by `NEXT_PUBLIC_API_URL`. If the env var is absent during local development, a `.env.local` file must define it pointing to `http://localhost:3000`.

### R-2 — Middleware detects authenticated session
After a successful login the middleware must recognise the `refresh_token` cookie and allow access to protected routes without redirecting to login.

### R-3 — Sidebar links navigate to correct locale paths
Every nav item in the sidebar must resolve its href using the active locale extracted from the current pathname. The literal string `[lang]` must never appear in a rendered `<Link href>`.

## Acceptance Scenarios

**S-1**: User submits valid credentials → browser navigates to `/${locale}/home` → home screen renders.

**S-2**: User submits valid credentials, URL had `?returnUrl=/spaces` → browser navigates to `/${locale}/spaces`.

**S-3**: Sidebar "Home" link → navigates to `/${locale}/home` (no Next.js dynamic href error).

**S-4**: Sidebar "Spaces" link → navigates to `/${locale}/spaces`.

**S-5**: Unauthenticated user visits `/${locale}/home` → redirected to `/${locale}/login?returnUrl=/home`.
