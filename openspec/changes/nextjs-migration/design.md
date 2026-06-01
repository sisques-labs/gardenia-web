# Design: Migrate gardenia-web from Angular to Next.js (App Router) + pnpm

> Technical design (the HOW) for the `nextjs-migration` change. Companion to `proposal.md` and the spec.
> Scope: parity migration. No new features. This document defines architecture, boundaries, and the highest-risk mechanisms (401-refresh mutex, route guards, boot-time auth resolution) in enough detail to implement from.

## 0. Grounding Facts (verified against current code)

These were confirmed by reading the live Angular source — the design depends on them:

- **Access token is in-memory ONLY.** `AuthStateService._accessToken` is a `signal<string | null>(null)` with **no localStorage persistence**. On a hard page reload the token is gone.
- **Refresh uses an httpOnly cookie.** `AuthHttpRepository.refresh()` calls `POST /auth/refresh` with `withCredentials: true` and an empty body — the refresh token travels as an httpOnly cookie, never touched by JS.
- **Refresh endpoint returns a new `accessToken`** (`AuthResponse`), persisted into state by `RefreshService`.
- **Only the active space ID is persisted** to localStorage (`gardenia.activeSpaceId` via `ActiveSpaceStorage`). The space list itself is in-memory.
- **`X-Space-ID` is injected on every non-auth request** (skip when URL includes `/auth/`).
- **Auth header is injected on every request except** `/auth/login` and `/auth/register`.
- **`/auth/refresh` 401 → hard logout** (no retry loop).
- **Dockerfile currently copies `/app/dist/gardenia/browser/`** (NOT `dist/gardenia-web/browser` — the proposal note was approximate). The new path is `/app/.next/`.
- The `users/` context exists as 2 pure-TS files (entity + interface) but has no runtime wiring — port as-is, no special handling.

### Boot-time auth consequence (DESIGN-CRITICAL)

Because the access token lives only in memory, **after any full page navigation the React app boots with `accessToken === null`** even when the user has a valid refresh cookie. In Angular this was masked by the SPA never doing a hard reload. In Next.js (Node server mode) a hard reload or deep-link hits the server, middleware runs, the cookie-presence gate passes, but the client-side React tree boots with no token.

Resolution: a **client-side boot bootstrap** ("silent refresh on boot") in the root provider. On mount, if `accessToken === null`, attempt `POST /auth/refresh` once. If it succeeds → hydrate token + `me()`. If it fails → treat as logged out. This is NOT a new feature; it preserves the existing security model (refresh cookie = source of truth) while adapting to the SSR-capable server. Middleware does the cheap cookie-presence gate; the bootstrap does the real token hydration.

---

## 1. Project Structure

### Root-folder conflict resolution

Angular uses `src/app/` for BOTH domain code (`src/app/core/...`) AND its bootstrap. Next.js App Router **requires** routing files at `src/app/` (or `app/`). They cannot coexist under the same meaning. Resolution:

- **`src/app/` is reserved exclusively for the Next.js App Router** (pages, layouts, route groups). Nothing else lives there.
- **Domain/application/infrastructure code moves to `src/core/{context}/`** — same DDD pattern, new root. This is a pure prefix change: `@/core/...` import alias stays identical, so most `domain/` files need ZERO edits.
- **Shared UI atoms move to `src/components/ui/`** (React convention; short, conventional).
- **Shared non-UI (EventBus, shared domain events, value objects) move to `src/core/shared/`** — unchanged.

### Final structure

```
gardenia-web/
  middleware.ts                      # Edge/Node route guard (project root, NOT under src/app)
  next.config.ts                     # no output override — Node server mode
  vitest.config.ts                   # replaces karma.conf.js
  vitest.setup.ts                    # RTL + jest-dom matchers
  tsconfig.json                      # paths: "@/*": ["./src/*"]  (alias preserved)
  src/
    app/                             # === Next.js App Router ONLY ===
      layout.tsx                     # root layout: <Providers> (boot bootstrap + stores)
      globals.css                    # was src/styles.css (@import "tailwindcss" + design system)
      (auth)/                        # route group — no shell, guest-only
        login/page.tsx
        register/page.tsx
      (protected)/                   # route group — ShellLayout
        layout.tsx                   # ShellLayout: resolves spaces, renders Header
        page.tsx                     # home (was '' child / dashboard)
        spaces/
          page.tsx                   # space list (was /spaces)
      spaces/
        new/page.tsx                 # space create (was /spaces/new — NOT under shell; see §6)
    core/                            # === ported DDD/Hexagonal ===
      auth/
        domain/                      # moved as-is (pure TS)
        application/
          ports/                     # interfaces as-is
          services/                  # @Injectable removed → module singletons / hooks
        infrastructure/
          repositories/auth-http.repository.ts   # HttpClient → ky
          http/auth.interceptor.ts               # afterError 401 mutex (was interceptors/)
          tokens/  → REMOVED (InjectionToken → env var, see §7)
      spaces/
        domain/                      # moved as-is
        application/
          ports/
          services/                  # signals → Zustand
        infrastructure/
          repositories/spaces-http.repository.ts # ky
          storage/active-space.storage.ts        # @Injectable removed, plain module
      shared/
        domain/                      # domain events, value objects (uuid.vo.ts)
        infrastructure/event-bus.ts  # RxJS EventBus — unchanged
      users/
        domain/                      # 2 files, ported as-is
    stores/                          # === Zustand stores ===
      auth.store.ts
      spaces.store.ts
    lib/
      http/client.ts                 # the single shared ky instance
    components/
      ui/                            # shadcn/ui components (installed via CLI, built on Radix + Tailwind)
      header/                        # Header component
    design-system/                   # *.css tokens — moved as-is
    hooks/
      use-event-bus.ts               # useEffect-wrapped EventBus subscription
      use-boot-auth.ts               # silent refresh on boot
```

**Decision: stores live in `src/stores/`, not inside `application/`.** Rationale: Zustand stores ARE the application-state layer, but they're React-framework-coupled (they import `zustand`). Keeping them out of `core/.../application` preserves the rule that `core/` services stay as portable as possible and makes the framework boundary explicit. The thin application *services* (login, register, logout, me, refresh) stay in `core/auth/application/services/` as plain classes/functions that the stores and components call.

**Decision: shadcn/ui for all UI components.** The 7 Angular atoms (Button, Card, Input, Select, Textarea, Badge, Icon) are replaced by shadcn/ui equivalents. Components are installed via `npx shadcn@latest add <component>` and live in `src/components/ui/` (shadcn's default). This also eliminates the `@angular/cdk` audit — shadcn is built on Radix UI primitives which cover all CDK use cases (focus trap, overlay, dialog, etc.) out of the box. `@lucide/angular` → `lucide-react` (shadcn dependency, direct swap).

---

## 2. Auth Interceptor Design (CRITICAL PATH)

Goal: port the Angular `isRefreshing` flag + `Subject<string | null>` mutex to ky `afterError`, preserving exactly:
- N concurrent 401s trigger **exactly one** `/auth/refresh`.
- Queued requests retry with the **new** token.
- A 401 on `/auth/refresh` itself → hard logout, no retry.
- Refresh failure → broadcast failure to all waiters, clear session.

### Mutex primitive

Replace `Subject<string|null>` with a **module-level shared Promise**. The Promise IS the queue: every concurrent request `await`s the same Promise, so they all resolve from one refresh.

```ts
// lib/http/refresh-mutex.ts
let refreshPromise: Promise<string | null> | null = null;

/**
 * Returns the in-flight refresh promise if one exists, otherwise starts a new
 * refresh cycle. The very first caller "owns" the cycle; concurrent callers
 * piggyback on the same promise. Resolves to the new token, or null on failure.
 */
export function refreshTokenOnce(doRefresh: () => Promise<string>): Promise<string | null> {
  if (refreshPromise) return refreshPromise;          // piggyback — single refresh

  refreshPromise = doRefresh()
    .then((token) => token)                            // success → new token
    .catch(() => null)                                 // failure → null sentinel
    .finally(() => {
      refreshPromise = null;                           // reset gate for next cycle
    });

  return refreshPromise;
}
```

This is simpler and safer than the RxJS version: there is no separate `isRefreshing` boolean to keep in sync with the subject — the nullable `refreshPromise` IS the lock.

### `afterError` hook

```ts
// lib/http/client.ts (afterError hook excerpt)
import ky from 'ky';
import { useAuthStore } from '@/stores/auth.store';
import { refreshTokenOnce } from './refresh-mutex';

const AUTH_REFRESH_URL = '/auth/refresh';

const afterError = async (
  { request, response }: { request: Request; response: Response }
): Promise<Response> => {
  if (response.status !== 401) return response;        // non-401 → bubble unchanged

  const url = new URL(request.url);

  // 401 on the refresh endpoint itself → hard logout, no retry.
  if (url.pathname.endsWith(AUTH_REFRESH_URL)) {
    useAuthStore.getState().clearAuth();
    return response;
  }

  // Do NOT attempt refresh for login/register failures — those are real auth errors.
  if (url.pathname.endsWith('/auth/login') || url.pathname.endsWith('/auth/register')) {
    return response;
  }

  // Acquire (or join) the single refresh cycle.
  const newToken = await refreshTokenOnce(() => doRefresh());

  if (newToken === null) {
    useAuthStore.getState().clearAuth();               // refresh failed → logout
    return response;                                   // surface original 401
  }

  // Retry the ORIGINAL request once, with the new bearer token.
  // Use the bare fetch-equivalent ky instance WITHOUT this afterError hook to
  // avoid infinite retry loops if the retried request also 401s.
  return retryClient(request.url, {
    method: request.method,
    headers: withBearer(request.headers, newToken),
    body: request.body,
    credentials: 'include',
  });
};
```

### How concurrency works (walkthrough)

1. Requests A, B, C all fire, all get 401.
2. A enters `afterError` first → `refreshTokenOnce` sees `refreshPromise === null` → starts refresh, stores the promise.
3. B and C enter → `refreshPromise` is non-null → they `await` the **same** promise. No second refresh.
4. Refresh resolves with token `T`. All three awaits resolve to `T` simultaneously.
5. `.finally` resets `refreshPromise = null` so the *next* 401 wave starts fresh.
6. A, B, C each retry their own original request with `Bearer T`.

### Reading Zustand from outside React

`useAuthStore.getState()` returns the current store snapshot synchronously, with no hook, no React tree. This is THE reason Zustand was chosen over Context. The `afterError` hook, `beforeRequest` hook, and `doRefresh` all read/write via `getState()` / `setState()`.

```ts
function doRefresh(): Promise<string> {
  // calls POST /auth/refresh (credentials:'include', empty body) via a *separate*
  // bare ky instance that has NO afterError hook (prevents recursion).
  // On success: writes token into the store AND returns it.
  return authRepository.refresh().then((res) => {
    useAuthStore.getState().setAccessToken(res.accessToken);
    return res.accessToken;
  });
}
```

### Recursion guard (decision)

Two ky instances:
- **`http`** — the app client, with `beforeRequest` + `afterError`. Used everywhere.
- **`retryClient`** / refresh client — a **bare** instance WITHOUT `afterError`, used (a) inside `doRefresh` and (b) to replay the original request after refresh. This guarantees a single retry and no infinite loop. ky's built-in `retry` is set to `{ limit: 0 }` on both so retries are fully controlled by our hook.

### Spike gate (from proposal Risk #1)

Before Phase 2 commits, write the concurrency test FIRST: fire N parallel requests that all 401, assert `doRefresh` is invoked exactly once, assert all N retry with the new token, assert a refresh failure clears the session exactly once. Gate the ky commitment on this test passing.

---

## 3. Zustand Store Design

### AuthStore (`src/stores/auth.store.ts`) — in-memory only

```ts
interface AuthState {
  accessToken: string | null;
  currentUser: AccountUser | null;
  // derived: read isAuthenticated() as a selector, NOT stored
  setAccessToken(token: string | null): void;
  setCurrentUser(user: AccountUser | null): void;
  clearAuth(): void;
}
```

- **`isAuthenticated` is DERIVED, not stored.** Expose as a selector hook: `const isAuthed = useAuthStore((s) => s.accessToken !== null)`. Mirrors the Angular `computed`. Storing it would risk drift.
- **NOT persisted.** Matches current behavior exactly: token lives in memory, refresh cookie is the durable source of truth. Persisting the access token to localStorage would be a security regression and a behavior change — explicitly rejected.
- `clearAuth()` resets token + user. Navigation to `/login` is NOT done inside the store (stores must be React-tree-agnostic). Components/middleware handle redirects; the store only owns state. (This is a deliberate departure from Angular's `clearSession()` which called `router.navigateByUrl` — that coupling doesn't port cleanly.)

### SpacesStore (`src/stores/spaces.store.ts`) — activeSpaceId persisted

```ts
interface SpacesState {
  availableSpaces: Space[];
  currentSpaceId: string | null;   // persisted to localStorage
  isLoading: boolean;
  isResolved: boolean;
  // derived: currentSpace = availableSpaces.find(s => s.id === currentSpaceId) ?? null
  setSpaces(spaces: Space[]): void;
  setActiveSpace(spaceId: string): void;
  resolveFromStorage(spaces: Space[]): void;
  clear(): void;
}
```

- **`currentSpace` is DERIVED** (selector), exactly like the Angular `computed`. Not stored.
- **Only `currentSpaceId` is persisted** via `zustand/middleware persist` with `partialize: (s) => ({ currentSpaceId: s.currentSpaceId })` and key `gardenia.activeSpaceId`. This replaces `ActiveSpaceStorage` and preserves the same localStorage key and semantics.
- `availableSpaces`, `isLoading`, `isResolved` are **in-memory only** — recomputed on each session via `loadSpaces`.
- `resolveFromStorage` keeps the exact fallback logic from Angular: stored id if still valid → else first space (and persist it) → else null.

### Field-by-field summary

| Store | Field | Kind | Persisted |
|-------|-------|------|-----------|
| Auth | accessToken | state | no (in-memory) |
| Auth | currentUser | state | no |
| Auth | isAuthenticated | DERIVED selector | n/a |
| Spaces | availableSpaces | state | no |
| Spaces | currentSpaceId | state | **yes (localStorage)** |
| Spaces | currentSpace | DERIVED selector | n/a |
| Spaces | isLoading / isResolved | state | no |

---

## 4. ky Client Design (`src/lib/http/client.ts`)

A single module singleton (`export const http = ky.create({...})`) plus a bare refresh/retry instance.

```ts
export const http = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL,   // was API_URL InjectionToken
  credentials: 'include',                        // httpOnly refresh cookie travels
  retry: { limit: 0 },                           // we control retries in afterError
  hooks: {
    beforeRequest: [injectAuthHeader, injectSpaceHeader],
    afterError: [afterError],                     // see §2
  },
});

// bare instance — NO afterError, used by doRefresh + the post-refresh retry
const bare = ky.create({ prefixUrl: process.env.NEXT_PUBLIC_API_URL, credentials: 'include', retry: { limit: 0 } });
```

### `beforeRequest` hooks

```ts
function injectAuthHeader(request: Request) {
  const path = new URL(request.url).pathname;
  if (path.endsWith('/auth/login') || path.endsWith('/auth/register')) return; // skipAuth
  const token = useAuthStore.getState().accessToken;
  if (token) request.headers.set('Authorization', `Bearer ${token}`);
}

function injectSpaceHeader(request: Request) {
  const path = new URL(request.url).pathname;
  if (path.includes('/auth/')) return;            // skipSpace — matches Angular shouldSkipSpace
  const spaceId = useSpacesStore.getState().currentSpaceId;
  if (spaceId) request.headers.set('X-Space-ID', spaceId);
}
```

This reproduces `shouldSkipAuth` (login/register) and `shouldSkipSpace` (any `/auth/` URL) exactly. Both read state via `getState()` — no hooks, callable from outside React.

> Note on ky `prefixUrl`: ky strips leading `/` on request URLs when `prefixUrl` is set. Repositories must pass paths like `auth/login` (no leading slash) — a small mechanical change from the Angular template-string URLs. Flag this in tasks.

---

## 5. Middleware Design (Route Guards) — `middleware.ts` at project root

Next.js middleware runs on the **Node.js runtime** (since we are NOT using `output: 'export'`). It executes on every request BEFORE the page renders — on the actual server. It CAN read cookies and headers. It CANNOT read in-memory Zustand state (server-side, no access to client memory). So middleware does the **cheap cookie-presence gate**; real token hydration happens client-side (boot bootstrap §0 + ShellLayout §6).

**Middleware IS authoritative in production** (unlike with static export where nginx would serve files and middleware would never run). This is why removing nginx and using Node server was the right call.

### Cookie the middleware reads

The httpOnly **refresh cookie** is the only durable auth signal. Middleware checks **its presence** (not validity — it cannot validate without an API call). Cookie name must match what the backend sets (e.g. `refreshToken` / `gardenia_rt`) — **confirm the exact name with the backend during tasks**; design assumes a single httpOnly refresh cookie.

> If the refresh cookie is httpOnly AND on a path/domain the Edge middleware can read, presence check works directly. If the cookie is scoped such that middleware can't see it, fall back to a non-sensitive companion cookie `gardenia.isAuth=1` (NOT httpOnly, no token value, set on login / cleared on logout) used solely as a routing hint. Decide during tasks based on the confirmed cookie scope. The hint cookie carries no secret, so it's safe.

### Guard mapping

| Angular guard | Next.js mechanism | Behavior |
|---------------|-------------------|----------|
| `authGuard` | middleware | If route is protected AND no refresh/hint cookie → redirect `/login?returnUrl=...`. Preserves the `returnUrl` query param. |
| `guestGuard` | middleware | If route is `/login` or `/register` AND cookie present → redirect `/`. |
| `spaceGuard` | **ShellLayout client effect** (NOT middleware) | Cannot do HTTP on Edge. Moves to `(protected)/layout.tsx`. See §6. |

### Route protection table

```ts
// middleware.ts
const PUBLIC = ['/login', '/register'];
// protected = everything else, EXCEPT /spaces/new which is auth-required but
// space-resolution-exempt (you create your first space there).

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hasAuth = Boolean(req.cookies.get(REFRESH_OR_HINT_COOKIE));

  const isPublic = PUBLIC.some((p) => pathname.startsWith(p));

  if (isPublic && hasAuth) {
    return NextResponse.redirect(new URL('/', req.url));        // guestGuard
  }
  if (!isPublic && !hasAuth) {
    const url = new URL('/login', req.url);
    url.searchParams.set('returnUrl', pathname);                // authGuard
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.).*)'],
};
```

> **Middleware runs in production.** With Next.js Node server mode, `middleware.ts` executes on every request before the page handler. The cookie-presence gate is the first line of defense. Client-side guards (boot bootstrap + ShellLayout) remain as a defense-in-depth layer (they handle the token hydration step that middleware cannot do), but they are NOT the sole protector.

---

## 6. App Router File Structure

```
src/app/
  layout.tsx                 # root layout — <Providers> wraps {children}; mounts boot bootstrap
  globals.css                # @import "tailwindcss" + design-system imports (was styles.css)

  (auth)/                    # route group, no shell layout, client guest-gate
    layout.tsx               # optional: redirect to '/' if authed (guestGuard, client-side)
    login/page.tsx
    register/page.tsx

  (protected)/               # route group, ShellLayout + authGuard + spaceGuard (client-side)
    layout.tsx               # ShellLayout: client guard → loadSpaces → resolve → render Header + children
    page.tsx                 # home / dashboard ('' route)
    spaces/
      page.tsx               # space list

  spaces/
    new/page.tsx             # space create — auth-required but OUTSIDE (protected) shell
```

### Why `spaces/new` is OUTSIDE `(protected)`

In Angular, `/spaces/new` is a **top-level route, NOT a child of the shell** (confirmed in `app.routes.ts` — it has no `spaceGuard`). It's where a user with zero spaces lands. Putting it inside `(protected)` would subject it to the space-resolution guard, which would redirect a space-less user right back to `/spaces/new` — a loop. So it stays a sibling: auth-required (client guard), space-resolution-EXEMPT.

### ShellLayout = `(protected)/layout.tsx` (replaces spaceGuard)

This is where the Angular `spaceGuard` HTTP logic lives now (client-side effect, the design from proposal Risk #3):

```
(protected)/layout.tsx (client component):
  1. client auth-gate: if !isAuthenticated → router.replace('/login')
  2. if !isResolved → call loadSpaces() (HTTP via repository)
       show loading skeleton while loading (masks the resolution flash — Risk #3 mitigation)
  3. after resolve:
       if currentSpace === null → router.replace('/spaces/new')
       else → render <Header /> + {children}
```

`loadSpaces()` reproduces `resolveFromStorage` semantics: stored id → first space → null. The `UserRegisteredEvent → setActiveSpace` subscription (Angular constructor) becomes a `useEventBus('auth.user_registered', ...)` effect mounted here or in the store init.

### `middleware.ts` location

At the **project root** (`/middleware.ts`), NOT inside `src/app/`. Next.js convention. (Even though it's dev-only under static export per §5.)

---

## 7. Domain Layer Migration Strategy

| Layer | File examples | Action | Edits required |
|-------|---------------|--------|----------------|
| `domain/` (all contexts) | `account-user.model.ts`, `space.interface.ts`, `uuid.vo.ts`, shared events | **Move as-is** to `src/core/{ctx}/domain/`. Pure TS, zero framework imports. | None (alias `@/core` preserved) |
| `application/ports/` | `auth.repository.port.ts`, `spaces.repository.port.ts` | Keep interface. **Drop `InjectionToken`** (`AUTH_REPOSITORY`, `SPACES_REPOSITORY`) — replaced by module singletons. | Remove the `new InjectionToken(...)` line + `@angular/core` import |
| `application/services/` | login, register, logout, me, refresh | **Remove `@Injectable()` + `inject()`.** Convert to plain classes that take deps via constructor, OR plain functions. Export ONE module singleton instance. RxJS `Observable` → `Promise` (repositories return promises from ky). | Moderate — de-RxJS the thin services |
| `infrastructure/repositories/` | `auth-http.repository.ts`, `spaces-http.repository.ts` | Replace `HttpClient` with the `http` ky singleton. `this.http.post<T>(url, body)` → `http.post(path, { json: body }).json<T>()`. Drop leading `/` on paths (ky prefixUrl). `withCredentials:true` → handled globally by `credentials:'include'`. | Mechanical rewrite |
| `infrastructure/tokens/` | `api-url.token.ts` | **Delete.** `API_URL` → `process.env.NEXT_PUBLIC_API_URL` read in `lib/http/client.ts`. | Removed |
| `infrastructure/storage/` | `active-space.storage.ts` | **Drop `@Injectable`.** Either keep as a plain class OR fold into the Zustand `persist` middleware (preferred — §3). Same localStorage key `gardenia.activeSpaceId`. | Minor / absorbed by store |
| `infrastructure/interceptors/` | `auth.interceptor.ts` | **Rewrite** as ky hooks (§2). Moves to `core/auth/infrastructure/http/` or `lib/http/`. | Full rewrite (highest risk) |
| `shared/infrastructure/` | `event-bus.service.ts` | **Move as-is** (RxJS Subject, framework-agnostic). Drop `@Injectable`, export module singleton. Add `useEventBus` hook for components. | Drop decorator only |
| `presentation/` (pages, components, guards, layouts) | all | **Full rewrite** as React. Guards → middleware + client gates. Pages → `page.tsx`. ShellLayout → `(protected)/layout.tsx`. | Full rewrite |

### RxJS → Promise boundary

The thin application services (login/register/refresh/me/logout) currently return `Observable`. Since ky returns Promises and React has no RxJS, **repositories and services return `Promise<T>`**. The only RxJS that SURVIVES is `EventBusService` (internal pub/sub), wrapped by `useEventBus`. Everything else de-RxJS-es.

---

## 8. CI / Docker Changes

### `next.config.ts` (new)

```ts
const nextConfig: NextConfig = {
  // No output override — Next.js runs as a Node server (next start)
  // This enables middleware.ts to run in production on every request
};
```

### `.github/workflows/ci.yml`

- **Test command:** Karma/Jasmine (`ng test` / `karma`) → `pnpm test` (Vitest, run mode `vitest run`).
- **Build command:** `pnpm build` (now `next build`, emits `.next/`). Stays `pnpm build` — the script content changes, the CI invocation doesn't.
- **Lint:** Angular ESLint → Next.js ESLint (`next lint` / flat config). Update in Phase 5.
- **Typecheck:** keep `tsc --noEmit` (or `next build` covers it).

### `Dockerfile`

2-stage build: `node:24-bookworm-slim` builder → `node:24-bookworm-slim` runtime (no nginx).

```dockerfile
# Stage 1 — builder (unchanged install pattern)
FROM node:24-bookworm-slim AS builder
ENV HUSKY=0
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build
# produces /app/.next/ + /app/public/

# Stage 2 — runtime (Next.js Node server, replaces nginx)
FROM node:24-bookworm-slim AS runner
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@9.15.4 --activate
WORKDIR /app
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile --prod
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["pnpm", "start"]
```

Key changes from the Angular Dockerfile:
- Stage 2 base image: nginx → node:24-bookworm-slim
- No `nginx.conf`, no `COPY .next → /usr/share/nginx/html`
- `CMD` → `pnpm start` (runs `next start`)
- Port: 80 → 3000

### `nginx.conf`

**Deleted.** No longer needed — Next.js serves its own HTTP server.

---

## 9. Test Strategy

| Angular | Vitest/RTL equivalent | Notes |
|---------|----------------------|-------|
| `describe / it / expect` | identical in Vitest | API-compatible; minimal change |
| Jasmine spies (`spyOn`, `jasmine.createSpy`) | `vi.fn()`, `vi.spyOn()` | Mechanical rename |
| `TestBed.configureTestingModule` | removed | No DI container — import the unit directly |
| `TestBed.inject(Service)` | `new Service(deps)` or import the module singleton | Deps passed explicitly (constructor) — no provider wiring |
| Component fixture / `ComponentFixture` | RTL `render(<Comp />)` | Full rewrite per component |
| `fixture.detectChanges()` | not needed (React auto-renders) / `await screen.find...` | RTL async queries |
| `karma.conf.js` | `vitest.config.ts` + `vitest.setup.ts` | jsdom env, `@testing-library/jest-dom` matchers |
| `*.spec.ts` files | stay `*.spec.ts(x)` | update imports; domain/application specs migrate near 1:1 |
| HttpTestingController | `vi.mock` the ky client / MSW (optional) | Repository tests mock `http` |

### Migration order (per proposal Risk #5)

1. **Domain specs first** (`uuid.vo.spec`, value objects) — highest reuse, near-zero change.
2. **Application/service specs** — de-RxJS assertions (`subscribe` → `await`); spy on repositories.
3. **The refresh-mutex spike test** — write BEFORE Phase 2 code (gates ky). N parallel 401s → 1 refresh.
4. **Component specs** — full RTL rewrites, done **alongside** each component port, not in a separate pass.

### `vitest.config.ts` shape

```ts
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.ts'],
    globals: true,              // describe/it/expect without imports (Jasmine-like)
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
});
```

---

## ADR Summary (decisions + rejected alternatives)

| # | Decision | Chosen | Rejected | Rationale |
|---|----------|--------|----------|-----------|
| 1 | Domain root folder | `src/core/{ctx}/` | Keep `src/app/core` | `src/app/` is reserved for App Router; alias `@/core` preserved so domain files need no edits |
| 2 | Refresh mutex primitive | module-level nullable `Promise<string\|null>` | port RxJS `Subject`+`isRefreshing` | Nullable promise IS the lock — no two-variable sync; simpler, race-free; the promise queues all waiters |
| 3 | Recursion guard | two ky instances (`http` + bare) | single instance with retry flag | Bare instance for refresh + replay guarantees single retry, no infinite 401 loop |
| 4 | `isAuthenticated` / `currentSpace` | derived selectors | stored fields | Mirror Angular `computed`; storing risks drift |
| 5 | Access token persistence | in-memory only (NOT localStorage) | persist token | Preserves current security model (refresh cookie = source of truth); persisting = security regression + behavior change |
| 6 | Active space persistence | Zustand `persist` (`currentSpaceId`, key `gardenia.activeSpaceId`) | keep `ActiveSpaceStorage` class | Same key/semantics, fewer moving parts; storage class absorbed into store |
| 7 | Route guards | `middleware.ts` is authoritative (runs on Node server); client-side gates are defense-in-depth | static export + nginx (rejected: middleware wouldn't run) | Node server mode means middleware runs on every request before the page handler; removing nginx was the key enabler |
| 8 | Boot auth resolution | silent refresh-on-boot in root Providers | assume token survives reload | Token is in-memory; a deep-link/refresh boots unauthenticated; silent refresh restores session from the cookie |
| 9 | `spaces/new` placement | sibling of `(protected)`, space-exempt | child of shell | Matches Angular (no spaceGuard); avoids redirect loop for space-less users |
| 10 | spaceGuard | ShellLayout client effect + loading skeleton | middleware HTTP | Edge can't call internal API; skeleton masks resolution flash (Risk #3) |
| 11 | RxJS scope | only EventBus survives (via `useEventBus`) | keep RxJS in services | ky/React have no RxJS; thin services return Promises |
| 12 | Stores location | `src/stores/` | inside `application/` | Keeps `core/` framework-portable; makes the React boundary explicit |

---

## Open Decisions Deferred to Tasks

- **Exact refresh cookie name + scope** — confirm with backend; decides whether middleware reads the refresh cookie directly or a non-sensitive `gardenia.isAuth` hint cookie (§5).
- **CDK replacement (Radix vs Headless UI)** — blocked on the Phase 1 `@angular/cdk` HTML-template audit (proposal Risk #2). Design is agnostic to the choice.
- **MSW vs `vi.mock` for repository tests** — both viable; pick during test-setup task.
