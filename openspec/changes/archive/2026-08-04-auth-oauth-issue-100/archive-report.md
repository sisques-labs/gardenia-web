# Archive Report: auth-oauth-issue-100

**Change**: auth-oauth-issue-100
**Archived**: 2026-08-04
**Status**: COMPLETE — both PRs implemented and verified in code

---

## Summary

OAuth login (Google/GitHub/Apple) plus an auth-refresh redirect fix, split into two independently mergeable PRs. Both are fully implemented on `main`, but the change folder was left in `proposal` state with PR2's tasks unchecked. This archive corrects the bookkeeping — no code changes were made.

## Verification

| PR | Scope | Status |
|----|-------|--------|
| PR1 | Auth-refresh redirect (`env.ts` oauthUrl/OAUTH_API_ORIGIN, `auth.store.ts` redirectToLogin, wired into `axios.client.ts` + `apollo.client.ts`) | ✅ Confirmed in code (T1–T8 already `[x]`) |
| PR2 | OAuth login feature (i18n keys, enabled `AuthSocial` buttons with real `onClick` handlers, `app/[lang]/(auth)/callback/page.tsx`, `oauthFailed` banner on login screen) | ✅ Confirmed in code — T9–T16 checked off in this archive |

Verified by reading source directly:
- `src/shared/config/env.ts` — `oauthUrl`, `OAUTH_API_ORIGIN`, `OAuthProvider` present
- `src/core/auth/presentation/components/auth-social/auth-social.tsx` — buttons enabled, `startOAuth` onClick wired to `oauthUrl`
- `app/[lang]/(auth)/callback/page.tsx` — implements the callback flow (uses `redirect()` from `next/navigation` rather than `router.replace()` as originally described in T14; behavior — redirect to `returnUrl`/home on success, `?error=oauth_failed` on failure — matches spec and is covered by `page.spec.tsx`)
- `src/core/auth/presentation/screens/login/login.screen.tsx` — `oauthFailed` banner rendered on `?error=oauth_failed`
- `src/core/auth/presentation/i18n/en.ts` / `es.ts` — `login.oauthFailed` and `callback.finishing` keys present in both locales

## Note

Minor implementation deviation from the tasks doc: T14 describes `router.replace`, actual code uses the imperative `redirect()` API from `next/navigation`. Functionally equivalent (both produce a client-side redirect to the same destinations) and fully covered by tests — not treated as a gap.
