# Design: OAuth Login + Auth-Refresh Redirect (Issue #100)

## 1. Architecture Overview

This change is **additive** and stays within the existing Clean/Hexagonal layering of `src/core/auth`. It introduces no new domain models, no new repository ports, and no new use cases. OAuth is a *browser navigation flow* owned entirely by the API; the web's job is only to (a) **initiate** it via a full-page navigation, (b) **finalize** it by reusing the already-proven boot/refresh path, and (c) **react** to a dead session (refresh-401) by sending the user to `/login`.

The guiding principle: **do not invent new infrastructure where the existing boot path already does the job.** The OAuth callback is just "boot auth, but triggered by a redirect instead of an app mount". We reuse `refreshTokenOnce(doRefresh)` + `MeUseCase.me()` verbatim. This keeps the refresh-dedup mutex authoritative and avoids a second, divergent session-hydration code path.

### Data flow — OAuth happy path

```
[Login page]
  user clicks "Google"
      │  window.location.href = `${OAUTH_API_ORIGIN}/auth/oauth/google`
      ▼
[API] /auth/oauth/google  ──302──▶  Google consent  ──302──▶  [API] /auth/oauth/google/callback
      │  API sets httpOnly refresh cookie, then 302 → ${FRONTEND_URL}/{lang}/callback
      ▼
[/{lang}/callback page]  ('use client', force-dynamic)
      │  refreshTokenOnce(doRefresh)   → POST /auth/refresh → accessToken in Zustand
      │  meService.me()                → currentUser in Zustand
      ▼
  success → router.replace(returnUrl ?? `/{lang}/home`)
  failure → router.replace(`/{lang}/login?error=oauth_failed`)
```

### Data flow — refresh-401 (dead session)

```
[any authed request 401] → interceptor/onErrorLink
      │  refreshTokenOnce(doRefresh) → POST /auth/refresh
      │      returns 401  → doRefresh throws → refreshTokenOnce resolves null
      ▼
  clearAuth()  +  redirectToLogin()   (guarded: skip if already on /login)
```

### Integration points (unchanged contracts)

| Boundary | Reused as-is |
|----------|--------------|
| `refreshTokenOnce` mutex | Single source of refresh dedup across axios + Apollo + boot + callback |
| `doRefresh()` | The only function that hits `POST /auth/refresh` and writes the token |
| `MeUseCase` / `authHttpRepository.me()` | Hydrates `currentUser` |
| Zustand `useAuthStore` | The only token store (in-memory, no persistence) |
| `/api` proxy | Untouched — OAuth deliberately bypasses it |

---

## 2. Architecture Decisions

### AD-1 — OAuth initiation: `window.location.href`, never fetch/axios

**Decision.** `AuthSocial` buttons set `window.location.href = `${OAUTH_API_ORIGIN}/auth/oauth/${provider}`` — a full-page browser navigation to the **real API origin**, not the `/api` proxy.

**Why not fetch/axios through `/api`.** The proxy (`src/shared/infrastructure/http/proxy.ts`) calls upstream `fetch(..., { redirect: 'manual' })`. With `redirect: 'manual'` the 302 is returned as an opaque-ish response and re-emitted by the route handler, but the *browser never follows it* because the navigation originated from a `fetch`, not a top-level navigation. The OAuth handshake is a chain of cross-origin 302s (API → Google → API callback → FRONTEND_URL) that **only works as a top-level document navigation**. Any XHR/fetch approach silently dies on the first redirect. Therefore the browser itself must own the navigation, and it must target the API origin directly so the API can set its httpOnly cookies on its own domain.

**Consequence.** We need a second env var (`OAUTH_API_ORIGIN`) that points at the *real* API, distinct from `API_URL` (which defaults to the `/api` proxy). See AD-5.

### AD-2 — Callback route placement: `app/[lang]/(auth)/callback/page.tsx` (inside the `(auth)` group)

**Decision.** Place the callback **inside** the `(auth)` route group, so it inherits `app/[lang]/(auth)/layout.tsx` (the `AuthDesktopShell` + `AuthMobileShell` brand frame).

**Why inside vs. outside.**
- Inside `(auth)`: the brief "Finishing sign-in…" spinner renders inside the same branded auth frame the user just came from (login screen). Visually continuous, zero new layout code, and on failure we redirect to `/login` which is the *sibling* route — same shell, no flash of a different chrome.
- Outside `(auth)` (e.g. a bare `app/[lang]/callback/page.tsx`): would render with the root layout only, producing an unbranded blank page mid-flow, then a second shell swap when redirecting to `/login`. More jank, no upside.

The callback page is transient (it always `router.replace`s within ~1 network round-trip), so inheriting the auth shell is the lowest-friction, most consistent choice.

**Why `'use client'` + `export const dynamic = 'force-dynamic'`.** The callback must run on the client: it reads `useSearchParams()` / `window.location` for an optional `returnUrl`, mutates the in-memory Zustand store, and calls `router.replace`. `force-dynamic` prevents Next from attempting any static optimization of a route whose entire purpose is a runtime side effect. It must be wrapped in `<Suspense>` (like the login page) because it uses `useSearchParams()`.

### AD-3 — Redirect-from-interceptor: Zustand `redirectToLogin` action over inline `window.location.replace`

**Decision.** Add a single shared redirect helper exposed as a store action: `useAuthStore.getState().redirectToLogin()`. Both the axios interceptor and the Apollo `onErrorLink` call `clearAuth()` then `redirectToLogin()` on a refresh-401.

**Why an action vs. inline `window.location.replace('/login')` at each call site.**
1. **Single guard, one place.** The redirect must be guarded against firing when the user is *already on a login page* (otherwise a 401 on the login screen's own background queries would loop-redirect). Centralizing the guard (`if (path startsWith /login) return;`) avoids duplicating it in two interceptors that will inevitably drift.
2. **Testability.** A store action is trivially mockable in the existing Apollo spec (which already mocks `useAuthStore.getState`). Asserting `redirectToLogin` was/was-not called is cleaner than stubbing `window.location`.
3. **Layer hygiene.** The HTTP infrastructure shouldn't hardcode a route string and a browser API; it delegates "where does a dead session go" to the auth store, which owns session lifecycle.

**Guard condition (inside the action).**
```ts
redirectToLogin: () => {
  if (typeof window === 'undefined') return;            // SSR-safe no-op
  const { pathname } = window.location;
  if (/\/login(\/|$|\?)/.test(pathname) || pathname.includes('/login')) return; // already there
  window.location.replace(`${pathname.match(/^\/[a-z]{2}\b/)?.[0] ?? ''}/login` || '/login');
}
```
The locale prefix is preserved by reading the leading `/{lang}` segment from the current path; if absent we fall back to `/login`. The action is a no-op on the server and a no-op when already on a login route — this neutralizes both the redirect-loop risk and any SSR crash.

**Why `replace` not `href`/`push`.** A dead-session redirect should not leave the failed page in history; `replace` prevents the user from "back"-ing into a broken authed page.

### AD-4 — Token storage in callback: `useAuthStore.getState().setAccessToken` via `doRefresh`, no new use case

**Decision.** The callback does **not** introduce a dedicated `FinalizeOAuthUseCase`. It calls the existing `refreshTokenOnce(doRefresh)` (which internally calls `setAccessToken`) and `meService.me()`. No new application-layer code.

**Why minimal.** There is *nothing new to model*. OAuth finalization is byte-for-byte identical to boot: "given a fresh httpOnly refresh cookie, exchange it for an access token and load the user." `useBootAuth` already does exactly this. Adding a use case would (a) duplicate `doRefresh` + `me` orchestration, (b) create a second hydration path that can drift from boot, and (c) risk bypassing the `refreshTokenOnce` mutex — the exact race the proposal flags as a Medium risk. The correct abstraction *already exists*; the callback consumes it. A use case here would be ceremony, not architecture.

**The one allowed shortcut.** The callback may read `useAuthStore.getState()` directly (not via a React selector) because it runs an imperative effect, mirroring how `doRefresh` and the interceptors already access the store. This is consistent with the existing infrastructure convention.

### AD-5 — `OAUTH_API_ORIGIN` env var

**Declared.** In `src/shared/config/env.ts`, alongside the existing `API_URL` / `GRAPHQL_URL` exports.

```ts
export const OAUTH_API_ORIGIN = process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN ?? '';
```

**Typed.** As `string` (module-level `const`, inferred). Because Next inlines `NEXT_PUBLIC_*` at build time, it is available in client bundles.

**Validated.** Lightweight, fail-loud-at-use validation rather than a heavy schema (the codebase has no env-schema layer today — keep it consistent). Provide a helper that the buttons call:

```ts
export function oauthUrl(provider: 'google' | 'github' | 'apple'): string {
  if (!OAUTH_API_ORIGIN) {
    throw new Error(
      '[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set — OAuth initiation requires the real API origin (not the /api proxy).',
    );
  }
  return `${OAUTH_API_ORIGIN}/auth/oauth/${provider}`;
}
```

**If missing in dev.** `OAUTH_API_ORIGIN` is `''`; clicking a social button throws the explicit error above (visible in console) instead of navigating to a malformed `/auth/oauth/google` relative URL that would hit Next and 404 confusingly. Password login and the rest of the app are unaffected. Document the var in the repo's env example/README as a required value per environment.

---

## 3. File-Level Design

### 3.1 `src/shared/config/env.ts` — MODIFIED

Add the OAuth origin and the URL builder.

```ts
export const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? '/graphql';
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? '/api';
export const OAUTH_API_ORIGIN = process.env.NEXT_PUBLIC_OAUTH_API_ORIGIN ?? '';

export type OAuthProvider = 'google' | 'github' | 'apple';

export function oauthUrl(provider: OAuthProvider): string {
  if (!OAUTH_API_ORIGIN) {
    throw new Error(
      '[env] NEXT_PUBLIC_OAUTH_API_ORIGIN is not set — OAuth initiation requires the real API origin (not the /api proxy).',
    );
  }
  return `${OAUTH_API_ORIGIN}/auth/oauth/${provider}`;
}
```

### 3.2 `src/core/auth/infrastructure/store/auth.store.ts` — MODIFIED

Add the `redirectToLogin` action to the `AuthState` interface and the store. Guarded, SSR-safe, no-op on a login route.

```ts
interface AuthState {
  // ...existing fields...
  redirectToLogin: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  // ...existing...
  redirectToLogin: () => {
    if (typeof window === 'undefined') return;
    const { pathname } = window.location;
    if (pathname.includes('/login')) return;            // already on a login route → no loop
    const localePrefix = pathname.match(/^\/[a-z]{2}(?=\/|$)/)?.[0] ?? '';
    window.location.replace(`${localePrefix}/login`);
  },
}));
```

> Note: `redirectToLogin` has no setter dependency, but the existing `set`-based factory signature is preserved. Because it touches `window`, unit tests assert behavior via a mocked/stubbed `window.location`.

### 3.3 `src/shared/infrastructure/http/axios.client.ts` — MODIFIED

In the response interceptor, the refresh-401 branch currently calls `clearAuth()` only. Add the redirect. Two places see a dead session: (a) the explicit `/auth/refresh` 401 branch, and (b) the `refreshTokenOnce` returns-null branch.

```ts
// (a) refresh path itself returned 401
if (path.endsWith('/auth/refresh')) {
  useAuthStore.getState().clearAuth();
  useAuthStore.getState().redirectToLogin();   // NEW
  return Promise.reject(error);
}
// ...
// (b) refresh produced no token
const newToken = await refreshTokenOnce(doRefresh);
if (!newToken) {
  useAuthStore.getState().clearAuth();
  useAuthStore.getState().redirectToLogin();   // NEW
  return Promise.reject(error);
}
```

No change to `doRefresh`, `bareHttp`, request interceptor, or skip lists.

### 3.4 `src/shared/infrastructure/http/apollo.client.ts` — MODIFIED

In `onErrorLink`, the refresh-failure branch currently calls `clearAuth()` only. Add the redirect immediately after.

```ts
.then((token) => {
  if (!token) {
    useAuthStore.getState().clearAuth();
    useAuthStore.getState().redirectToLogin();   // NEW
    observer.error(error);
    return;
  }
  // ...retry path unchanged...
})
```

No change to `authLink`, `spaceLink`, link order, or `isUnauthorizedError`.

### 3.5 `src/core/auth/presentation/components/auth-social/auth-social.tsx` — MODIFIED

Enable the buttons and wire OAuth initiation. No new props required for the minimal version (provider→URL is derived from `oauthUrl`). The component becomes a client component (it has an onClick).

**Signature:** `export function AuthSocial(): JSX.Element` — unchanged public API.

Changes:
- Add `'use client'` at the top (it now has interactivity).
- Replace the shared `socialButtonStyle` `cursor: 'not-allowed'` / `opacity: 0.6` with enabled styling (`cursor: 'pointer'`, full opacity).
- Each button: remove `disabled`, add `onClick={() => { window.location.href = oauthUrl(provider); }}` with `provider` being `'github' | 'apple' | 'google'` respectively.
- Each button gets a stable `aria-label`/identifiable accessible name (e.g. existing visible text "GitHub"/"Apple"/"Google") so tests can target by name.

```tsx
'use client';
import { oauthUrl, type OAuthProvider } from '@/shared/config/env';

function startOAuth(provider: OAuthProvider) {
  window.location.href = oauthUrl(provider);
}
// each button:
<button type="button" style={socialButtonStyle} onClick={() => startOAuth('github')}>
  <GitHubIcon /> GitHub
</button>
```

> Optional (not required): accept an injected `onProvider?: (p: OAuthProvider) => void` prop to make `window.location` side effect testable without stubbing globals. Decision: **skip the prop**; tests stub `oauthUrl`/`window.location.href` directly, keeping the component API flat. Revisit only if the test proves brittle.

### 3.6 `app/[lang]/(auth)/callback/page.tsx` — NEW

The OAuth finalization route. Client component, force-dynamic, Suspense-wrapped.

```tsx
'use client';
export const dynamic = 'force-dynamic';

import { Suspense, useEffect, useRef } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { refreshTokenOnce } from '@/core/auth/infrastructure/http/refresh-mutex';
import { doRefresh } from '@/shared/infrastructure/http/axios.client';
import { MeUseCase } from '@/core/auth/application/use-cases/me/me.use-case';
import { authHttpRepository } from '@/core/auth/infrastructure/repositories/auth-http.repository';

const meService = new MeUseCase(authHttpRepository);

function CallbackInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const ran = useRef(false);                       // guard StrictMode double-effect

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    const lang = (params.lang as string) ?? '';
    const returnUrl = searchParams.get('returnUrl') ?? `/${lang}/home`;
    const errorRedirect = `/${lang}/login?error=oauth_failed`;

    refreshTokenOnce(doRefresh)
      .then((token) => (token ? meService.me() : Promise.reject(new Error('no-token'))))
      .then(() => router.replace(returnUrl))
      .catch(() => router.replace(errorRedirect));
  }, [params, router, searchParams]);

  return <p role="status">Finishing sign-in…</p>;  // i18n key: callback.finishing
}

export default function CallbackPage() {
  return (
    <Suspense fallback={<p role="status">Finishing sign-in…</p>}>
      <CallbackInner />
    </Suspense>
  );
}
```

Notes:
- **Reuses `refreshTokenOnce(doRefresh)`** — the same mutex `useBootAuth` uses. If boot and callback ever race, the mutex deduplicates to a single `/auth/refresh`. This directly mitigates the "callback hydration race with `useBootAuth` double-refresh" risk.
- **`ran` ref** guards React StrictMode's double-invoke in dev (belt-and-suspenders; the mutex already protects the network call, but the ref prevents a double `router.replace`).
- **Failure handling**: a null token, a thrown `me()`, or a network error all funnel to `/login?error=oauth_failed`.
- The visible "Finishing sign-in…" string should come from the auth dict (`callback.finishing`) once i18n is wired; the page is async-locale-aware via `params.lang`. If passing the dict server-side is too heavy for a transient page, an inline localized fallback keyed off `params.lang` is acceptable — **decision: add `callback` i18n keys** (3.8) and resolve client-side from a tiny lookup, consistent with other auth screens receiving `dict`.

### 3.7 `src/core/auth/presentation/screens/login/login.screen.tsx` — MODIFIED

Read `?error=oauth_failed` from `searchParams` (already available) and render the existing alert banner styling with the new i18n string. `useSearchParams` is already wrapped in `<Suspense>` by the page — no page change needed.

```tsx
const oauthError = searchParams.get('error') === 'oauth_failed';
// ...
{oauthError && (
  <div role="alert" style={/* reuse existing alert style block */}>
    {dict.oauthFailed}
  </div>
)}
```

`dict` here is `AppDict['auth']['login']`, so the new key lives under `login.oauthFailed` (3.8). The banner reuses the existing alert `<div>` style block (factor the inline style object to a shared `const` if duplication is undesirable — minor).

### 3.8 i18n — `src/core/auth/presentation/i18n/en.ts` + `es.ts` — MODIFIED

Add `login.oauthFailed` and a small `callback` block.

`en.ts`:
```ts
login: { /* ...existing... */ oauthFailed: 'Social sign-in failed. Please try again.' },
callback: { finishing: 'Finishing sign-in…' },
```

`es.ts`:
```ts
login: { /* ...existing... */ oauthFailed: 'No se pudo iniciar sesión con el proveedor. Inténtalo de nuevo.' },
callback: { finishing: 'Finalizando inicio de sesión…' },
```

`es.ts` is `satisfies AuthDictTranslated` (derived from `en.ts`'s type), so adding the key to `en.ts` first makes the type require it in `es.ts` — TypeScript enforces parity at compile time. Add to `en.ts` first.

---

## 4. Test Design (Vitest, strict TDD — RED first)

### 4.1 `auth-social.spec.tsx` — REWRITE (currently asserts disabled)

The existing tests (`all buttons are disabled`) become RED and must be rewritten:
- DELETE `all buttons are disabled`.
- KEEP `renders 3 social buttons` and the inline-SVG assertion.
- ADD: each button is **enabled** (`btn.disabled === false`).
- ADD: clicking GitHub/Apple/Google navigates to the correct OAuth URL. Mock `@/shared/config/env`'s `oauthUrl` to return a deterministic string and assert `window.location.href` was set to it. Stub `window.location` with a setter spy (jsdom: redefine `href` via `Object.defineProperty` or assign a mock location), since jsdom does not perform real navigation.
- ADD (edge): when `oauthUrl` throws (missing env), clicking surfaces the error / does not crash the render — assert the thrown error path is reachable (optional, lower priority).

### 4.2 `auth.store.spec.ts` — NEW

Cover `redirectToLogin`:
- No-op when `window` is undefined (guard) — or skip if jsdom always defines window; instead assert it does nothing harmful.
- No-op when `window.location.pathname` includes `/login` (loop guard) → `replace` NOT called.
- On an authed path like `/es/home`, calls `window.location.replace('/es/login')` (locale prefix preserved).
- On a path without a locale prefix, falls back to `/login`.
Stub `window.location` (`pathname` getter + `replace` spy).

### 4.3 `apollo.client.spec.ts` — EXTEND

The spec already mocks `useAuthStore.getState`. Extend `mockAuthStore` to include a `redirectToLogin: vi.fn()` and:
- In `calls clearAuth and propagates error when refresh returns null`: ALSO assert `redirectToLogin` was called once.
- In the happy retry tests: assert `redirectToLogin` was **NOT** called.

### 4.4 `axios.client.spec.ts` — NEW (no axios spec exists today)

Add interceptor coverage mirroring the Apollo approach (mock the store, drive the response interceptor with a fake 401 error config):
- `/auth/refresh` 401 → `clearAuth` + `redirectToLogin` called; promise rejects.
- Non-auth path 401 → refresh succeeds → retry, `redirectToLogin` NOT called.
- Non-auth path 401 → refresh returns null → `clearAuth` + `redirectToLogin` called.
- `_retry` already set → passes through, no refresh.

### 4.5 `callback/page.spec.tsx` — NEW

Render `CallbackPage` with mocked `next/navigation` (`useRouter`, `useParams`, `useSearchParams`), mocked `refreshTokenOnce`, `doRefresh`, and `MeUseCase.me`:
- Token + `me()` resolve → `router.replace` called with `returnUrl` (or `/{lang}/home` default).
- `refreshTokenOnce` resolves null → `router.replace('/{lang}/login?error=oauth_failed')`.
- `me()` rejects → same error redirect.
- StrictMode double-mount → `router.replace` called once (ref guard).

### 4.6 `login.screen.spec.tsx` — EXTEND (if exists) / NEW assertion

- With `searchParams.error === 'oauth_failed'` → the `oauthFailed` banner (`role="alert"`) renders.
- Without it → banner absent.

---

## 5. ADRs

### ADR-1 — Reuse the boot/refresh path for OAuth finalization instead of a new use case

**Context.** OAuth finalization needs to exchange a fresh httpOnly refresh cookie for an access token and load the current user. `useBootAuth` already performs exactly this sequence via `refreshTokenOnce(doRefresh)` + `MeUseCase.me()`, guarded by a module-level refresh mutex.

**Decision.** The callback route consumes the existing `refreshTokenOnce`/`doRefresh`/`MeUseCase` primitives directly. No `FinalizeOAuthUseCase`, no new repository method.

**Consequences.**
- (+) Single hydration path → no drift, no second mutex, race with boot is deduped for free.
- (+) Zero new application/domain surface to test or maintain.
- (−) The callback page reaches into infrastructure (`doRefresh`, `refreshTokenOnce`) and instantiates `MeUseCase` inline — same pattern `useBootAuth` already uses, so it's a consistent, accepted leak, not a new one.

### ADR-2 — Centralize dead-session redirect as a guarded Zustand action

**Context.** Two HTTP layers (axios interceptor, Apollo `onErrorLink`) independently detect a refresh-401. The proposal flags a redirect-loop risk if we redirect while already on `/login`.

**Decision.** Expose `redirectToLogin()` on `useAuthStore`, containing the single loop guard and locale-aware target. Both layers call `clearAuth()` then `redirectToLogin()`.

**Alternatives rejected.**
- *Inline `window.location.replace('/login')` at each call site* — duplicates the guard across two files that will drift, hardcodes the route into infrastructure, and is harder to assert in tests.
- *`router.replace` from a React context* — interceptors run outside React render; no router available. A store action that uses `window.location` is the only reliable cross-cutting mechanism.

**Consequences.**
- (+) One guard, one route string, one mockable seam.
- (+) SSR-safe (no-op when `window` undefined).
- (−) Couples the store to `window.location` (browser API). Acceptable: the store already owns session lifecycle, and "dead session → go to login" is a session concern.

### ADR-3 — OAuth initiation bypasses the `/api` proxy via top-level navigation to a dedicated origin env var

**Context.** The `/api` proxy uses `fetch(redirect: 'manual')`, which cannot carry the multi-hop cross-origin 302 OAuth handshake. Cookies must be set on the API's own origin.

**Decision.** Add `NEXT_PUBLIC_OAUTH_API_ORIGIN`, build the URL via `oauthUrl(provider)`, and navigate with `window.location.href`. Never fetch/axios.

**Alternatives rejected.**
- *Route OAuth through `/api`* — 302 chain silently dies; cookies land on the wrong origin.
- *Reuse `API_URL`* — it defaults to the `/api` proxy; conflating the two would re-introduce the proxy bug in any env that relies on the default.

**Consequences.**
- (+) Correct, browser-native OAuth flow; cookies set by the API directly.
- (−) One more required env var per environment; fail-loud if unset (explicit thrown error rather than silent 404).

---

## 6. New / Residual Risks (surfaced during design)

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| `redirectToLogin` locale regex mis-parses non-standard paths (e.g. no lang prefix) | Low | Fallback to `/login`; covered by store unit test |
| Callback renders inside auth shell but `me()` failure flashes spinner→login | Low | Redirect is a single `router.replace`; spinner is sub-second; shell is shared so no chrome swap |
| `es.ts` parity break if `oauthFailed`/`callback` added only to one file | Low | `satisfies AuthDictTranslated` makes TS fail the build until both match |
| jsdom cannot navigate, so `window.location.href`/`replace` assertions need stubbing | Med | Tests redefine `window.location` with spies; documented in 4.1/4.2 |
| `OAUTH_API_ORIGIN` unset in CI/preview → social buttons throw on click | Med | Documented required env var; throw is explicit and console-visible, password login unaffected |

---

## 7. Out of Scope (confirmed unchanged)

- `/api` proxy, `proxyTo`, `internalUrl` — untouched.
- Domain models, `IAuthRepository` port, existing use cases — untouched.
- Logout-all UI, account linking, server cookie rework, new providers beyond the three.
