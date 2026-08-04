# Tasks: auth-login-redirect

## Completed

- [x] **T-1** — Create `.env.local` with `NEXT_PUBLIC_API_URL=http://localhost:3000`
- [x] **T-2** — Fix cookie name in `middleware.ts`: `'refreshToken'` → `'refresh_token'`
- [x] **T-3** — Fix sidebar href resolution in `sidebar.tsx`: extract locale from pathname, substitute into nav item hrefs before passing to `<NavItem>`
- [x] **T-4** — Improve active detection in `sidebar.tsx`: `pathname.includes(...)` → `pathname.startsWith(resolvedHref)`
