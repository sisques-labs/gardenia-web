# Design: space-settings-management

## Routing

```
app/[lang]/(protected)/settings/page.tsx   ← Server Component, pasa dict + lang + spaceId
```

La página vive dentro de `(protected)` — la misma shell protegida con AppShell + SpacesProviders. El `currentSpaceId` ya está en el store; no hace falta cabecera especial.

## Sidebar footer

`sidebar-footer.tsx` tiene el ítem Settings con `disabled`. Se reemplaza por:

```tsx
<DropdownMenuItem asChild>
  <Link href={`/${locale}/settings`} onClick={onNavigate}>
    <Settings className="h-4 w-4" />
    {dict.userMenu.settings}
  </Link>
</DropdownMenuItem>
```

Sin más cambios en la shell.

## Layering

```
app/[lang]/(protected)/settings/page.tsx          Server — locale, dict, spaceId from store not available server-side
  └─ SpaceSettingsScreen                           Client — lee currentSpaceId del store
       ├─ useSpaceDetail(spaceId)                  TanStack Query (query)
       │    └─ GetSpaceDetailUseCase
       │         └─ spacesGqlRepository.findById(id)
       ├─ useCreateInvitation()                    TanStack mutation
       │    └─ CreateSpaceInvitationUseCase
       │         └─ spacesGqlRepository.createInvitation(input)
       ├─ useAddMember()                           TanStack mutation
       │    └─ AddSpaceMemberUseCase
       │         └─ spacesGqlRepository.addMember(input)
       └─ useRemoveMember()                        TanStack mutation
            └─ RemoveSpaceMemberUseCase
                 └─ spacesGqlRepository.removeMember(input)
```

## Domain

### Interfaces nuevas / ampliadas

```ts
// domain/interfaces/space-detail.interface.ts  (nuevo)
export interface SpaceDetail {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt?: string;
}

// domain/interfaces/space-invitation.interface.ts  (nuevo)
export interface SpaceInvitation {
  id: string;
  displayCode: string;
  code: string;
  qrId: string | null;
  expiresAt: string;
  role: 'owner' | 'member';
  spaceId: string;
}
```

`Space` (existente en `space.interface.ts`) ya tiene `id`, `name`, `ownerId`, `createdAt` — se reutiliza.

## Application

### Ports — ampliación de `ISpacesRepository`

```ts
findById(spaceId: string): Promise<SpaceDetail>;
createInvitation(input: { spaceId: string; role?: 'owner' | 'member'; expiresAt?: Date }): Promise<SpaceInvitation>;
addMember(input: { spaceId: string; targetUserId: string }): Promise<void>;
removeMember(input: { spaceId: string; targetUserId: string }): Promise<void>;
```

### Use-cases nuevos

| Archivo | Clase | Input |
|---|---|---|
| `application/use-cases/get-space-detail/get-space-detail.use-case.ts` | `GetSpaceDetailUseCase` | `{ spaceId: string }` |
| `application/use-cases/create-space-invitation/create-space-invitation.use-case.ts` | `CreateSpaceInvitationUseCase` | `{ spaceId, role?, expiresAt? }` |
| `application/use-cases/add-space-member/add-space-member.use-case.ts` | `AddSpaceMemberUseCase` | `{ spaceId, targetUserId }` |
| `application/use-cases/remove-space-member/remove-space-member.use-case.ts` | `RemoveSpaceMemberUseCase` | `{ spaceId, targetUserId }` |

Cada use-case sigue el patrón actual: clase con `constructor(private repo: ISpacesRepository)`, método `execute(input)`, exportada como singleton (`export const getSpaceDetailUseCase = new GetSpaceDetailUseCase(spacesGqlRepository)`).

## Infrastructure

### GQL queries nuevas

```
infrastructure/repositories/graphql/queries/space-find-by-id.query.ts
```

```graphql
query SpaceFindById($input: SpaceFindByIdRequestDto!) {
  spaceFindById(input: $input) {
    id
    name
    ownerId
    createdAt
    updatedAt
  }
}
```

### GQL mutations nuevas

```
infrastructure/repositories/graphql/mutations/space-create-invitation.mutation.ts
infrastructure/repositories/graphql/mutations/space-add-member.mutation.ts
infrastructure/repositories/graphql/mutations/space-remove-member.mutation.ts
```

```graphql
# space-create-invitation
mutation SpaceCreateInvitation($input: SpaceCreateInvitationRequestDto!) {
  spaceCreateInvitation(input: $input) {
    id
    displayCode
    code
    qrId
    expiresAt
    role
    spaceId
  }
}

# space-add-member
mutation SpaceAddMember($input: SpaceAddMemberRequestDto!) {
  spaceAddMember(input: $input) {
    id
    success
    message
  }
}

# space-remove-member
mutation SpaceRemoveMember($input: SpaceRemoveMemberRequestDto!) {
  spaceRemoveMember(input: $input) {
    id
    success
    message
  }
}
```

### `SpacesGqlRepository` — métodos nuevos

```ts
async findById(spaceId: string): Promise<SpaceDetail>
async createInvitation(input): Promise<SpaceInvitation>
async addMember(input): Promise<void>
async removeMember(input): Promise<void>
```

## Presentation

### Hooks

| Archivo | Wraps |
|---|---|
| `hooks/use-space-detail/useSpaceDetail.hook.ts` | `useQuery` → `GetSpaceDetailUseCase` |
| `hooks/use-create-invitation/useCreateInvitation.hook.ts` | `useMutation` → `CreateSpaceInvitationUseCase` |
| `hooks/use-add-member/useAddMember.hook.ts` | `useMutation` → `AddSpaceMemberUseCase` |
| `hooks/use-remove-member/useRemoveMember.hook.ts` | `useMutation` → `RemoveSpaceMemberUseCase` |

### Schemas (Zod)

```
presentation/schemas/add-member.schema.ts          { targetUserId: z.string().uuid() }
presentation/schemas/create-invitation.schema.ts   { role: z.enum(['owner','member']).default('member'), expiresAt: z.string().datetime().optional() }
```

### Screen: `SpaceSettingsScreen`

```
presentation/screens/space-settings/space-settings.screen.tsx
presentation/screens/space-settings/space-settings.screen.test.tsx
```

Secciones de la pantalla:

```
┌─────────────────────────────────┐
│  ScreenHeader "Ajustes del espacio"  │
├─────────────────────────────────┤
│  [Card] Detalles                │
│    Nombre · Owner · Creado el   │
├─────────────────────────────────┤
│  [Card] Crear invitación (owner only) │
│    Select rol · DatePicker expiración  │
│    [Botón Crear]                │
│    ── resultado ──              │
│    Código: XXXXXX  [Copiar]     │
│    QR image (si qrId)           │
│    Enlace de invitación  [Copiar link] │
├─────────────────────────────────┤
│  [Card] Miembros                │
│    <InDevelopment /> (pending API) │
│    ── acciones del owner ──     │
│    Añadir por userId [Form]     │
│    Eliminar por userId [Form + confirmación] │
└─────────────────────────────────┘
```

- Solo el owner ve las secciones de invitación y gestión de miembros (`currentUser.userId === spaceDetail.ownerId`).
- La imagen QR se obtiene del endpoint REST `/qrs/:qrId/image` via `src/app/api/[...path]/route.ts` (proxy ya existente). Se muestra con `<Image src={/api/qrs/${qrId}/image} />`.

### i18n

Nuevas claves en `spaces.settings` (en `en.ts` / `es.ts`):

```ts
settings: {
  title: 'Space settings',
  details: { title, name, owner, createdAt },
  invitation: { title, roleLabel, expiresLabel, submit, submitting, code, copyCode, copyLink, qrHint },
  members: { title, pendingApi, addTitle, addUserId, addSubmit, addSubmitting, removeTitle, removeUserId, removeSubmit, removeSubmitting, confirmRemove },
  errors: { loadFailed, invitationFailed, addFailed, removeFailed },
}
```

## Decisiones de arquitectura

| Decisión | Rationale |
|---|---|
| Settings bajo `(protected)` | Ya existe la shell protegida; no hace falta nuevo layout |
| Members list como `<InDevelopment />` | El view-model de la API no expone miembros todavía — evitamos añadir deuda técnica en el frontend atando-lo a datos no disponibles |
| Add/Remove member por userId (no email) | La mutación GQL acepta `targetUserId`. Mostrar un input UUID es suficiente para el MVP; búsqueda por email puede venir después |
| QR image via proxy REST | Los QR se generan en gardenia-api y se sirven como PNG. El proxy `/api/[...path]` ya retransmite peticiones REST autenticadas; reutilizarlo es lo más simple |
| `spaceCreateInvitation` sin caducidad por defecto | El campo `expiresAt` es opcional en la API; en el formulario se ofrece con un date-picker opcional |
