# Proposal: auth-login-redirect

## Intent

Post-login redirect was broken: after a successful login the user stayed on the login page or landed on a 404. Three separate bugs compounded to produce this result.

## Root Cause Analysis

### Bug 1 — Wrong API base URL (axios client)
`axios.client.ts` fell back to `http://localhost:3001` (the Next.js dev server) when `NEXT_PUBLIC_API_URL` was not set. Every API call was hitting Next.js instead of NestJS, which then triggered middleware redirects.

### Bug 2 — Cookie name mismatch (middleware)
`middleware.ts` looked for a cookie named `refreshToken` (camelCase). The API sets `refresh_token` (snake_case). The middleware never found it, treating every request as unauthenticated.

### Bug 3 — Nav href with literal `[lang]` placeholder (sidebar)
`nav-items.ts` stored hrefs as `/[lang]/home` and `/[lang]/spaces`. Next.js App Router rejects dynamic-looking hrefs in `<Link>`, crashing the protected layout before it rendered.

## Scope

- `middleware.ts` — cookie name fix
- `src/shared/presentation/components/sidebar/sidebar.tsx` — resolve locale from pathname before passing hrefs to NavItem
- `.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:3000` (not committed; developer setup)

## Out of Scope

Cookie path change is tracked in `gardenia-api` → `auth-cookie-path` change.
