# Design: auth-redesign

## Technical Approach

Capa de **presentación pura** sobre fundaciones ya existentes (tokens en `theme.css`, clases en `components.css`, fuentes en root layout). Se introduce un **group layout `(auth)/layout.tsx`** que aporta SOLO el shell visual (split desktop / iPhone móvil + brand panel), anidado dentro de `[lang]/layout.tsx` por lo que NO toca el wrapping de `Providers`. Los componentes son **átomos auth-specific** en `presentation/components/` (no en `shared/ui`, reservado a átomos agnósticos). `forgot-password` se construye como **vertical slice RED-first** siguiendo los patrones REALES del módulo: use case con DI del repository + hook con `@tanstack/react-query` `useMutation` + Zod schema. Tests con **Vitest** (`describe/it/expect/vi`), co-ubicados.

## Architecture Decisions

| Decisión | Opción elegida | Alternativas rechazadas | Rationale |
|----------|----------------|-------------------------|-----------|
| Responsive shell | CSS-only (Tailwind `hidden lg:flex` / `lg:hidden`) — ambos shells en DOM, uno visible por breakpoint | JS viewport detection (`useMediaQuery`) | Server-component friendly, sin hydration mismatch, sin flash. El layout puede quedar RSC. |
| Ubicación shell | `(auth)/layout.tsx` group layout | Repetir shell en cada page; HOC | App Router anida el group layout DENTRO de `[lang]/layout.tsx` → Providers intactos. Shell compartido por las 3 pantallas sin duplicar. |
| Componentes auth | `presentation/components/` privados | `shared/ui` | Screaming Architecture: son auth-specific. `shared/ui` se reserva a átomos shadcn agnósticos. |
| Patrón hook | `@tanstack/react-query` `useMutation` (igual que `useLogin`/`useRegister`) | `useState + useCallback` manual | CONSISTENCIA: el módulo YA usa react-query. El contexto inicial asumía mal el patrón. |
| PwStrength input | recibe `password: string`, computa el nivel internamente (helper puro `getPwStrength`) | recibir `level: 1-4` desde el screen | Encapsula la regla de strength en un único lugar testeable; el screen solo pasa el valor del field. |
| Estado de foco AuthField | `useState` local + `onFocus`/`onBlur`, sin `ref` forwarding | `forwardRef` + ref externa | RHF `register()` ya aporta la ref vía spread; el foco visual es estado de UI local, no necesita exponerse. |
| Brand icons social | SVG inline como **componentes locales** (`<AppleIcon/>`, `<GoogleIcon/>`) dentro de `auth-social.tsx` | constantes string; lib nueva | Cero deps nuevas; tamaño/strokeWidth consistentes; tree-shakeable. |
| AuthNotebook | SVG inline en componente React | importar `.svg` | Permite usar tokens CSS (`currentColor`/vars) y animar; sin pipeline de assets. |
| forgot-password retorno | use case retorna `Promise<void>` | `{ sent: boolean }` | El estado de éxito lo da `useMutation` (`isSuccess`). Mantiene paridad con login/register (todos `void`). |
| Estado expuesto por hook | `useMutation` nativo: `mutate`, `isPending`, `isSuccess`, `error` | máquina `status` custom | Mismo contrato que el resto del módulo; el screen lee `isSuccess`/`isPending`. |
| Backend 404 (endpoint inexistente) | **Mostrar UI de éxito optimista** salvo error de validación/red | error UI en 404 | Anti-enumeración de cuentas (no revelar si el email existe) + el backend aún no implementa el endpoint; UI no debe bloquear. El use case traga 404/4xx-not-found como éxito; solo errores de red/5xx propagan. |

## Layout Architecture

```
app/[lang]/layout.tsx        (RSC) → <Providers>  ← wrapping NO se toca
  └─ app/[lang]/(auth)/layout.tsx   (RSC) → shell visual
       ├─ <AuthDesktopShell>  className="hidden lg:grid grid-cols-2"
       │     ├─ <AuthBrandPanel> (forest gradient + .paper-grain + logo + <AuthNotebook/> + quote)
       │     └─ <section> {children} </section>
       └─ <AuthMobileShell>   className="lg:hidden"  (marco iPhone)
             └─ <section> {children} </section>
```

`{children}` es la screen (`login` | `register` | `forgot-password`). El layout es RSC: sin `'use client'`. Las screens siguen siendo client components (RHF + hooks). El brand panel es estático → puede ser RSC. Lógica responsive 100% CSS (Tailwind breakpoints), nada de JS.

## Component Architecture

```ts
// auth-field.tsx — input editorial con label flotante + error + estado foco local
interface AuthFieldProps {
  id: string;
  label: string;
  type?: 'text' | 'email' | 'password';
  placeholder?: string;
  error?: string;
  registration: UseFormRegisterReturn; // spread de RHF register('field')
}

// pw-strength.tsx — barra de fuerza; computa nivel internamente
interface PwStrengthProps { password: string; labels: Record<1|2|3|4, string>; }
// helper puro co-ubicado:
function getPwStrength(password: string): 0 | 1 | 2 | 3 | 4;

// auth-social.tsx — botones visuales "coming soon" (sin onClick activo)
interface AuthSocialProps { dict: { apple: string; google: string; soon: string }; }
// AppleIcon / GoogleIcon: componentes SVG inline locales en el mismo archivo

// auth-head.tsx
interface AuthHeadProps { eyebrow: string; title: string; }
// auth-submit.tsx
interface AuthSubmitProps { label: string; loadingLabel: string; isPending: boolean; }
// auth-divider.tsx { label: string }   auth-legal.tsx { children }
// auth-brand-panel.tsx { quote: string; author?: string }   auth-notebook.tsx (sin props)
```

## Data Flow: forgot-password

```
forgot-password.schema.ts (Zod: { email })
        │
ForgotPasswordScreen ('use client', RHF + zodResolver)
        │ onSubmit(data)
useForgotPassword()  →  useMutation({ mutationFn })
        │
ForgotPasswordUseCase.forgotPassword(email)   ← DI authHttpRepository
        │
IAuthRepository.forgotPassword(email): Promise<void>
        │
AuthHttpRepository → POST /auth/forgot-password   (404/not-found ⇒ resuelve void; 5xx/red ⇒ throw)
        │
useMutation.isSuccess ⇒ screen muestra estado "revisá tu email" (éxito optimista)
```

## Testing Strategy

| Capa | Qué se testa | Cómo (Vitest) |
|------|--------------|---------------|
| Use case | `forgotPassword` llama al repo con el email; traga 404; propaga 5xx/red | mock `IAuthRepository` con `vi.fn()` (igual que `login.use-case.spec.ts`) |
| Helper | `getPwStrength` mapea longitud/variedad → 0-4 | tabla de inputs → expects |
| Hook | `useForgotPassword` expone `mutate/isPending/isSuccess` | render hook + mock use case; `@testing-library/react` |
| Componentes | AuthField (label/error/foco), PwStrength (nivel visible), AuthSubmit (estado pending) | render + `user-event`; `@testing-library/react` |
| Schema | email inválido falla, válido pasa | parse directo |

**NO se testa**: SVG puro (AuthNotebook, icons), clases CSS, brand panel estático, social buttons (sin lógica).

## i18n integration

Añadir bloque `forgotPassword` en `en.ts` y `es.ts` siguiendo el patrón de `login`/`register` (objeto `as const`). El test `i18n-parity.test.ts` garantiza paridad de claves automáticamente.

```ts
forgotPassword: {
  eyebrow, title, email, emailPlaceholder, submit, submitting,
  successTitle, successBody, backToLogin, emailInvalid,
}
```

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `app/[lang]/(auth)/layout.tsx` | Create | Group layout: AuthDesktopShell + AuthMobileShell + brand panel; RSC |
| `app/[lang]/(auth)/forgot-password/page.tsx` | Create | Server page: dict + monta ForgotPasswordScreen en `<Suspense>` |
| `app/[lang]/(auth)/{login,register}/page.tsx` | Modify | Pasar nuevas keys i18n (mínimo) |
| `src/core/auth/presentation/components/auth-field.tsx` | Create | Input editorial + foco local + error |
| `src/core/auth/presentation/components/auth-head.tsx` | Create | Eyebrow + headline |
| `src/core/auth/presentation/components/auth-social.tsx` | Create | Botones sociales visuales + SVG inline Apple/Google |
| `src/core/auth/presentation/components/auth-divider.tsx` | Create | Separador "o" |
| `src/core/auth/presentation/components/auth-submit.tsx` | Create | Botón submit con estado pending |
| `src/core/auth/presentation/components/auth-legal.tsx` | Create | Texto legal/links |
| `src/core/auth/presentation/components/pw-strength.tsx` | Create | Barra fuerza + `getPwStrength` |
| `src/core/auth/presentation/components/auth-brand-panel.tsx` | Create | Panel forest + grain + logo + quote |
| `src/core/auth/presentation/components/auth-notebook.tsx` | Create | SVG inline decorativo |
| `src/core/auth/presentation/screens/login/login.screen.tsx` | Modify | Rediseño con átomos |
| `src/core/auth/presentation/screens/register/register.screen.tsx` | Modify | Rediseño + PwStrength |
| `src/core/auth/presentation/screens/forgot-password/forgot-password.screen.tsx` | Create | Screen client RHF + useForgotPassword |
| `src/core/auth/presentation/schemas/forgot-password.schema.ts` | Create | Zod `{ email }` |
| `src/core/auth/presentation/hooks/use-forgot-password/useForgotPassword.hook.ts` | Create | useMutation → use case |
| `src/core/auth/application/use-cases/forgot-password/forgot-password.use-case.ts` | Create | DI repo; void; traga 404 |
| `src/core/auth/application/use-cases/forgot-password/forgot-password.use-case.spec.ts` | Create | Test RED-first |
| `src/core/auth/application/ports/auth.repository.port.ts` | Modify | `forgotPassword(email: string): Promise<void>` |
| `src/core/auth/infrastructure/repositories/auth-http.repository.ts` | Modify | Impl POST /auth/forgot-password |
| `src/core/auth/presentation/i18n/{en,es}.ts` | Modify | Bloque `forgotPassword` (paridad) |
| `*.spec.ts` / componentes | Create | Tests Vitest co-ubicados (helper, hook, AuthField, PwStrength, AuthSubmit) |

## Open Questions

- Ninguna que bloquee. El contrato de `/auth/forgot-password` se asume y el 404 se maneja con éxito optimista; coordinar con backend antes de release.
