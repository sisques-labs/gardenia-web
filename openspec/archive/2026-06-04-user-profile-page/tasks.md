# Tasks: user-profile-page

## Workload

| Field | Value |
|-------|-------|
| Changed lines | ~650 (all new files + 3 modified) |
| PRs | 1 |

---

## Domain

- [x] `src/core/users/domain/interfaces/user.interface.ts` — `User` domain model

## Application

- [x] `src/core/users/application/interfaces/update-user-input.interface.ts` — `UpdateUserInput`
- [x] `src/core/users/application/ports/users.repository.port.ts` — `IUsersRepository`
- [x] `src/core/users/application/use-cases/get-user/get-user.use-case.ts` — `GetUserUseCase`
- [x] `src/core/users/application/use-cases/update-user/update-user.use-case.ts` — `UpdateUserUseCase`; imports `UpdateUserInput` directly from its interface file

## Infrastructure

- [x] `src/core/users/infrastructure/repositories/graphql/queries/user-find-by-id.query.ts`
- [x] `src/core/users/infrastructure/repositories/graphql/mutations/user-update.mutation.ts`
- [x] `src/core/users/infrastructure/repositories/graphql/responses/user-find-by-id.response.ts`
- [x] `src/core/users/infrastructure/repositories/graphql/responses/user-update.response.ts`
- [x] `src/core/users/infrastructure/repositories/graphql/users.gql.repository.ts` — `fetchPolicy: 'network-only'`

## Presentation — Hooks

- [x] `src/core/users/presentation/hooks/use-user/use-user.hook.ts`
- [x] `src/core/users/presentation/hooks/use-update-user/use-update-user.hook.ts`
- [x] `src/core/users/presentation/hooks/use-update-user-profile-form/use-update-user-profile-form.hook.ts`
- [x] `src/core/users/presentation/hooks/use-user-initials/use-user-initials.hook.ts`

## Presentation — i18n + Schema

- [x] `src/core/users/presentation/i18n/en.ts`
- [x] `src/core/users/presentation/i18n/es.ts`
- [x] `src/core/users/presentation/i18n/i18n-parity.test.ts`
- [x] `src/core/users/presentation/schemas/update-user-profile.schema.ts`

## Presentation — Screen

- [x] `src/core/users/presentation/screens/user-profile/user-profile.screen.tsx` — `'use client'`; `ProfileSkeleton`; `fieldError()` helper; no logic in component

## Route

- [x] `app/[lang]/(protected)/profile/page.tsx`

## Shared UI

- [x] `src/shared/presentation/components/ui/avatar.tsx` — shadcn `Avatar/AvatarImage/AvatarFallback`
- [x] `src/shared/presentation/components/ui/form-field.tsx` — `FormField`

## Modified

- [x] `src/shared/presentation/i18n/get-dictionary.ts` — added `users` key to `AppDict`
- [x] `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` — added Profile nav entry
- [x] `package.json` — added `@radix-ui/react-avatar`
- [x] `pnpm-lock.yaml` — updated
