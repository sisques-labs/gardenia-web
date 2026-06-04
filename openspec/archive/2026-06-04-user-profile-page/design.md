# Design: user-profile-page

> Technical design for the `users` module in `gardenia-web`. No API-side changes.

---

## 1. Module Structure

```
src/core/users/
├─ domain/
│  └─ interfaces/
│     └─ user.interface.ts
├─ application/
│  ├─ interfaces/
│  │  └─ update-user-input.interface.ts
│  ├─ ports/
│  │  └─ users.repository.port.ts          # IUsersRepository
│  └─ use-cases/
│     ├─ get-user/get-user.use-case.ts
│     └─ update-user/update-user.use-case.ts
├─ infrastructure/
│  └─ repositories/graphql/
│     ├─ queries/user-find-by-id.query.ts
│     ├─ mutations/user-update.mutation.ts
│     ├─ responses/user-find-by-id.response.ts
│     ├─ responses/user-update.response.ts
│     └─ users.gql.repository.ts
└─ presentation/
   ├─ hooks/
   │  ├─ use-user/use-user.hook.ts
   │  ├─ use-update-user/use-update-user.hook.ts
   │  ├─ use-update-user-profile-form/use-update-user-profile-form.hook.ts
   │  └─ use-user-initials/use-user-initials.hook.ts
   ├─ i18n/
   │  ├─ en.ts
   │  ├─ es.ts
   │  └─ i18n-parity.test.ts
   ├─ schemas/
   │  └─ update-user-profile.schema.ts
   └─ screens/
      └─ user-profile/user-profile.screen.tsx
```

---

## 2. Domain Model

`createdAt`/`updatedAt` are typed as `string` because GraphQL serialises `Date` scalars as ISO strings before reaching the client. The rest of the fields match the API `UserResponseDto` exactly.

---

## 3. Apollo Cache Strategy

**Problem:** Apollo's default `cache-first` policy returns the cached user object after `userUpdate`, causing the form to display stale values even after React Query invalidates and refetches.

**Decision:** `fetchPolicy: 'network-only'` on every `getById()` call. This forces a fresh network request on every refetch, guaranteeing the form always shows the latest server state.

---

## 4. Presentation Data Flow

```
useAuthStore(currentUser.id)
  └─> useUser(id)                         [React Query]
        └─> GetUserUseCase → UsersGqlRepository.getById()   [network-only]

useUpdateUserProfileForm(user)
  ├─ useForm({ resolver: zodResolver })
  ├─ useEffect([user]) → form.reset(...)  // fills form when async data arrives
  └─ onSubmit → useUpdateUser.mutate(input)
                  └─> UpdateUserUseCase → UsersGqlRepository.update()
                  onSuccess → queryClient.invalidateQueries(['user', id])
```

---

## 5. Shared UI Components

### FormField (`src/shared/presentation/components/ui/form-field.tsx`)

Composition pattern — `children` prop supports both `<Input>` and `<textarea>` from a single wrapper, avoiding parallel `InputField`/`TextareaField` variants.

```typescript
interface FormFieldProps {
  label: ReactNode;   // ReactNode allows icon + label combos
  error?: string;
  children: ReactNode;
  className?: string;
}
```

### Avatar (`src/shared/presentation/components/ui/avatar.tsx`)

Standard shadcn/ui pattern via `@radix-ui/react-avatar`. Radix handles image-load-failure and shows `AvatarFallback` (initials) automatically. Three exports: `Avatar`, `AvatarImage`, `AvatarFallback`.

### useUserInitials

Extracted to its own hook (not inlined in the screen) to keep the screen free of logic:

```
firstName[0] + lastName[0]  (when both present)
  OR username[0]             (fallback)
```

---

## 6. ADR Summary

| # | Decision | Rejected alternative | Why |
|---|----------|----------------------|-----|
| 1 | `fetchPolicy: 'network-only'` | Apollo default `cache-first` | Cache returns stale data after mutation |
| 2 | `useEffect([user])` → `form.reset()` | Pre-set defaults at query time | Async data arrives after form mounts; `reset` is the correct RHF pattern |
| 3 | `useUserInitials` hook | Inline in screen | Screen must have minimal/no logic (project convention) |
| 4 | `FormField` children composition | Separate `InputField`/`TextareaField` | One component for all field types without duplication |
| 5 | shadcn `Avatar` / Radix UI | Custom `div` + `Image` | Native fallback handling; consistent with shadcn component set |
| 6 | `UpdateUserInput` imported directly from its interface file | Re-exported from port | Ports must not re-export types from other modules |
