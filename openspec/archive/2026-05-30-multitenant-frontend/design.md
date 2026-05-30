# Design: Multi-tenant Frontend (Spaces) — Phase 1

## Technical Approach

Mirror `core/auth/` layering into a new `core/spaces/` DDD domain (domain → application → infrastructure → presentation). `SpacesStateService` owns all space signals; the interceptor and guards read from it. HTTP repository methods are typed TODO stubs returning `throwError`. The init sequence is gated by a functional `spaceGuard` that lazily triggers `loadSpaces()` on first protected navigation. Active `spaceId` persists in `localStorage` and rehydrates on first resolve. An `APP_INITIALIZER` forces eager instantiation of `SpacesStateService` at boot so its EventBus subscription is wired before any register flow — the constructor still drives subscription, the initializer only guarantees timing.

**Cross-context decoupling**: `core/auth` and `core/spaces` are INDEPENDENT contexts that never import each other. They communicate through an in-memory `EventBusService` (RxJS `Subject`) in a new `core/shared/` layer — the same CQRS/EventBus pattern the backend uses with NestJS. On register, `RegisterService` publishes a `UserRegisteredEvent`; `SpacesStateService` subscribes in its constructor and reacts by persisting `spaceId`. Auth has zero knowledge of spaces.

## Architecture Decisions

| Decision | Choice | Alternatives rejected | Rationale |
|----------|--------|----------------------|-----------|
| Init trigger | `spaceGuard` lazily calls `loadSpaces()` + resolves, blocks until `isResolved` | `APP_INITIALIZER` as the resolver | Guard co-locates gating with routing and only loads spaces when a protected route is hit — boot stays fast for unauthenticated users. |
| EventBus subscriber timing | `APP_INITIALIZER` eagerly instantiates `SpacesStateService` at bootstrap so its constructor registers the `UserRegisteredEvent` subscription before any register flow runs | (a) inject `SpacesStateService` in the register page; (b) `ReplaySubject(1)` in the bus | (a) is fragile — relies on route/component injection order; (b) leaks replay semantics into a fire-and-forget bus and risks stale redelivery to late subscribers. `APP_INITIALIZER` makes the singleton's lifetime explicit and decoupled from routing, with a no-op factory (it only triggers `deps` resolution). |
| Space ownership | All space state in `SpacesStateService`; `AuthStateService` delegates (no space signals in auth) | Duplicate `currentSpaceId` in `AuthStateService` | Single source of truth. Auth stays auth; register forwarding happens via event, not a direct call. |
| Context coupling | `RegisterService` publishes `UserRegisteredEvent` to `EventBusService`; `SpacesStateService` subscribes in its constructor | Direct call `RegisterService → SpacesStateService.setActiveSpace` | Removes cross-context import (`auth → spaces`). Mirrors backend CQRS/EventBus. Contexts evolve independently; new subscribers (analytics, onboarding) attach without touching auth. |
| EventBus home | `core/shared/` (new layer) | `shared/` (presentational UI kit) | `core/shared/` is for cross-domain coordination; `shared/` is the dumb UI/value-object kit. Keeping the bus in `core/shared/` signals it is core infrastructure, not presentation. |
| EventBus impl | RxJS `Subject<DomainEvent>` + typed `on<T>(type)` filter | `@Output`/service callbacks, NgRx, Angular events | `Subject` is zero-dep, synchronous, and matches the team's RxJS fluency. Typed `on<T>` keeps subscribers type-safe. No store machinery needed for fire-and-forget domain events. |
| Interceptor source | Read `currentSpace()?.id` from `SpacesStateService`, skip on `/auth/` | Read from `localStorage` directly | Signal is the live source; storage is hydration only. Avoids stale reads. |
| Stub strategy | `throwError(() => new Error('TODO: implement when API is ready'))` | Return `of([])` mock data | Fails loud so nobody ships fake data; domain still compiles + type-checks. |
| Persistence | `localStorage` key `gardenia.activeSpaceId` | sessionStorage / cookie | Survives reload across tabs; non-sensitive (just an id). |

## Data Flow

    [core/auth]                         [core/shared]              [core/spaces]
    RegisterService                     EventBusService            SpacesStateService
    repo.register() ──{spaceId}──→ publish(UserRegisteredEvent) ──→ on('auth.user_registered')
                                                                          │
                                                              setActiveSpace(spaceId) ──→ localStorage
                                                                          │
    protected nav → spaceGuard → loadSpaces() → resolveFromStorage(spaces) → isResolved=true
                                                                          │
    HttpClient req → authInterceptor → reads currentSpace().id → sets X-Space-ID (skip /auth/)

Auth never references `core/spaces`. The only outward signal it emits is the event.

## Interfaces / Contracts

### Shared — EventBus

```typescript
// core/shared/domain/domain-event.interface.ts
export interface DomainEvent {
  readonly type: string;
  readonly occurredAt: Date;
}

// core/shared/domain/events/user-registered.event.ts
export interface UserRegisteredEvent extends DomainEvent {
  readonly type: 'auth.user_registered';
  readonly spaceId: string;
}

// core/shared/infrastructure/event-bus.service.ts
@Injectable({ providedIn: 'root' })
export class EventBusService {
  private readonly events$ = new Subject<DomainEvent>();
  publish(event: DomainEvent): void { this.events$.next(event); }
  on<T extends DomainEvent>(type: string): Observable<T> {
    return this.events$.pipe(filter((e) => e.type === type)) as Observable<T>;
  }
}
```

`RegisterService` builds the event (`{ type: 'auth.user_registered', occurredAt: new Date(), spaceId }`) and calls `eventBus.publish(event)` after a successful `register()` response. It imports ONLY from `core/shared` and `core/auth`.

`SpacesStateService` constructor: `eventBus.on<UserRegisteredEvent>('auth.user_registered').pipe(takeUntilDestroyed()).subscribe((e) => this.setActiveSpace(e.spaceId))`. As a root singleton it lives for the app lifetime — but it is LAZY, so an `APP_INITIALIZER` forces its creation at bootstrap to guarantee the subscription is active before any register flow.

### App init — eager EventBus subscriber

```typescript
// app.config.ts (providers)
{
  provide: APP_INITIALIZER,
  useFactory: (_spacesState: SpacesStateService) => () => {},
  deps: [SpacesStateService],
  multi: true,
}
```

The factory is a no-op; its only job is to declare `SpacesStateService` in `deps`, which forces Angular to instantiate the singleton during bootstrap. The constructor then registers the `UserRegisteredEvent` subscription before any user can reach the register flow. This resolves the `Subject`'s lack of replay: a subscriber exists before `publish` is ever called.

### Spaces & Auth

```typescript
// domain/models/space.model.ts
export interface Space { readonly id: string; readonly name: string; }
// domain/models/space-membership.model.ts
export interface SpaceMembership { readonly spaceId: string; readonly userId: string; readonly role: SpaceRole; }
export type SpaceRole = 'owner' | 'admin' | 'member';

// application/ports/spaces.repository.port.ts
export interface ISpacesRepository {
  getSpacesByUser(): Observable<Space[]>;
  createSpace(name: string): Observable<Space>;
}
export const SPACES_REPOSITORY = new InjectionToken<ISpacesRepository>('SPACES_REPOSITORY');

// Updated auth-response.interface.ts (register only — login unchanged)
export interface RegisterResponse { readonly accessToken: string; readonly user: AccountUser; readonly spaceId: string; }
```

`SpacesStateService` signals: `availableSpaces: Space[]`, `currentSpace: Space | null` (computed from `_currentSpaceId` + `availableSpaces`), `isLoading: boolean`, `isResolved: boolean`. Methods: `loadSpaces()`, `setActiveSpace(spaceId)`, `resolveFromStorage(spaces)`, `clear()`.

`spaceGuard` (functional `CanActivateFn`): if `!isResolved` → call `loadSpaces()`, wait, `resolveFromStorage`; if a resolved current space exists → `true`; else redirect `/spaces`.

Interceptor change: add `function shouldSkipSpace(req)` = `req.url.includes('/auth/')`; when not skipped and `currentSpace()` exists, `req.clone({ setHeaders: { 'X-Space-ID': id } })`.

## File Changes

| File | Action | Description |
|------|--------|-------------|
| `core/shared/domain/domain-event.interface.ts` | Create | `DomainEvent` base interface |
| `core/shared/domain/events/user-registered.event.ts` | Create | `UserRegisteredEvent` (`auth.user_registered`) |
| `core/shared/infrastructure/event-bus.service.ts` | Create | `EventBusService` — RxJS `Subject` + typed `on<T>` / `publish` |
| `core/spaces/domain/models/space.model.ts` | Create | `Space` interface |
| `core/spaces/domain/models/space-membership.model.ts` | Create | `SpaceMembership` + `SpaceRole` |
| `core/spaces/application/ports/spaces.repository.port.ts` | Create | `ISpacesRepository` + `SPACES_REPOSITORY` token |
| `core/spaces/application/services/spaces-state/spaces-state.service.ts` | Create | Signals + init/resolve logic + subscribe to `UserRegisteredEvent` in constructor |
| `core/spaces/infrastructure/repositories/spaces-http.repository.ts` | Create | TODO-stubbed port impl |
| `core/spaces/infrastructure/storage/active-space.storage.ts` | Create | `localStorage` get/set/clear for `gardenia.activeSpaceId` |
| `core/spaces/presentation/guards/space/space.guard.ts` | Create | Functional `spaceGuard` |
| `core/spaces/presentation/pages/space-list/space-list.page.ts` | Create | List wired to `availableSpaces` |
| `core/spaces/presentation/pages/space-create/space-create.page.ts` | Create | Form → `createSpace` (stub) |
| `core/spaces/presentation/layouts/shell/shell.layout.ts` | Create | Authenticated shell: `<app-header>` + `<router-outlet>` |
| `core/auth/domain/interfaces/auth-response.interface.ts` | Modify | Add `RegisterResponse` |
| `core/auth/application/ports/auth.repository.port.ts` | Modify | `register` returns `Observable<RegisterResponse>` |
| `core/auth/infrastructure/repositories/auth-http.repository.ts` | Modify | Type register as `RegisterResponse` |
| `core/auth/application/services/register/register.service.ts` | Modify | Publish `UserRegisteredEvent` with `spaceId` via `EventBusService` (no `core/spaces` import) |
| `core/auth/infrastructure/interceptors/auth.interceptor.ts` | Modify | Inject `X-Space-ID`, skip `/auth/` |
| `shared/presentation/components/header/header.ts` | Modify | Show `currentSpace()?.name` |
| `app.routes.ts` | Modify | `/spaces`, `/spaces/new` under shell + `authGuard`/`spaceGuard` |
| `app.config.ts` | Modify | Provide `SPACES_REPOSITORY` → `SpacesHttpRepository`; add `APP_INITIALIZER` (deps `SpacesStateService`) to eagerly instantiate the EventBus subscriber at boot |

## Testing Strategy

| Layer | What to Test | Approach |
|-------|-------------|----------|
| Unit | `SpacesStateService` resolve/persist, `spaceGuard` branches | Jest/Karma specs mirroring auth `.spec.ts` pattern, mocked port |
| Unit | Interceptor adds `X-Space-ID`, skips `/auth/` | `HttpTestingController` |
| Unit | `EventBusService` publish/on filtering, type isolation | Subscribe to `on('x')`, publish events of other types, assert only matching delivered |
| Unit | `RegisterService` publishes `UserRegisteredEvent` on success | Spy on `EventBusService.publish`, mock repo returning `RegisterResponse` |
| Integration | register publishes event → `SpacesStateService` persists `spaceId` | Real `EventBusService`, mock repo + storage; assert `setActiveSpace` / localStorage side effect |

## Migration / Rollout

No data migration. Additive new domain; auth diffs are backward-compatible except register response type (coordinated with API). Revert = delete `core/spaces/` + revert auth/routes/config diffs.

## Open Questions

- [ ] Does `POST /auth/register` also set the refresh cookie, or must the chained `login` still run? (Affects whether register's `accessToken` is used directly.)
- [ ] Confirm header name casing `X-Space-ID` exactly as API expects.
- [x] **EventBus instantiation timing** — RESOLVED. `SpacesStateService` is a lazy root singleton, so its subscription would not exist if no injection happened before register. Decision: add an `APP_INITIALIZER` in `app.config.ts` with `deps: [SpacesStateService]` and a no-op factory, forcing eager instantiation at bootstrap. The constructor registers the `UserRegisteredEvent` subscription before any register flow runs, so the `Subject` always has a live subscriber when `publish` is called. Rejected: (a) injecting in the register page (fragile, depends on routing/component order); (b) `ReplaySubject(1)` (leaks replay semantics into a fire-and-forget bus, risks stale redelivery).
