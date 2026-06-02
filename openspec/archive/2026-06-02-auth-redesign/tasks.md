# Tasks: auth-redesign

## Review Workload Forecast

| Field | Value |
|-------|-------|
| Estimated changed lines | ~900–1 100 |
| 400-line budget risk | High |
| Chained PRs recommended | Yes |
| Suggested split | PR 1: vertical slice forgot-password (domain→screen) · PR 2: auth-ui redesign (shells + atoms + screens) |
| Delivery strategy | ask-on-risk |
| Chain strategy | chained-prs |

Decision needed before apply: Yes
Chained PRs recommended: Yes
Chain strategy: chained-prs (implemented as PR #67 + PR #68)
400-line budget risk: High

### Suggested Work Units

| Unit | Goal | PR | Notes |
|------|------|-------|-------|
| 1 | forgot-password vertical slice (port → infra → use case → schema → hook → screen → route → i18n keys) | PR #67 | Base: main. Fully self-contained; login/register screens untouched. |
| 2 | auth-ui redesign (shells, 9 atoms, redesigned login + register screens, (auth)/layout.tsx) | PR #68 | Base: PR #67 branch. Depends on i18n keys from PR #67. |

---

## Phase 1: Domain & Infrastructure (forgot-password slice)

- [x] 1.1 Add `forgotPassword(email: string): Promise<void>` to IAuthRepository port
- [x] 1.2 Implement `forgotPassword` in AuthHttpRepository — POST /auth/forgot-password
- [x] 1.3 RED spec for ForgotPasswordUseCase (2 scenarios)
- [x] 1.4 GREEN ForgotPasswordUseCase implementation
- [x] 1.5 RED+GREEN spec for auth-http.repository.forgotPassword (200→void, 500→throw)

## Phase 2: Schema & Hook (forgot-password slice)

- [x] 2.1 RED spec for forgotPasswordSchema (valid, empty, malformed)
- [x] 2.2 GREEN forgotPasswordSchema Zod + ForgotPasswordFormData type
- [x] 2.3 RED spec for useForgotPassword hook (loading→success, loading→error)
- [x] 2.4 GREEN useForgotPassword hook (useMutation wrapping ForgotPasswordUseCase)

## Phase 3: PwStrength Helper

- [x] 3.1 RED spec for getPwStrength helper
- [x] 3.2 GREEN getPwStrength(password): 0|1|2|3|4

## Phase 4: Atomic UI Components (9 atoms)

- [x] 4.1-4.2 AuthField (RED + GREEN)
- [x] 4.3-4.4 AuthHead (RED + GREEN)
- [x] 4.5-4.6 PwStrength (RED + GREEN)
- [x] 4.7-4.8 AuthSubmit (RED + GREEN)
- [x] 4.9-4.10 AuthDivider (RED + GREEN)
- [x] 4.11-4.12 AuthSocial (RED + GREEN)
- [x] 4.13-4.14 AuthLegal (RED + GREEN)
- [x] 4.15-4.16 AuthNotebook (RED + GREEN)
- [x] 4.17 AuthBrandPanel (no test, decorative)

## Phase 5: Layout Shells

- [x] 5.1 AuthDesktopShell
- [x] 5.2 AuthMobileShell
- [x] 5.3 (auth)/layout.tsx

## Phase 6: Forgot-Password Screen & Route

- [x] 6.1-6.2 ForgotPasswordScreen (RED + GREEN)
- [x] 6.3 app/[lang]/(auth)/forgot-password/page.tsx

## Phase 7: Login & Register Screen Redesign

- [x] 7.1-7.2 LoginScreen redesign (RED + GREEN)
- [x] 7.3 login/page.tsx verification
- [x] 7.4-7.5 RegisterScreen redesign (RED + GREEN)
- [x] 7.6 register/page.tsx verification

## Phase 8: i18n

- [x] 8.1 forgotPassword namespace added to en.ts
- [x] 8.2 forgotPassword namespace added to es.ts (tuteo)
- [x] 8.3 i18n-parity.test.ts covers forgotPassword keys

## Phase 9: Cleanup & Verification

- [x] 9.1 Remove shadcn Card imports from login/register
- [x] 9.2 tsc --noEmit: 0 errors
- [x] 9.3 pnpm vitest run: 103 tests GREEN
