# Proposal: User Profile Page

## Intent

Implement a user profile page so that authenticated users can view and edit their own profile data (`username`, `firstName`, `lastName`, `avatarUrl`, `bio`, `locale`, `timezone`). The `gardenia-api` already exposes `userFindById` and `userUpdate` GraphQL operations — no backend changes are needed.

## Scope

### In Scope

- A new `users` module at `src/core/users/` following the existing clean-architecture convention: domain → application (use-cases + ports) → infrastructure (GQL repositories) → presentation (hooks + screens).
- A protected route at `/[lang]/profile` rendered by the existing App Router `(protected)` layout.
- A sidebar navigation entry for the profile page.
- Full i18n support (en / es) consistent with the existing dictionary pattern.
- Two shared UI components: `FormField` and `Avatar` (shadcn/ui + Radix UI) added to `src/shared/presentation/components/ui/`.

### Out of Scope

- Backend changes — `userFindById` and `userUpdate` are already implemented in the API.
- Password change / account security settings.
- Avatar file upload (URL input only).
- Admin-level user management (status, roles).

## Capabilities

### New Capabilities

- **User profile view + edit**: authenticated user can see and save all editable profile fields.

## Approach

Reuse the clean-architecture layer convention established for the `auth`, `spaces`, and `plants` modules:
- Domain `User` interface mirrors the API `UserResponseDto` (dates typed as `string` because GraphQL serialises `Date` scalars as ISO strings).
- Application use-cases (`GetUserUseCase`, `UpdateUserUseCase`) depend on the `IUsersRepository` port.
- Infrastructure `UsersGqlRepository` implements the port via Apollo Client with `fetchPolicy: 'network-only'` to prevent stale cache after mutation.
- Presentation exposes three hooks: `useUser` (TanStack React Query), `useUpdateUser` (`useMutation` + invalidate), and `useUpdateUserProfileForm` (react-hook-form + zod, resets on data load).
- Screen component holds no logic — all behaviour delegated to hooks; shared `FormField` + `Avatar` components keep markup thin.

## Affected Areas

| Area | Impact |
|------|--------|
| `src/core/users/` | New — full clean-arch stack |
| `app/[lang]/(protected)/profile/page.tsx` | New — App Router page |
| `src/shared/presentation/components/ui/avatar.tsx` | New — shadcn Avatar |
| `src/shared/presentation/components/ui/form-field.tsx` | New — shared form field wrapper |
| `src/shared/presentation/i18n/get-dictionary.ts` | Modified — added `users` dict key |
| `src/shared/presentation/components/sidebar-nav-items/nav-items.ts` | Modified — added Profile nav entry |
| `package.json` / `pnpm-lock.yaml` | Modified — added `@radix-ui/react-avatar` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Apollo cache-first serving stale data after mutation | High | `fetchPolicy: 'network-only'` on `getById` |
| Form showing old values after save | Med | `queryClient.invalidateQueries` on mutation success |
| `@radix-ui/react-avatar` missing from lockfile | Low | Added to `package.json`; lockfile updated |

## Rollback Plan

All changes are additive. Removing the `profile` route and `users` module has zero impact on existing routes or modules.

## Success Criteria

- [x] Profile page loads and displays current user data.
- [x] Editing fields and saving calls `userUpdate` and refreshes the form.
- [x] TypeScript strict-mode passes with no errors.
- [x] i18n parity test (en/es key symmetry) passes.
- [x] CI lint + type-check green.
