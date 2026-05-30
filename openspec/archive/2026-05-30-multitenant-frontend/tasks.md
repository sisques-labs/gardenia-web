# Tasks: Multi-tenant Frontend (Spaces) — Phase 1

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | 700–950 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1 (EventBus + auth fix) → PR 2 (spaces domain + application) → PR 3 (infrastructure + wiring + presentation) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | Shared EventBus + auth register fix | PR 1 | Base: main; self-contained; tests included |
| 2 | Spaces domain + application layer | PR 2 | Base: PR 1 branch; requires EventBus from PR 1 |
| 3 | Spaces infrastructure + wiring + presentation | PR 3 | Base: PR 2 branch; completes the slice |

---

## Phase 1: Shared EventBus Infrastructure

- [ ] 1.1 Create `src/app/core/shared/domain/domain-event.interface.ts` — `DomainEvent { readonly type: string; readonly occurredAt: Date }`
- [ ] 1.2 Create `src/app/core/shared/domain/events/user-registered.event.ts` — `UserRegisteredEvent extends DomainEvent { readonly type: 'auth.user_registered'; readonly spaceId: string }`
- [ ] 1.3 Create `src/app/core/shared/infrastructure/event-bus.service.ts` — `@Injectable({ providedIn: 'root' })`, `Subject<DomainEvent>`, `publish(event)`, typed `on<T>(type): Observable<T>` filter
- [ ] 1.4 Create `src/app/core/shared/infrastructure/event-bus.service.spec.ts` — `publish` delivers to `on`, type filter excludes non-matching events, multiple subscribers each receive independently

## Phase 2: Auth Fix — Register Response + Event Publishing

- [ ] 2.1 Modify `src/app/core/auth/domain/interfaces/auth-response.interface.ts` — add `RegisterResponse { readonly accessToken: string; readonly user: AccountUser; readonly spaceId: string }` (login interface unchanged)
- [ ] 2.2 Modify `src/app/core/auth/application/ports/auth.repository.port.ts` — change `register` return type to `Observable<RegisterResponse>`
- [ ] 2.3 Modify `src/app/core/auth/infrastructure/repositories/auth-http.repository.ts` — type `register` HTTP call as `RegisterResponse`
- [ ] 2.4 Modify `src/app/core/auth/application/services/register/register.service.ts` — inject `EventBusService`; after successful register response, publish `{ type: 'auth.user_registered', occurredAt: new Date(), spaceId }` via `eventBus.publish()`; NO import from `core/spaces`
- [ ] 2.5 Update `src/app/core/auth/application/services/register/register.service.spec.ts` — spy on `EventBusService.publish`; assert `UserRegisteredEvent` is emitted with correct `spaceId` on success; assert nothing published on failure

## Phase 3: Spaces Domain Layer

- [ ] 3.1 Create `src/app/core/spaces/domain/models/space.model.ts` — `Space { readonly id: string; readonly name: string }`
- [ ] 3.2 Create `src/app/core/spaces/domain/models/space-membership.model.ts` — `SpaceMembership { spaceId; userId; role: SpaceRole }`; `SpaceRole = 'owner' | 'admin' | 'member'`
- [ ] 3.3 Create `src/app/core/spaces/application/ports/spaces.repository.port.ts` — `ISpacesRepository { getSpacesByUser(): Observable<Space[]>; createSpace(name: string): Observable<Space> }`; `SPACES_REPOSITORY = new InjectionToken<ISpacesRepository>('SPACES_REPOSITORY')`

## Phase 4: Spaces Application Layer

- [ ] 4.1 Create `src/app/core/spaces/application/services/spaces-state/spaces-state.service.ts` — signals: `availableSpaces`, `currentSpace` (computed from `_currentSpaceId` + `availableSpaces`), `isLoading`, `isResolved`; methods: `loadSpaces()`, `setActiveSpace(id)`, `resolveFromStorage(spaces)`, `clear()`; constructor subscribes to `eventBus.on<UserRegisteredEvent>('auth.user_registered').pipe(takeUntilDestroyed()).subscribe(e => this.setActiveSpace(e.spaceId))`
- [ ] 4.2 Create `src/app/core/spaces/application/services/spaces-state/spaces-state.service.spec.ts` — test: rehydration sets `currentSpaceId`, stale storage ID falls back to first space + updates storage, no spaces → `currentSpaceId` null, `UserRegisteredEvent` via real `EventBusService` calls `setActiveSpace`

## Phase 5: Spaces Infrastructure Layer

- [ ] 5.1 Create `src/app/core/spaces/infrastructure/storage/active-space.storage.ts` — `getActiveSpaceId(): string | null`, `setActiveSpaceId(id: string): void`, `clearActiveSpaceId(): void`; key = `gardenia.activeSpaceId`
- [ ] 5.2 Create `src/app/core/spaces/infrastructure/repositories/spaces-http.repository.ts` — implements `ISpacesRepository`; both methods return `throwError(() => new Error('TODO: implement when API is ready'))`; must compile with correct types
- [ ] 5.3 Create integration test in `src/app/core/spaces/application/services/spaces-state/spaces-state.service.spec.ts` — register event published → `SpacesStateService` reacts → `localStorage` has `gardenia.activeSpaceId` with returned `spaceId`

## Phase 6: Interceptor + spaceGuard

- [ ] 6.1 Modify `src/app/core/auth/infrastructure/interceptors/auth.interceptor.ts` — inject `SpacesStateService`; add `shouldSkipSpace(req) = req.url.includes('/auth/')`; clone with `setHeaders: { 'X-Space-ID': currentSpace().id }` when not skipped and `currentSpace()` is non-null
- [ ] 6.2 Create `src/app/core/spaces/presentation/guards/space/space.guard.ts` — functional `CanActivateFn`; if `!isResolved` call `loadSpaces()` then `resolveFromStorage()`; if `currentSpaceId` non-null return `true`; else return `router.createUrlTree(['/spaces'])`
- [ ] 6.3 Create/update `src/app/core/auth/infrastructure/interceptors/auth.interceptor.spec.ts` — `HttpTestingController`: header present on non-auth request, absent on `/auth/` URLs, absent when `currentSpace()` is null
- [ ] 6.4 Create `src/app/core/spaces/presentation/guards/space/space.guard.spec.ts` — guard returns `true` when resolved+active, redirects to `/spaces` when null, calls `loadSpaces()` when `isResolved` is false

## Phase 7: App Wiring — config + routes + shell

- [ ] 7.1 Create `src/app/core/spaces/presentation/layouts/shell/shell.layout.ts` — standalone component; template: `<app-header />` + `<router-outlet />`; no business logic
- [ ] 7.2 Modify `src/app/app.config.ts` — provide `{ provide: SPACES_REPOSITORY, useClass: SpacesHttpRepository }`; add `{ provide: APP_INITIALIZER, useFactory: (_: SpacesStateService) => () => {}, deps: [SpacesStateService], multi: true }` for eager instantiation
- [ ] 7.3 Modify `src/app/app.routes.ts` — add shell route with `canActivate: [authGuard, spaceGuard]` wrapping protected children; add `/spaces` → `SpaceListPage` and `/spaces/new` → `SpaceCreatePage` as standalone lazy routes

## Phase 8: Presentation — Pages + Header

- [ ] 8.1 Create `src/app/core/spaces/presentation/pages/space-list/space-list.page.ts` — standalone; reads `availableSpaces` signal; renders list; no API required to render
- [ ] 8.2 Create `src/app/core/spaces/presentation/pages/space-create/space-create.page.ts` — standalone; reactive form with name field; calls `createSpace` on submit; no runtime error when stub throws
- [ ] 8.3 Modify `src/app/shared/presentation/components/header/header.ts` — inject `SpacesStateService`; bind `currentSpace()?.name` in template; add `aria-label` or visible label for space name
