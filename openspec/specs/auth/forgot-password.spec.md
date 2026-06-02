# forgot-password Specification

## Purpose

Full vertical slice enabling users to request a password reset link by email. Covers: repository port extension, HTTP implementation, Zod schema, use case, hook, and screen. The backend endpoint is assumed to exist; the UI handles optimistic success display.

## Requirements

### Requirement: IAuthRepository — forgotPassword Port

The system MUST add `forgotPassword(email: string): Promise<void>` to `IAuthRepository`. All existing repository methods MUST remain unchanged.

#### Scenario: Port method signature is added without breaking existing contract

- GIVEN `IAuthRepository` is extended with `forgotPassword`
- WHEN the existing implementations are checked
- THEN the TypeScript compiler reports no type errors on existing use cases

---

### Requirement: HTTP Repository Implementation

The system MUST implement `forgotPassword` in `auth-http.repository.ts` by sending `POST /auth/forgot-password` with body `{ email: string }`. The method MUST resolve `void` on 2xx. On non-2xx HTTP responses the method MUST throw a domain-appropriate error.

#### Scenario: Successful HTTP call resolves void

- GIVEN the HTTP mock returns 200
- WHEN `forgotPassword("user@example.com")` is called
- THEN the method resolves without a value

#### Scenario: HTTP error throws

- GIVEN the HTTP mock returns 500
- WHEN `forgotPassword("user@example.com")` is called
- THEN the method throws an error

---

### Requirement: Forgot-Password Zod Schema

The system MUST provide a Zod schema at `presentation/schemas/forgot-password.schema.ts` that validates: `email` is required and MUST be a valid email address format. The schema MUST export the inferred TypeScript type.

#### Scenario: Valid email passes validation

- GIVEN the forgot-password schema
- WHEN `{ email: "user@example.com" }` is parsed
- THEN validation succeeds and the inferred type is returned

#### Scenario: Missing email fails validation

- GIVEN the forgot-password schema
- WHEN `{ email: "" }` is parsed
- THEN validation fails with an error on the `email` field

#### Scenario: Malformed email fails validation

- GIVEN the forgot-password schema
- WHEN `{ email: "not-an-email" }` is parsed
- THEN validation fails with an error on the `email` field

---

### Requirement: ForgotPasswordUseCase

The system MUST provide `ForgotPasswordUseCase` in `application/use-cases/forgot-password/`. It MUST accept `IAuthRepository` via constructor injection. Its `execute(email: string): Promise<void>` method MUST call `repository.forgotPassword(email)` and return void. The use case MUST NOT handle i18n or UI state.

#### Scenario: Use case delegates to repository

- GIVEN `ForgotPasswordUseCase` is instantiated with a mock `IAuthRepository`
- WHEN `execute("user@example.com")` is called
- THEN `repository.forgotPassword("user@example.com")` is called exactly once

#### Scenario: Use case propagates repository errors

- GIVEN the mock repository throws on `forgotPassword`
- WHEN `execute("user@example.com")` is called
- THEN the use case propagates the error to the caller

---

### Requirement: useForgotPassword Hook

The system MUST provide `useForgotPassword` hook at `presentation/hooks/use-forgot-password/useForgotPassword.hook.ts`. It MUST return the `UseMutationResult` from `@tanstack/react-query` directly, exposing: `mutate(email: string)`, `isPending: boolean`, `isSuccess: boolean`, `error: Error | null`. On successful submission `isSuccess` MUST become `true`. On error `error` MUST be non-null. While the request is in flight `isPending` MUST be `true`.

#### Scenario: Hook transitions to loading then success

- GIVEN `useForgotPassword` is mounted and the use case resolves
- WHEN `mutate("user@example.com")` is called
- THEN `isPending` is `true` during the call and `isSuccess` is `true` after resolution

#### Scenario: Hook captures error state

- GIVEN `useForgotPassword` is mounted and the use case rejects
- WHEN `mutate("user@example.com")` is called
- THEN `isPending` returns to `false` and `error` is a non-null `Error` instance

---

### Requirement: Forgot-Password Screen

The system MUST provide `ForgotPasswordScreen` at `presentation/screens/forgot-password/forgot-password.screen.tsx`. It MUST compose: `AuthHead` (with i18n keys `forgotPassword.eyebrow`, `.title`, `.sub`), `AuthField` for email, `AuthSubmit`, an info box with text sourced from `forgotPassword.socialHint` i18n key, and a back link navigating to the login route sourced from `forgotPassword.backToLogin`. On success the form MUST be replaced by a success message composed from `forgotPassword.successTitle` and `forgotPassword.successBody`. The screen MUST be a `'use client'` component and MUST NOT contain inline business logic.

#### Scenario: Screen renders initial state with all required elements

- GIVEN `ForgotPasswordScreen` is mounted
- WHEN the component renders
- THEN `AuthHead`, email field, submit button, social hint box, and back link are visible

#### Scenario: Screen transitions to success state

- GIVEN the hook resolves successfully
- WHEN `isSuccess` becomes `true`
- THEN the form is replaced by the `successTitle` + `successBody` text and the form fields are not rendered

#### Scenario: Back link navigates to login

- GIVEN the screen is rendered
- WHEN the user clicks the back link
- THEN the browser navigates to the login route

---

### Requirement: i18n Keys — forgotPassword Namespace

The system MUST add a `forgotPassword` key namespace to both `en.ts` and `es.ts` in `src/core/auth/presentation/i18n/`. The namespace MUST include these keys with full parity across locales: `eyebrow`, `title`, `sub`, `email`, `emailPlaceholder`, `submit`, `submitting`, `successTitle`, `successBody`, `backToLogin`, `emailInvalid`, `socialHint`. The `i18n-parity.test.ts` MUST cover these new keys. Spanish copy MUST use Castellano de España (tuteo, no voseo).

#### Scenario: All forgotPassword keys exist in both locales

- GIVEN `en.ts` and `es.ts` are updated
- WHEN `i18n-parity.test.ts` runs
- THEN the test passes with no missing-key errors for the `forgotPassword` namespace

#### Scenario: Spanish copy uses correct variant

- GIVEN `es.ts` is written
- WHEN the `forgotPassword` keys are inspected
- THEN no voseo forms (vos/andá/revisá) appear; tuteo forms (tú/ve/revisa) are used
