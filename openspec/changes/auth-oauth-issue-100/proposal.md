# Proposal: OAuth Login + Auth-Refresh Redirect (Issue #100)

## Intent

The API now exposes OAuth endpoints (Google/GitHub/Apple), stricter cookie attributes, and returns 401 from `/auth/refresh` when the session is dead. The web currently ships 3 DISABLED social buttons, has no `/auth/callback` route, no `?error=oauth_failed` handling, and on refresh-401 it only calls `clearAuth()` without redirecting. We must wire OAuth end-to-end and make a dead session land the user on `/login`.

## Scope

### In Scope
- Enable the 3 `AuthSocial` buttons to initiate OAuth via direct navigation to the real API URL
- New `/auth/callback` client route that finalizes the OAuth session and routes the user onward
- `?error=oauth_failed` handling on the login screen with an i18n error banner
- Redirect to `/login` when `/auth/refresh` returns 401 (axios interceptor + Apollo `onErrorLink`)
- New env var for the real (non-proxy) API origin used by OAuth initiation
- Update `AuthSocial` tests (currently assert buttons disabled)

### Out of Scope
- "Logout all sessions" UI (API exists, not required by Issue #100)
- OAuth account linking / unlinking management screens
- Server-side session cookie rework (owned by API)
- New OAuth providers beyond Google/GitHub/Apple

## Capabilities

### New Capabilities
- `oauth-login`: OAuth initiation (provider buttons), `/auth/callback` finalization route, `?error=oauth_failed` handling, and refresh-401 redirect-to-login behavior across axios + Apollo.

### Modified Capabilities
- `auth-ui`: The `AuthSocial` requirement changes from "MUST NOT trigger any auth action" to "MUST initiate OAuth on click". Login Screen requirement gains the `?error=oauth_failed` banner scenario.

## Approach

- **OAuth initiation**: `AuthSocial` buttons call `window.location.href = ${OAUTH_API_ORIGIN}/auth/oauth/${provider}`. MUST bypass the Next.js `/api` proxy (proxy uses `redirect:'manual'`, so 302s silently fail through route handlers).
- **Callback route**: `app/[lang]/(auth)/callback/page.tsx` as `'use client'` + `dynamic = 'force-dynamic'`. Reuses the boot/refresh path (`refreshTokenOnce` + `me`) to hydrate the in-memory store, then redirects to returnUrl or home.
- **Error handling**: `LoginScreen` reads `?error=oauth_failed` (already inside Suspense) and renders an i18n banner; add `oauthFailed` key to auth `en.ts`/`es.ts`.
- **Refresh-401 redirect**: In the shared 401 path, when the refresh request itself returns 401, `clearAuth()` then redirect to `/login` (via `window.location.replace` or a Zustand `redirectToLogin` action). Same fix mirrored in axios interceptor and Apollo `onErrorLink`.
- **Env strategy**: Add `NEXT_PUBLIC_OAUTH_API_ORIGIN` (real API origin) in `src/shared/config/env.ts`, distinct from `NEXT_PUBLIC_API_URL` (defaults to `/api` proxy).

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/core/auth/presentation/components/auth-social/auth-social.tsx` | Modified | Enable buttons, add OAuth onClick |
| `app/[lang]/(auth)/callback/page.tsx` | New | OAuth finalization route |
| `src/core/auth/presentation/screens/login/login.screen.tsx` | Modified | `?error=oauth_failed` banner |
| `src/shared/infrastructure/http/axios.client.ts` | Modified | Refresh-401 → redirect |
| `src/shared/infrastructure/http/apollo.client.ts` | Modified | Refresh-401 → redirect |
| `src/shared/config/env.ts` | Modified | `NEXT_PUBLIC_OAUTH_API_ORIGIN` |
| `src/core/auth/presentation/i18n/en.ts` + `es.ts` | Modified | `oauthFailed` key |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| OAuth initiation routed through `/api` proxy → 302 silently dropped | High | Use `NEXT_PUBLIC_OAUTH_API_ORIGIN` (real API), direct `window.location.href`, never fetch/axios |
| Redirect-from-interceptor loop (redirect on the `/login` page itself) | Med | Guard: skip redirect when already on `/login`; only redirect when refresh path returns 401 |
| Callback hydration race with `useBootAuth` double-refresh | Med | Reuse existing module-level `refreshTokenOnce` mutex; do not bypass it |
| `AuthSocial` tests assert disabled buttons | High | Update tests as part of the change (TDD: rewrite RED then GREEN) |
| Missing `NEXT_PUBLIC_OAUTH_API_ORIGIN` at runtime | Med | Fallback/validation in `env.ts`; document required env var |

## Rollback Plan

Revert is low-risk: re-disable `AuthSocial` buttons, remove the callback route, and revert the interceptor redirect blocks. OAuth is purely additive on the web side; the API endpoints remain untouched. No data migration involved.

## Dependencies

- API OAuth endpoints (`/auth/oauth/{provider}`, callback redirect to FRONTEND_URL) deployed and reachable
- `NEXT_PUBLIC_OAUTH_API_ORIGIN` configured in each environment

## Success Criteria

- [ ] Clicking a social button navigates to the API OAuth endpoint (not the proxy)
- [ ] Successful OAuth lands on `/auth/callback`, hydrates the session, and routes onward
- [ ] OAuth failure redirects to `/login?error=oauth_failed` and shows an i18n banner
- [ ] `/auth/refresh` returning 401 redirects the user to `/login` (axios + Apollo)
- [ ] `AuthSocial` tests updated and green; `pnpm test`, `pnpm tsc --noEmit`, `pnpm build` pass
