# Delta for auth

## ADDED Requirements

### Requirement: Post-Login Redirect to Home

The system MUST redirect authenticated users to `/${locale}/home` after login, not to `/` or `/${locale}`. `LoginScreen` MUST accept a `locale` prop (threaded from `login/page.tsx`) and use it to construct the redirect path. The fallback redirect inside `LoginScreen` MUST target `/${locale}/home`. The middleware MUST redirect already-authenticated users who reach an auth route to `/${locale}/home`.

#### Scenario: Successful login redirects to home

- GIVEN the user submits valid credentials on the login screen
- WHEN authentication succeeds
- THEN the browser navigates to `/${locale}/home` (not to `/` or `/${locale}`)

#### Scenario: Login screen fallback redirect uses locale

- GIVEN `LoginScreen` receives `locale="es"`
- WHEN the fallback redirect is triggered (no explicit return URL)
- THEN the redirect target is `/es/home`

#### Scenario: Middleware redirects authenticated user away from auth routes

- GIVEN a user is already authenticated (valid session cookie/token)
- WHEN the user navigates to `/${locale}/login` (or any auth route)
- THEN middleware redirects to `/${locale}/home` before the page renders

#### Scenario: Login page threads locale into LoginScreen

- GIVEN `app/[lang]/(auth)/login/page.tsx` resolves `lang` from params
- WHEN it renders `LoginScreen`
- THEN `locale` prop is passed with the resolved `lang` value

#### Scenario: Login screen test covers new redirect target

- GIVEN `login.screen.test.tsx` runs
- WHEN the redirect-after-login scenario executes
- THEN the test asserts the redirect target is `/${locale}/home`, not `/`
