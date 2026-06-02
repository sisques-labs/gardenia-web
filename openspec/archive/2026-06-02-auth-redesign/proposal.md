# Proposal: auth-redesign

## Intent

Las pantallas de auth actuales (login, register) son cards shadcn centradas, sin identidad de marca Gardenia. El diseño de referencia (`auth.jsx`) define un split de dos columnas con panel de marca (forest gradient + grain + logo + AuthNotebook + quote), shell móvil tipo iPhone, y un set de componentes atómicos editoriales. Este cambio reemplaza la UI plana por el diseño de marca, agrega la pantalla forgot-password (inexistente) y normaliza los componentes auth como piezas cohesivas del módulo. Todos los tokens y fuentes ya existen en el design system, así que el trabajo es de presentación, no de fundaciones.

## Scope

### In Scope
- `(auth)/layout.tsx` compartido: AuthDesktopShell (split dos columnas) + AuthMobileShell (iPhone shell), con AuthBrandPanel + AuthNotebook.
- Componentes atómicos en `src/core/auth/presentation/components/`: AuthField, AuthHead, AuthSocial (visual), AuthDivider, AuthSubmit, AuthLegal, PwStrength, AuthBrandPanel, AuthNotebook.
- Rediseño completo de login.screen y register.screen contra el diseño de referencia.
- Nueva ruta + screen `forgot-password` (use client) con su flujo completo.
- `forgotPassword(email)` en IAuthRepository + impl HTTP (`POST /auth/forgot-password`) + use case RED-first + hook + Zod schema.
- Claves i18n `forgotPassword` en `en.ts` y `es.ts` (paridad).
- Brand icons Apple/Google como SVG inline (sin dependencias nuevas).
- Tests RED-first para todo componente/pantalla/use-case nuevo (Strict TDD).

### Out of Scope
- Social auth funcional (OAuth): botones SOLO visuales, estado "coming soon".
- Campo `name` en register: NO se agrega (solo email + password).
- Backend `/auth/forgot-password`: se asume contrato; este cambio solo lo consume.
- Checkbox "mantener sesión": visual, sin persistencia adicional de comportamiento.

## Capabilities

### New Capabilities
- `auth-ui`: pantallas y componentes de presentación del módulo auth (login, register, forgot-password, shells, átomos).
- `forgot-password`: flujo de solicitud de reseteo de contraseña (port, use case, hook, schema, screen).

### Modified Capabilities
- None (no hay specs previos en `openspec/specs/`).

## Approach

Approach 1 de la exploración: layout de grupo `(auth)` para el shell compartido + componentes atómicos privados del módulo en `presentation/components/`. Razones: el split y el panel de marca se comparten entre las 3 pantallas (lugar natural en App Router); los componentes son auth-specific y no pertenecen a `shared/ui` (que es para átomos agnósticos shadcn); sigue el patrón Screaming Architecture del codebase. Reutilizar clases CSS existentes (`.paper-grain`, `.eyebrow`, `.headline`, `.cbox`, `.hand-underline`) y tokens del theme. Brand icons inline como pequeños componentes SVG. forgot-password se modela como vertical slice completa (domain→app→infra→presentation) RED-first.

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `app/[lang]/(auth)/layout.tsx` | New | Shells desktop + móvil, brand panel |
| `app/[lang]/(auth)/forgot-password/page.tsx` | New | Ruta server que monta la screen |
| `app/[lang]/(auth)/{login,register}/page.tsx` | Modified | Pasar nuevas keys i18n |
| `src/core/auth/presentation/components/*` | New | 9 componentes atómicos |
| `src/core/auth/presentation/screens/{login,register}` | Modified | Rediseño completo |
| `src/core/auth/presentation/screens/forgot-password` | New | Screen use client |
| `src/core/auth/application/ports/auth.repository.port.ts` | Modified | `forgotPassword(email)` |
| `src/core/auth/application/use-cases/forgot-password` | New | Use case + spec |
| `src/core/auth/infrastructure/repositories/auth-http.repository.ts` | Modified | Impl HTTP |
| `src/core/auth/presentation/schemas/forgot-password.schema.ts` | New | Zod schema |
| `src/core/auth/presentation/hooks/use-forgot-password` | New | Hook |
| `src/core/auth/presentation/i18n/{en,es}.ts` | Modified | Claves forgotPassword |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Crear `(auth)/layout.tsx` rompe el wrapping de Providers de `[lang]/layout.tsx` | Med | Verificar composición de layouts; el group layout solo aporta shell visual |
| Endpoint `/auth/forgot-password` no existe en backend | High | Botón muestra éxito optimista / mensaje; coordinar contrato con backend |
| El cambio supera 400 líneas (PR budget) | High | Chained PRs: PR1 layout+átomos, PR2 screens+forgot-password |
| Brand SVG inline divergen del estilo lucide | Low | Encapsular en componentes, tamaño/strokeWidth consistentes |

## Rollback Plan

Cada PR es atómico y revertible por commit. PR1 (layout + componentes) no toca screens existentes hasta mergear; revert restaura cards shadcn. PR2 revert restaura login/register previos y elimina la ruta forgot-password sin afectar el backend.

## Dependencies

- Backend `/auth/forgot-password` (asumido; el flujo UI no bloquea si responde 404 — se maneja como estado).
- Tokens y fuentes: ya presentes en `theme.css` y `app/layout.tsx`.

## Success Criteria

- [ ] Login, register y forgot-password renderizan el diseño de referencia en desktop (split) y móvil (shell).
- [ ] Componentes atómicos cubiertos con tests (RED-first) y aislados.
- [ ] `forgotPassword` integrado port→infra→use-case→hook→screen con spec verde.
- [ ] Paridad i18n en/es para claves forgotPassword.
- [ ] Botones sociales visibles, sin acción ("coming soon").

## Open Questions

None — todas resueltas en la exploración y en las decisiones de scope.
