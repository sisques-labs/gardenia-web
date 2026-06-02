# Spec: auth-redesign

## Summary

| Capability | Type | Description |
|---|---|---|
| `auth-ui` | New | Layout shells + 9 atomic components for the auth presentation layer |
| `forgot-password` | New | Full vertical slice: port → use case → schema → hook → screen |

No existing openspec/specs/ for the auth domain — both capabilities are written as full specs.

---

# auth-ui Specification

## Purpose

Visual redesign of the auth module's shared layout and atomic components. Replaces shadcn Card-based screens with Gardenia brand design: desktop split-column shell, mobile iPhone shell, and a set of editorial atomic components shared across login, register, and forgot-password screens.

## Requirements

### Requirement: Auth Layout Shells

The system MUST render a two-column desktop layout (`AuthDesktopShell`) and a single-column mobile iPhone-frame layout (`AuthMobileShell`) via the `(auth)/layout.tsx` route group. Layout selection MUST be viewport-driven (CSS or server-side breakpoint — not client JS state). Both shells MUST render the brand panel on one side and a slot for the auth form on the other. The group layout MUST NOT break providers defined in `app/[lang]/layout.tsx`.

#### Scenario: Desktop layout renders split columns

- GIVEN a viewport wider than the mobile breakpoint
- WHEN any auth route is visited (`/login`, `/register`, `/forgot-password`)
- THEN `AuthDesktopShell` is rendered with `AuthBrandPanel` visible on one column and the form slot on the other

#### Scenario: Mobile layout renders iPhone shell

- GIVEN a viewport at or below the mobile breakpoint
- WHEN any auth route is visited
- THEN `AuthMobileShell` is rendered wrapping the form; `AuthBrandPanel` is NOT visible

#### Scenario: Provider chain is preserved

- GIVEN providers registered in `app/[lang]/layout.tsx`
- WHEN the `(auth)` group layout wraps a route
- THEN all parent providers remain accessible to child components

---

### Requirement: AuthBrandPanel

The system MUST render a brand panel with: forest gradient background, grain overlay (`.paper-grain`), Gardenia logo, `AuthNotebook` SVG illustration, a fixed quote ("Planta algo. Riégalo. Míralo crecer."), and at least one OSS stat block. The panel MUST be purely decorative (no interactive elements, no logic).

#### Scenario: Brand panel renders all required elements

- GIVEN `AuthBrandPanel` is mounted
- WHEN the component renders
- THEN logo, `AuthNotebook`, quote text, and OSS stats are visible in the DOM

---

### Requirement: AuthNotebook SVG Illustration

The system MUST include an `AuthNotebook` component that renders an inline SVG of a tilted notebook with a tomato plant and ruled lines. The SVG MUST be self-contained (no external file fetch). It MUST be purely presentational and carry `aria-hidden="true"`.

#### Scenario: AuthNotebook renders inline and is hidden from accessibility tree

- GIVEN `AuthNotebook` is mounted
- WHEN the component renders
- THEN the SVG element is present in the DOM and has `aria-hidden="true"`

---

### Requirement: AuthField

The system MUST provide an `AuthField` component with: uppercase monospace label, left-side icon slot, text input, focus halo (forest token), error halo (terracotta token), show/hide toggle for `type="password"` inputs, and an inline error message with icon when an error string is provided. When no error is present the error message MUST NOT be rendered in the DOM.

#### Scenario: Password field toggles visibility

- GIVEN an `AuthField` with `type="password"` is rendered
- WHEN the user activates the show/hide toggle
- THEN the input's type switches between `"password"` and `"text"`

#### Scenario: Error state renders error message

- GIVEN an `AuthField` with a non-empty `error` prop
- WHEN the component renders
- THEN the error message and its icon are visible and the error halo is applied

#### Scenario: No error state renders no error message

- GIVEN an `AuthField` with no `error` prop (or empty string)
- WHEN the component renders
- THEN no error message element is present in the DOM

---

### Requirement: PwStrength

The system MUST render a password-strength indicator with 4 equal segments. Segment color MUST reflect strength level: 1 segment = terracotta, 2 = honey-2, 3 = forest-2, 4 = forest. A text label using `var(--hand)` MUST be shown alongside the segments. The component MUST accept a `strength` value (0–4) and derive all visual state from it.

#### Scenario: Four-segment indicator reflects strength level

- GIVEN `PwStrength` with `strength={2}`
- WHEN the component renders
- THEN 2 segments are filled (honey-2) and 2 remain unfilled

#### Scenario: Strength zero shows no filled segments

- GIVEN `PwStrength` with `strength={0}`
- WHEN the component renders
- THEN all 4 segments are unfilled

---

### Requirement: AuthSocial

The system MUST render 3 social login buttons: GitHub (lucide icon), Apple (inline SVG), Google (inline SVG). Each button MUST be visually complete but MUST NOT trigger any auth action. Buttons SHOULD carry an accessible `aria-disabled="true"` or `disabled` attribute and an accessible label indicating the feature is coming soon.

#### Scenario: Social buttons render without action

- GIVEN `AuthSocial` is mounted
- WHEN a social button is clicked
- THEN no navigation, API call, or state change occurs

#### Scenario: Apple and Google icons render inline

- GIVEN `AuthSocial` is mounted
- WHEN the component renders
- THEN Apple and Google SVG elements are present inline in the DOM (no `<img src>` for these icons)

---

### Requirement: AuthDivider

The system MUST render a horizontal rule with centered eyebrow text. It MUST accept a `label` prop and render it between two decorative lines.

#### Scenario: Divider renders with label

- GIVEN `AuthDivider` with `label="or"`
- WHEN the component renders
- THEN the label text is visible between two horizontal lines

---

### Requirement: AuthSubmit

The system MUST render a pill-shaped submit button using the forest token. It MUST accept `label`, `loading`, and `disabled` props. When `loading` is true the button MUST show a loading state and MUST be non-interactive. An icon MUST be displayed on the right side.

#### Scenario: Submit button is disabled during loading

- GIVEN `AuthSubmit` with `loading={true}`
- WHEN the component renders
- THEN the button element is disabled and shows a loading indicator

---

### Requirement: AuthLegal

The system MUST render legal disclaimer text at 11px, centered. It MUST accept the text as children or a `text` prop. It MUST be purely presentational.

#### Scenario: Legal text renders centered

- GIVEN `AuthLegal` with a text string
- WHEN the component renders
- THEN the text is visible and centered in the layout

---

### Requirement: AuthHead

The system MUST render a section header with: a small-caps green eyebrow, a serif italic headline, and a subtitle paragraph. All three strings MUST be accepted as props and rendered independently so any can be omitted.

#### Scenario: AuthHead renders all three text elements

- GIVEN `AuthHead` with `eyebrow`, `headline`, and `sub` props
- WHEN the component renders
- THEN all three text elements are visible in the DOM

#### Scenario: AuthHead renders with only headline

- GIVEN `AuthHead` with only `headline` prop
- WHEN the component renders
- THEN headline is visible; eyebrow and sub are NOT rendered in the DOM

---

### Requirement: Login Screen Redesign

The system MUST redesign the login screen to compose: `AuthHead`, `AuthSocial`, `AuthDivider`, `AuthField` (email), `AuthField` (password with show/hide), a "mantener sesión" checkbox, `AuthSubmit`, and a link to the register route. The "¿La olvidaste?" label MUST be an inline link in the password field label area that navigates to `/forgot-password`. On auth error the screen MUST display a banner with an attempt counter and apply the error halo to the relevant field.

#### Scenario: Successful login flow renders without error state

- GIVEN the login screen is mounted with no prior errors
- WHEN the component renders
- THEN no error banner is visible and all form fields show default (non-error) styling

#### Scenario: Error banner appears after failed login

- GIVEN the login screen receives an auth error
- WHEN the error state is set
- THEN a red banner is visible with the attempt count and the relevant field shows the error halo

#### Scenario: Forgot-password link navigates correctly

- GIVEN the login screen is rendered
- WHEN the user clicks "¿La olvidaste?" link
- THEN the browser navigates to the forgot-password route

---

### Requirement: Register Screen Redesign

The system MUST redesign the register screen to compose: `AuthHead`, `AuthSocial`, `AuthDivider`, `AuthField` (email), `AuthField` (password with show/hide and hint "Mínimo 8 caracteres."), `PwStrength`, a terms-of-service checkbox, `AuthSubmit`, a link to the login route, and `AuthLegal` at the bottom. The password hint MUST always be visible (not conditional on interaction).

#### Scenario: Register screen renders PwStrength alongside password field

- GIVEN the register screen is mounted
- WHEN the user types in the password field
- THEN `PwStrength` updates its segment fill to reflect the current password strength

#### Scenario: Password hint is always visible

- GIVEN the register screen is rendered
- WHEN no interaction has occurred
- THEN the "Mínimo 8 caracteres." hint text is visible

---

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
