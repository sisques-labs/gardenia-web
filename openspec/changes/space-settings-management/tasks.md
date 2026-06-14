# Tasks: space-settings-management

## Phase 1 — Domain & Port

- [ ] **T-1** — Crear `src/core/spaces/domain/interfaces/space-detail.interface.ts` con `SpaceDetail`
- [ ] **T-2** — Crear `src/core/spaces/domain/interfaces/space-invitation.interface.ts` con `SpaceInvitation`
- [ ] **T-3** — Ampliar `ISpacesRepository` en `application/ports/spaces.repository.port.ts` con los 4 métodos nuevos: `findById`, `createInvitation`, `addMember`, `removeMember`

## Phase 2 — Infrastructure (GQL)

- [ ] **T-4** — `infrastructure/repositories/graphql/queries/space-find-by-id.query.ts` con el documento `SpaceFindById`
- [ ] **T-5** — `infrastructure/repositories/graphql/mutations/space-create-invitation.mutation.ts`
- [ ] **T-6** — `infrastructure/repositories/graphql/mutations/space-add-member.mutation.ts`
- [ ] **T-7** — `infrastructure/repositories/graphql/mutations/space-remove-member.mutation.ts`
- [ ] **T-8** — Implementar los 4 métodos nuevos en `SpacesGqlRepository` (`spaces.gql.repository.ts`)
- [ ] **T-9** — Tests unitarios para los 4 métodos nuevos en `spaces.gql.repository.spec.ts` (mock `apolloClient`)

## Phase 3 — Application (Use-cases)

- [ ] **T-10** — `application/use-cases/get-space-detail/get-space-detail.use-case.ts` + `.spec.ts`
- [ ] **T-11** — `application/use-cases/create-space-invitation/create-space-invitation.use-case.ts` + `.spec.ts`
- [ ] **T-12** — `application/use-cases/add-space-member/add-space-member.use-case.ts` + `.spec.ts`
- [ ] **T-13** — `application/use-cases/remove-space-member/remove-space-member.use-case.ts` + `.spec.ts`

## Phase 4 — Presentation (Hooks, Schemas, i18n)

- [ ] **T-14** — `presentation/hooks/use-space-detail/useSpaceDetail.hook.ts` + `.spec.ts`
- [ ] **T-15** — `presentation/hooks/use-create-invitation/useCreateInvitation.hook.ts` + `.spec.ts`
- [ ] **T-16** — `presentation/hooks/use-add-member/useAddMember.hook.ts` + `.spec.ts`
- [ ] **T-17** — `presentation/hooks/use-remove-member/useRemoveMember.hook.ts` + `.spec.ts`
- [ ] **T-18** — `presentation/schemas/create-invitation.schema.ts` (Zod: `role`, `expiresAt?`)
- [ ] **T-19** — `presentation/schemas/add-member.schema.ts` (Zod: `targetUserId` UUID)
- [ ] **T-20** — Añadir clave `settings` en `presentation/i18n/en.ts` y `es.ts`; actualizar `i18n-parity.test.ts`

## Phase 5 — Screen

- [ ] **T-21** — `presentation/screens/space-settings/space-settings.screen.tsx` con las secciones:
  - Card Detalles (nombre, owner, createdAt)
  - Card Crear invitación (solo owner): formulario role + expiresAt opcional, resultado con código / link / QR
  - Card Miembros: `<InDevelopment />` para la lista + formularios add/remove por userId (solo owner)
- [ ] **T-22** — `presentation/screens/space-settings/space-settings.screen.test.tsx`

## Phase 6 — Routing & Sidebar

- [ ] **T-23** — `app/[lang]/(protected)/settings/page.tsx` (Server Component; pasa `dict.spaces.settings` y `lang`)
- [ ] **T-24** — Activar enlace Settings en `sidebar-footer.tsx`: eliminar `disabled`, añadir `<Link href={/${locale}/settings}>` como los otros ítems del menú

## Phase 7 — Verify

- [ ] **T-25** — `pnpm test` (todos los tests nuevos en verde; i18n parity pasa)
- [ ] **T-26** — `pnpm tsc --noEmit` sin errores
- [ ] **T-27** — `pnpm lint` sin warnings
- [ ] **T-28** — Smoke manual: crear invitación, copiar código/link, probar add member con UUID válido
