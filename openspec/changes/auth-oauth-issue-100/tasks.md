# Tasks: OAuth Login + Auth-Refresh Redirect (Issue #100)

## Review Workload Forecast

| Metric | Value |
|--------|-------|
| Estimated changed lines | ~420–480 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Decision needed before apply | Yes |

**Rationale**: 8 production files + 6 test files across two orthogonal concerns (auth-refresh redirect fix vs. OAuth feature). PR1 is a pure bug fix (no UI); PR2 is additive (no existing logic touched). They are independently mergeable.

---

## PR Slicing

### PR1 — Auth-Refresh Redirect Fix (bug fix, ~150–180 lines)

Scope: env config, store action, interceptor wiring, tests for all three.
Risk: zero — existing behavior extended, no UI.

### PR2 — OAuth Login Feature (additive, ~270–300 lines)

Scope: AuthSocial buttons, callback page, login error banner, i18n.
Risk: low — new file + modifications to existing auth UI only.

---

## PR1 — Auth-Refresh Redirect Fix

### Phase 1-A: Foundation (sequential — env + store must precede interceptors)

- [x] **T1** — `src/shared/config/env.ts`: Add `OAUTH_API_ORIGIN` const, `OAuthProvider` type, and `oauthUrl(provider)` helper. Throw explicit error when env var is missing.
  _Satisfies: R1.6, AD-5, Spec §3.1_

- [x] **T2** — `src/core/auth/infrastructure/store/auth.store.ts`: Add `redirectToLogin()` action to `AuthState` interface and store implementation. Guard: no-op on SSR, no-op when `pathname.includes('/login')`. Locale-aware target via regex fallback to `/login`.
  _Satisfies: R2.2, R2.3, AD-3, Spec §3.2_

### Phase 1-B: Tests for foundation (RED before implementation)

> Run tests — they MUST fail before T1/T2 are implemented.

- [x] **T3** — `src/shared/config/env.spec.ts` (NEW): Write tests for `oauthUrl`.
  - Returns correct URL when `OAUTH_API_ORIGIN` is set.
  - Throws when `OAUTH_API_ORIGIN` is empty.
  _Satisfies: CC1, R1.6_

- [x] **T4** — `src/core/auth/infrastructure/store/auth.store.spec.ts` (NEW or EXTEND): Write tests for `redirectToLogin`.
  - No-op when `pathname` includes `/login`.
  - Calls `window.location.replace('/es/login')` for `/es/home` (locale prefix preserved).
  - Falls back to `/login` when no locale prefix.
  _Satisfies: CC1, R2.2, R2.3, Spec §4.2_

> Implement T1, T2 → tests turn GREEN.

### Phase 1-C: Interceptors (depends on T1, T2)

- [x] **T5** — `src/shared/infrastructure/http/axios.client.ts`: In the 401 response interceptor, add `useAuthStore.getState().redirectToLogin()` after `clearAuth()` in both the `/auth/refresh`-path branch and the null-token branch.
  _Satisfies: R2.2, R2.3, Spec §3.3_

- [x] **T6** — `src/shared/infrastructure/http/apollo.client.ts`: In `onErrorLink` refresh-failure branch, add `useAuthStore.getState().redirectToLogin()` after `clearAuth()`.
  _Satisfies: R2.2, R2.3, Spec §3.4_

### Phase 1-D: Interceptor tests (RED before T5/T6 are complete)

> Write tests, see them fail, then implement T5/T6, then green.

- [x] **T7** — `src/shared/infrastructure/http/axios.client.spec.ts` (NEW): Cover 401 interceptor branches.
  - `/auth/refresh` 401 → `clearAuth` + `redirectToLogin` called; promise rejects.
  - Non-auth 401, refresh resolves → retry, `redirectToLogin` NOT called.
  - Non-auth 401, refresh null → `clearAuth` + `redirectToLogin` called.
  - `_retry` already set → pass-through.
  _Satisfies: CC1, R2.2, R2.3, Spec §4.4_

- [x] **T8** — `src/shared/infrastructure/http/apollo.client.spec.ts` (EXTEND): Add `redirectToLogin: vi.fn()` to `mockAuthStore`.
  - Refresh null → `redirectToLogin` called once.
  - Happy retry path → `redirectToLogin` NOT called.
  _Satisfies: CC1, R2.2, R2.3, Spec §4.3_

---

## PR2 — OAuth Login Feature

> Depends on PR1 merged (needs `oauthUrl` from `env.ts`). Can be developed in a branch off PR1's branch.

### Phase 2-A: i18n (no dependencies — can start in parallel with 2-B)

- [ ] **T9** — `src/core/auth/presentation/i18n/en.ts`: Add `login.oauthFailed` and `callback.finishing` keys.
  _Satisfies: R3.1, CC2, Spec §3.8_

- [ ] **T10** — `src/core/auth/presentation/i18n/es.ts`: Add same keys in Rioplatense Spanish. TypeScript `satisfies AuthDictTranslated` enforces parity.
  _Satisfies: R3.1, CC2, Spec §3.8_

### Phase 2-B: AuthSocial component (RED → GREEN)

- [ ] **T11** — `src/core/auth/presentation/components/auth-social/auth-social.spec.tsx` (REWRITE — RED): Update existing tests.
  - DELETE `all buttons are disabled` assertion.
  - KEEP `renders 3 social buttons`.
  - ADD: each button is enabled (`btn.disabled === false`).
  - ADD: clicking GitHub/Apple/Google sets `window.location.href` to the correct OAuth URL (mock `oauthUrl`, spy on `window.location.href`).
  _Satisfies: CC1, R1.1, R2.1, Spec §4.1_

- [ ] **T12** — `src/core/auth/presentation/components/auth-social/auth-social.tsx` (MODIFY — GREEN): Add `'use client'`. Remove `disabled` + `cursor: not-allowed` styling. Add `onClick={() => startOAuth(provider)}` per button using `oauthUrl`.
  _Satisfies: R1.1, R2.1, Spec §3.5_

### Phase 2-C: Callback page (RED → GREEN)

- [ ] **T13** — `app/[lang]/(auth)/callback/page.spec.tsx` (NEW — RED): Write tests with mocked `next/navigation`, `refreshTokenOnce`, `doRefresh`, `MeUseCase.me`.
  - Token + `me()` resolve → `router.replace` called with `returnUrl`.
  - Token + no `returnUrl` → `router.replace('/{lang}/home')`.
  - `refreshTokenOnce` null → `router.replace('/{lang}/login?error=oauth_failed')`.
  - `me()` rejects → same error redirect.
  - StrictMode double-mount → `router.replace` called exactly once.
  _Satisfies: CC1, R1.2, R1.3, R1.4, Spec §4.5_

- [ ] **T14** — `app/[lang]/(auth)/callback/page.tsx` (NEW — GREEN): Implement `CallbackPage` as `'use client'` + `force-dynamic`. `CallbackInner` uses `useEffect` with `ran` ref guard, calls `refreshTokenOnce(doRefresh)` → `meService.me()` → `router.replace(returnUrl ?? /{lang}/home)`, catches to error redirect.
  _Satisfies: R1.2, R1.3, R1.4, AD-4, Spec §3.6_

### Phase 2-D: Login error banner (RED → GREEN)

- [ ] **T15** — `src/core/auth/presentation/screens/login/login.screen.spec.tsx` (EXTEND — RED): Add assertions.
  - With `?error=oauth_failed` → `role="alert"` banner renders with `oauthFailed` text.
  - Without `?error` → banner absent.
  _Satisfies: CC1, R1.5, Spec §4.6_

- [ ] **T16** — `src/core/auth/presentation/screens/login/login.screen.tsx` (MODIFY — GREEN): Read `searchParams.get('error') === 'oauth_failed'`. Render `<div role="alert">{dict.oauthFailed}</div>` inside the existing `Suspense` boundary when true.
  _Satisfies: R1.5, Spec §3.7_

---

## Task Order Summary

```
PR1 (sequential within):
  T3, T4  (RED: write tests)
    → T1, T2  (GREEN: implement)
      → T7, T8  (RED: write tests)
        → T5, T6  (GREEN: implement)

PR2 (after PR1, parallel within):
  T9, T10  (i18n — parallel with everything else in PR2)
  T11  (RED) → T12  (GREEN)
  T13  (RED) → T14  (GREEN)
  T15  (RED) → T16  (GREEN)
```

---

## Parallelism Notes

- T3 and T4 can run in parallel (different files, no dependency).
- T9 and T10 can run in parallel with T11–T16 (i18n only, no logic dependency).
- T11/T13/T15 (RED tests) can be written in parallel once i18n is in place.
- T12, T14, T16 (GREEN implementations) each depend only on their own RED test.
- T5 and T6 (interceptors) can be implemented in parallel once T1 and T2 are done.

---

## Total Task Count

| PR | Tasks | Type |
|----|-------|------|
| PR1 | T1–T8 (8 tasks) | Bug fix — auth-refresh redirect |
| PR2 | T9–T16 (8 tasks) | Feature — OAuth login |
| Total | 16 tasks | — |
