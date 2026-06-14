# Tasks: space-settings-management

## Phase 1 — Domain & Port

- [x] **T-1** — Crear `src/core/spaces/domain/interfaces/space-detail.interface.ts` con `SpaceDetail`
- [x] **T-2** — Crear `src/core/spaces/domain/interfaces/space-invitation.interface.ts` con `SpaceInvitation`
- [x] **T-3** — Ampliar `ISpacesRepository` en `application/ports/spaces.repository.port.ts` con los 4 métodos nuevos: `findById`, `createInvitation`, `addMember`, `removeMember`

## Phase 2 — Infrastructure (GQL)

- [x] **T-4** — `infrastructure/repositories/graphql/queries/space-find-by-id.query.ts` con el documento `SpaceFindById`
- [x] **T-5** — `infrastructure/repositories/graphql/mutations/space-create-invitation.mutation.ts`
- [x] **T-6** — `infrastructure/repositories/graphql/mutations/space-add-member.mutation.ts`
- [x] **T-7** — `infrastructure/repositories/graphql/mutations/space-remove-member.mutation.ts`
- [x] **T-8** — Implementar los 4 métodos nuevos en `SpacesGqlRepository` (`spaces.gql.repository.ts`)
- [x] **T-9** — Tests unitarios para los 4 métodos nuevos en `spaces.gql.repository.spec.ts` (mock `apolloClient`)

## Phase 3 — Application (Use-cases)

- [x] **T-10** — `application/use-cases/get-space-detail/get-space-detail.use-case.ts` + `.spec.ts`
- [x] **T-11** — `application/use-cases/create-space-invitation/create-space-invitation.use-case.ts` + `.spec.ts`
- [x] **T-12** — `application/use-cases/add-space-member/add-space-member.use-case.ts` + `.spec.ts`
- [x] **T-13** — `application/use-cases/remove-space-member/remove-space-member.use-case.ts` + `.spec.ts`

## Phase 4 — Presentation (Hooks, Schemas, i18n)

- [x] **T-14** — `presentation/hooks/use-space-detail/useSpaceDetail.hook.ts` + `.spec.ts`
- [x] **T-15** — `presentation/hooks/use-create-invitation/useCreateInvitation.hook.ts` + `.spec.ts`
- [x] **T-16** — `presentation/hooks/use-add-member/useAddMember.hook.ts` + `.spec.ts`
- [x] **T-17** — `presentation/hooks/use-remove-member/useRemoveMember.hook.ts` + `.spec.ts`
- [x] **T-18** — `presentation/schemas/create-invitation.schema.ts` (Zod: `role`, `expiresAt?`)
- [x] **T-19** — `presentation/schemas/add-member.schema.ts` (Zod: `targetUserId` UUID)
- [x] **T-20** — Añadir clave `settings` en `presentation/i18n/en.ts` y `es.ts`; actualizar `i18n-parity.test.ts`

## Phase 5 — Screen

- [x] **T-21** — `presentation/screens/space-settings/space-settings.screen.tsx` con las secciones:
  - Card Detalles (nombre, owner, createdAt)
  - Card Crear invitación (solo owner): formulario role + expiresAt opcional, resultado con código / link / QR
  - Card Miembros: `<InDevelopment />` para la lista + formularios add/remove por userId (solo owner)
- [x] **T-22** — `presentation/screens/space-settings/space-settings.screen.test.tsx`

## Phase 6 — Routing & Sidebar

- [x] **T-23** — `app/[lang]/(protected)/settings/page.tsx` (Server Component; pasa `dict.spaces.settings` y `lang`)
- [x] **T-24** — Activar enlace Settings en `sidebar-footer.tsx`: eliminar `disabled`, añadir `<Link href={/${locale}/settings}>` como los otros ítems del menú

## Phase 7 — Verify

- [x] **T-25** — `pnpm test` (todos los tests nuevos en verde; i18n parity pasa)
- [x] **T-26** — `pnpm tsc --noEmit` sin errores
- [x] **T-27** — `pnpm lint` sin warnings
- [ ] **T-28** — Smoke manual: crear invitación, copiar código/link, probar add member con UUID válido
