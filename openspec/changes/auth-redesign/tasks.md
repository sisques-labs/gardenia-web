# Tasks: auth-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1 100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: vertical slice forgot-password (domain→screen) · PR 2: auth-ui redesign (shells + atoms + screens) |
| Delivery strategy | ask-on-risk |
| Chain strategy | pending |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: pending
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | Likely PR | Notes |
|------|------|-----------|-------|
| 1 | forgot-password vertical slice (port → infra → use case → schema → hook → screen → route → i18n keys) | PR 1 | Base: main. Fully self-contained; login/register screens untouched. |
| 2 | auth-ui redesign (shells, 9 atoms, redesigned login + register screens, (auth)/layout.tsx) | PR 2 | Base: PR 1 branch OR main after merge. Depends on i18n keys from PR 1. |

---

## Phase 1: Domain & Infrastructure (forgot-password slice)

- [ ] 1.1 Add `forgotPassword(email: string): Promise<void>` to `src/core/auth/domain/ports/auth.repository.port.ts`
- [ ] 1.2 Implement `forgotPassword` in `src/core/auth/infrastructure/auth-http.repository.ts` — POST `/auth/forgot-password`; treat 404/4xx-not-found as void; throw on 5xx/network errors
- [ ] 1.3 **RED** — write failing spec `src/core/auth/application/use-cases/forgot-password/forgot-password.use-case.spec.ts` (mock `IAuthRepository`, two scenarios: delegates call + propagates 5xx error)
- [ ] 1.4 **GREEN** — create `forgot-password.use-case.ts`; execute(email) calls `repository.forgotPassword(email)`, returns void
- [ ] 1.5 **RED** — write failing spec for `auth-http.repository` `forgotPassword` method (mock fetch: 200→void, 500→throw)

## Phase 2: Schema & Hook (forgot-password slice)

- [ ] 2.1 **RED** — write failing spec `src/core/auth/presentation/schemas/forgot-password.schema.spec.ts` (valid email, empty email, malformed email)
- [ ] 2.2 **GREEN** — create `src/core/auth/presentation/schemas/forgot-password.schema.ts`; Zod schema with email validation; export inferred type `ForgotPasswordFormData`
- [ ] 2.3 **RED** — write failing spec `src/core/auth/presentation/hooks/use-forgot-password/useForgotPassword.hook.spec.ts` (loading→success, loading→error transitions using `renderHook`)
- [ ] 2.4 **GREEN** — create `useForgotPassword.hook.ts`; `useMutation` wrapping `ForgotPasswordUseCase.execute`; exposes `mutate/isPending/isSuccess/error`

## Phase 3: PwStrength Helper (shared prerequisite for PR 2)

- [ ] 3.1 **RED** — write failing spec `src/core/auth/presentation/helpers/get-pw-strength.spec.ts` (input→0|1|2|3|4 table)
- [ ] 3.2 **GREEN** — create `src/core/auth/presentation/helpers/get-pw-strength.ts`; pure function `getPwStrength(password: string): 0|1|2|3|4`

## Phase 4: Atomic UI Components (9 atoms — each RED then GREEN)

- [ ] 4.1 **RED** — `auth-field.spec.tsx`: label renders, error halo + message, no-error → no message, password toggle switches type
- [ ] 4.2 **GREEN** — `src/core/auth/presentation/components/auth-field/auth-field.tsx` (`AuthFieldProps`: id, label, type, placeholder, error, registration)
- [ ] 4.3 **RED** — `auth-head.spec.tsx`: all three props render, only headline renders (eyebrow+sub absent from DOM)
- [ ] 4.4 **GREEN** — `auth-head/auth-head.tsx` (eyebrow, title, sub — each optional)
- [ ] 4.5 **RED** — `pw-strength.spec.tsx`: strength=2 → 2 filled segments; strength=0 → 0 filled
- [ ] 4.6 **GREEN** — `pw-strength/pw-strength.tsx` (derives level via `getPwStrength`; 4 segments with color tokens)
- [ ] 4.7 **RED** — `auth-submit.spec.tsx`: disabled+loading indicator when `isPending=true`
- [ ] 4.8 **GREEN** — `auth-submit/auth-submit.tsx` (label, loadingLabel, isPending; pill-shaped, forest token)
- [ ] 4.9 **RED** — `auth-divider.spec.tsx`: label visible between two rules
- [ ] 4.10 **GREEN** — `auth-divider/auth-divider.tsx` (label prop)
- [ ] 4.11 **RED** — `auth-social.spec.tsx`: 3 buttons render; Apple+Google SVGs inline (no `<img>`); click → no side effects
- [ ] 4.12 **GREEN** — `auth-social/auth-social.tsx` (GitHub lucide + AppleIcon + GoogleIcon inline SVG; aria-disabled)
- [ ] 4.13 **RED** — `auth-legal.spec.tsx`: children text centered
- [ ] 4.14 **GREEN** — `auth-legal/auth-legal.tsx` (children prop; 11px centered)
- [ ] 4.15 **RED** — `auth-notebook.spec.tsx`: SVG in DOM with `aria-hidden="true"`
- [ ] 4.16 **GREEN** — `auth-notebook/auth-notebook.tsx` (inline SVG; tilted notebook; aria-hidden; uses CSS tokens)
- [ ] 4.17 Create `auth-brand-panel/auth-brand-panel.tsx` (RSC; forest gradient, .paper-grain, logo, AuthNotebook, quote, OSS stats; no test — purely decorative static)

## Phase 5: Layout Shells

- [ ] 5.1 Create `src/core/auth/presentation/components/auth-desktop-shell/auth-desktop-shell.tsx` (RSC; `hidden lg:grid grid-cols-2`; left=AuthBrandPanel, right=children slot)
- [ ] 5.2 Create `src/core/auth/presentation/components/auth-mobile-shell/auth-mobile-shell.tsx` (RSC; `lg:hidden`; iPhone-frame wrapper; children slot only)
- [ ] 5.3 Create `app/[lang]/(auth)/layout.tsx` (RSC; renders `AuthDesktopShell` + `AuthMobileShell` side-by-side with CSS visibility; passes children through; wraps inside `[lang]/layout.tsx` without touching Providers)

## Phase 6: Forgot-Password Screen & Route

- [ ] 6.1 **RED** — `forgot-password.screen.spec.tsx`: initial elements visible (AuthHead, email field, submit, social hint, back link); success → form replaced by success message; back link points to login route
- [ ] 6.2 **GREEN** — `src/core/auth/presentation/screens/forgot-password/forgot-password.screen.tsx` (`'use client'`; RHF+zodResolver; composes AuthHead/AuthField/AuthSubmit/AuthLegal; uses `useForgotPassword`)
- [ ] 6.3 Create `app/[lang]/(auth)/forgot-password/page.tsx` (RSC; imports `ForgotPasswordScreen`; passes i18n dict)

## Phase 7: Login & Register Screen Redesign

- [ ] 7.1 **RED** — extend `login.screen.spec.tsx`: no error banner by default; error banner + attempt count on auth error; forgot-password link navigates to `/forgot-password`
- [ ] 7.2 **GREEN** — redesign `src/core/auth/presentation/screens/login/login.screen.tsx` (replace shadcn Card with AuthHead/AuthSocial/AuthDivider/AuthField×2/checkbox/AuthSubmit; inline forgot-password link in password label)
- [ ] 7.3 Update `app/[lang]/(auth)/login/page.tsx` — change import path if moved; ensure dict passed correctly
- [ ] 7.4 **RED** — extend `register.screen.spec.tsx`: PwStrength updates on password input; hint "Mínimo 8 caracteres." always visible
- [ ] 7.5 **GREEN** — redesign `src/core/auth/presentation/screens/register/register.screen.tsx` (compose AuthHead/AuthSocial/AuthDivider/AuthField×2/PwStrength/checkbox/AuthSubmit/AuthLegal)
- [ ] 7.6 Update `app/[lang]/(auth)/register/page.tsx` — same dict/import pass-through check

## Phase 8: i18n

- [ ] 8.1 Add `forgotPassword` namespace to `src/i18n/en.ts` (keys: eyebrow, title, email, emailPlaceholder, submit, submitting, successTitle, successBody, backToLogin, emailInvalid)
- [ ] 8.2 Add `forgotPassword` namespace to `src/i18n/es.ts` — Castellano de España (tuteo; no voseo); parity with en.ts
- [ ] 8.3 Verify `i18n-parity.test.ts` covers `forgotPassword` keys; extend if needed; run to confirm GREEN

## Phase 9: Cleanup & Wiring Verification

- [ ] 9.1 Remove any residual shadcn Card imports from login/register screens
- [ ] 9.2 Confirm TypeScript strict compile passes (`tsc --noEmit`) — no regressions on IAuthRepository implementors
- [ ] 9.3 Run full Vitest suite; confirm all new specs GREEN; no existing specs broken
