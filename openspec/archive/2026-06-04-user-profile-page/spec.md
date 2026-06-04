# Spec: User Profile Page

**Change**: user-profile-page
**Phase**: spec
**Date**: 2026-06-04
**Status**: done

---

## 1. Overview

This spec describes the user profile page added to `gardenia-web`. It is a web-only change — the `gardenia-api` already exposes `userFindById` and `userUpdate` GraphQL operations that satisfy all data requirements.

---

## 2. Route

- The profile page MUST be available at `/[lang]/profile`.
- The route MUST be protected — unauthenticated users MUST be redirected to login by the existing auth guard in the `(protected)` layout.
- `[lang]` MUST be resolved via the existing locale detection logic (`isLocale` + `DEFAULT_LOCALE`).

---

## 3. Navigation

- A **Profile** entry MUST appear in the sidebar navigation.
- The entry MUST use the `User` icon from `lucide-react`, consistent with other nav items.

---

## 4. Profile Header

**Given** an authenticated user navigates to `/[lang]/profile`
**When** the page loads
**Then** the following MUST be displayed above the form:
- Avatar: `AvatarImage` with `src={user.avatarUrl}` when set; `AvatarFallback` with computed initials otherwise
- `@username` in semibold
- Member-since date formatted via `toLocaleDateString(lang)`

**Given** the profile data is loading
**When** the page renders before the query resolves
**Then** a skeleton placeholder (`ProfileSkeleton`) MUST be shown

---

## 5. Editable Fields

The profile form MUST allow editing the following fields:

| Field | Required | Validation |
|-------|----------|------------|
| `username` | Yes | min 3, max 30 characters |
| `firstName` | No | nullable |
| `lastName` | No | nullable |
| `avatarUrl` | No | nullable |
| `bio` | No | max 500 characters; nullable |
| `locale` | No | nullable; placeholder: `e.g. en-US` |
| `timezone` | No | nullable; placeholder: `e.g. America/New_York` |

`status` MUST NOT be editable from the profile page.

---

## 6. Form Behaviour

**Given** the profile data has loaded
**When** the form renders
**Then** all fields MUST be pre-populated with the current user values

**Given** the user changes one or more fields and submits
**When** all validation passes
**Then** `userUpdate` MUST be called with the updated values
**And** on success a success message MUST appear inline
**And** `queryClient.invalidateQueries(['user', id])` MUST be called so the form reflects the saved state

**Given** `username` is shorter than 3 characters
**When** the user submits the form
**Then** a localised validation error MUST appear beneath the field
**And** the mutation MUST NOT be called

**Given** `bio` exceeds 500 characters
**When** the user submits the form
**Then** a localised validation error MUST appear beneath the field
**And** the mutation MUST NOT be called

**Given** the mutation fails
**When** the server responds with an error
**Then** a generic error message MUST appear inline

---

## 7. Apollo Cache

**Given** the user saves their profile
**When** `userUpdate` succeeds and React Query refetches
**Then** the Apollo query MUST bypass the cache (`fetchPolicy: 'network-only'`) and always return the latest server state

---

## 8. i18n

- All user-visible strings MUST come from the `users` key in `AppDict`.
- English and Spanish translations MUST exist.
- Key parity MUST be enforced by `i18n-parity.test.ts`.

---

## 9. Out of Scope

- Password change / security settings
- Avatar file upload
- Admin user management
- `usersFindByCriteria` (listing/searching users)
- `userDelete`
