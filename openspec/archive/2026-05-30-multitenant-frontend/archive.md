# Archive: Multi-tenant Frontend (Spaces) — Phase 1

**Archived**: 2026-05-30
**PRs**: #39 (EventBus + auth fix) → #40 (Spaces domain) → #41 (Interceptor + routing + UI)
**Status**: Complete — CI passing

---

## Delivered

### New capabilities
- `core/shared/` layer — `EventBusService` (RxJS Subject), `DomainEvent`, `UserRegisteredEvent`
- `core/spaces/` DDD domain — full layered structure mirroring `core/auth/`
  - Domain: `Space`, `SpaceMembership` interfaces, `SpacesRepositoryPort`, injection token
  - Application: `SpacesStateService` (signals: `availableSpaces`, `currentSpace`, `isLoading`, `isResolved`)
  - Infrastructure: `SpacesHttpRepository` (TODO stubs), `ActiveSpaceStorage` (`gardenia.activeSpaceId`)
- `spaceGuard` — functional guard, lazy space resolution, redirects to `/spaces/new` when no space
- `authInterceptor` — injects `X-Space-ID` header from active space signal, skips `/auth/` paths
- Authenticated shell layout + routes `/spaces` and `/spaces/new`
- `SpaceListPage`, `SpaceCreatePage`
- Header updated to show active space name

### Bug fixes
- `POST /auth/register` response typed as `void` — now correctly captures `{ spaceId }` and publishes `UserRegisteredEvent`

---

## Key decisions

| Decision | Choice | Why |
|----------|--------|-----|
| Cross-context decoupling | EventBus pattern | `core/auth` and `core/spaces` must not import each other |
| EventBus subscriber timing | `provideAppInitializer(() => inject(SpacesStateService))` | Eager singleton ensures subscription is active before register flow |
| Space persistence | `localStorage` key `gardenia.activeSpaceId` | Survives page reload |
| Init sequence | `spaceGuard` triggers `loadSpaces()` lazily | No `APP_INITIALIZER` bootstrap penalty for unauthenticated users |
| HTTP stubs | `throwError(() => new Error('TODO'))` | Compile-ready until API REST controller ships |

---

## Known limitations

- All HTTP calls in `SpacesHttpRepository` are TODO stubs — pending API `SpacesModule` REST controller
- No space switcher UI (Phase 2)
- No member management (Phase 2)
- `POST /auth/register` spaceId captured but spaces list only loads from API on first protected route hit

---

## Phase 2 scope (not yet scheduled)

- Space switcher dropdown in header
- Member management: add/remove/roles
- Space settings page
- Real HTTP implementation once API endpoints ship

---

## Files created (new)

```
src/app/core/shared/domain/domain-event.interface.ts
src/app/core/shared/domain/events/user-registered.event.ts
src/app/core/shared/infrastructure/event-bus.service.ts
src/app/core/shared/infrastructure/event-bus.service.spec.ts
src/app/core/spaces/domain/interfaces/space.interface.ts
src/app/core/spaces/domain/interfaces/space-membership.interface.ts
src/app/core/spaces/domain/ports/spaces.repository.port.ts
src/app/core/spaces/domain/tokens/spaces-repository.token.ts
src/app/core/spaces/application/services/spaces-state/spaces-state.service.ts
src/app/core/spaces/application/services/spaces-state/spaces-state.service.spec.ts
src/app/core/spaces/infrastructure/storage/active-space.storage.ts
src/app/core/spaces/infrastructure/repositories/spaces-http.repository.ts
src/app/core/spaces/presentation/guards/space/space.guard.ts
src/app/core/spaces/presentation/guards/space/space.guard.spec.ts
src/app/core/spaces/presentation/layouts/shell/shell.layout.ts
src/app/core/spaces/presentation/pages/space-list/space-list.page.ts
src/app/core/spaces/presentation/pages/space-create/space-create.page.ts
src/app/core/auth/infrastructure/interceptors/auth.interceptor.spec.ts
```

## Files modified

```
src/app/core/auth/domain/interfaces/auth-response.interface.ts
src/app/core/auth/application/ports/auth.repository.port.ts
src/app/core/auth/infrastructure/repositories/auth-http.repository.ts
src/app/core/auth/application/services/register/register.service.ts
src/app/core/auth/application/services/register/register.service.spec.ts
src/app/core/auth/infrastructure/interceptors/auth.interceptor.ts
src/app/app.config.ts
src/app/app.routes.ts
src/app/shared/presentation/components/header/header.ts
src/app/shared/presentation/components/header/header.html
src/app/shared/presentation/components/header/header.spec.ts
src/app/app.spec.ts
```
